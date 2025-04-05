const axios = require('axios');
const Rating = require('../models/Rating');
const Game = require('../models/Game');
const { getGameRecommendations, getRecommendationsFromReviews } = require('../services/geminiService');
const { getGameInfo } = require('./gameController');
const RAWG_API_KEY = process.env.RAWG_API_KEY;


getUserPreferences = async (userId) => {
    const ratings = await Rating.find({ user: userId }).populate('game');
    if (!ratings.length) return null;

    const genreStats = {};
    let totalRating = 0;
    let totalHours = 0;

    ratings.forEach(r => {
        const genres = r.game?.genre?.split(',').map(g => g.trim()) || [];
        if (genres.length === 0) return;

        genres.forEach(genre => {
            if (!genreStats[genre]) genreStats[genre] = { total: 0, count: 0 };
            genreStats[genre].total += r.rating;
            genreStats[genre].count++;
        });

        totalRating += r.rating;
        totalHours += r.playedHours;
    });

    const favoriteGenres = Object.entries(genreStats)
        .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))
        .slice(0, 3)
        .map(([genre]) => genre);

    return {
        favoriteGenres,
        avgRating: totalRating / ratings.length,
        avgHours: totalHours / ratings.length
    };
};


exports.getRecommendations = async (req, res) => {
    try {
        if (!req.user) {
            console.warn("❌ Unauthorized request to recommendations.");
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        console.log(`✅ Fetching recommendations for user: ${req.user.username} (${req.user._id})`);

        const userRatings = await Rating.find({ user: req.user._id }).populate('game');
        console.log(`🔢 Total ratings by user: ${userRatings.length}`);

        if (!userRatings || userRatings.length === 0) {
            console.log("ℹ️ User has no ratings. Skipping AI recommendations.");
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "🎮 דרג משחקים כדי לקבל המלצות!"
            });
        }

        // ✅ Extract and ensure game names from DB or RAWG if missing
        const ratedGameNames = [];

        for (const rating of userRatings) {
            let game = rating.game;

            if (!game) {
                console.warn(`⚠️ Game not found in DB for rating ${rating._id}. Fetching from RAWG...`);
                game = await getGameInfo(rating._id); // או שמור rawgId ברייטינג כדי להיות מדויק יותר
            }

            if (game && game.name) {
                ratedGameNames.push(game.name);
            } else {
                console.warn(`⚠️ Skipping rating ${rating._id}, no game name found.`);
            }
        }

        console.log("🔍 User's Rated Game Names:", ratedGameNames);

        if (ratedGameNames.length === 0) {
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "⚠️ לא הצלחנו לשלוף את שמות המשחקים שדירגת. נסה שוב מאוחר יותר."
            });
        }

        const prefs = await getUserPreferences(req.user._id);
        console.log("🎯 User Preferences:", prefs);

        // ✅ AI recommendations from Gemini
        let geminiRecommendations = [];
        let aiMessage = "🎯 הנה משחקים שאולי תאהב!";

        try {
            const response = await getGameRecommendations(ratedGameNames, 12, prefs); // ✅ שדרוג: העברת העדפות
            console.log("🔍 Gemini API Response:", response);

            if (Array.isArray(response)) {
                geminiRecommendations = response;
                aiMessage = "🤖 We found recommendations for you !";
            } else {
                console.warn("⚠️ Unexpected Gemini API response format:", response);
            }
        } catch (error) {
            console.error("❌ Gemini API Error:", error);
        }
        if (geminiRecommendations.length > 0) {
            console.log("📦 Fetching RAWG data for Gemini recommendations...");

            // ✅ NEW METHOD - USE getGameInfo TO FETCH AND SAVE TO DB
            const gameDetails = await Promise.all(
                geminiRecommendations.map(async (game) => {
                    try {
                        // ננסה לחפש ב-RAWG לפי שם, כדי לקבל את ה-ID (rawgId)
                        const search = await axios.get(`https://api.rawg.io/api/games`, {
                            params: { key: RAWG_API_KEY, search: game.name, page_size: 1 }
                        });

                        const rawgGame = search.data.results[0];
                        if (!rawgGame || !rawgGame.id) {
                            console.warn(`⚠️ No RAWG match found for ${game.name}`);
                            return { name: game.name, image: "/images/default-game.png" };
                        }

                        // 🔁 נשתמש ב-getGameInfo כדי גם להביא וגם לשמור את המשחק
                        // בתוך map(async (game) => { ... })
                        // 🔁 נשתמש ב-getGameInfo כדי גם להביא וגם לשמור את המשחק
                        const fullGame = await getGameInfo(rawgGame.id);

                        // ✅ Create reason for recommendation
                        let reason = "";
                        const gameGenres = fullGame.genre?.split(',').map(g => g.trim()) || [];
                        const matchedGenres = gameGenres.filter(g => prefs?.favoriteGenres.includes(g));
                        const hasPlaytime = fullGame.playtime && fullGame.playtime > 0;
                        const matchedTime = prefs?.avgHours && hasPlaytime && Math.abs(fullGame.playtime - prefs.avgHours) <= 10;

                        if (matchedGenres.length > 0 && matchedTime) {
                            reason = `🎯 Based on your interest in ${matchedGenres.join(', ')} and playtime (${fullGame.playtime}h) close to your average (${prefs.avgHours.toFixed(1)}h).`;
                        } else if (matchedGenres.length > 0) {
                            reason = `🎮 Based on your interest in ${matchedGenres.join(', ')} games.`;
                        } else if (matchedTime) {
                            reason = `🕓Recommended because Playtime (${fullGame.playtime}h) is close to your usual average (${prefs.avgHours.toFixed(1)}h).`;
                        } else if (!fullGame.genre || fullGame.genre === "Unknown") {
                            reason = `🕵️‍♂️ Recommended even though this game lacks genre info.`;
                        } else if (!hasPlaytime) {
                            reason = `⏳ Recommended – no playtime data was found for this game.`;
                        } else {
                            reason = `🤖 Recommended based on overall similarity to games you've rated.`;
                        }


                        return {
                            id: fullGame.rawgId,
                            name: fullGame.name,
                            image: fullGame.image,
                            genre: fullGame.genre || "Unknown",
                            playtime: fullGame.playtime || null,
                            reason
                        };



                    } catch (err) {
                        console.error(`❌ Error processing recommendation ${game.name}:`, err.message);
                        return { name: game.name, image: "/images/default-game.png" };
                    }
                })
            );


            return res.render('quickrecommendations', { recommendations: gameDetails, aiMessage });
        }

        // ✅ Fallback to RAWG popular games
        console.log("🔄 Falling back to top-rated games from RAWG...");

        const fallback = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY,
                ordering: "-rating",
                page_size: 12
            }
        });

        const fallbackRecommendations = fallback.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image
        }));

        console.log("✅ Fallback recommendations ready.");

        return res.render('quickrecommendations', {
            recommendations: fallbackRecommendations,
            aiMessage: "🔍 מצאנו עבורך משחקים פופולריים!"
        });

    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
        return res.status(500).render('quickrecommendations', {
            recommendations: [],
            aiMessage: "❌ שגיאה בהמלצות. נסה שוב מאוחר יותר."
        });
    }
};

exports.getReviewBasedRecommendations = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const userRatings = await Rating.find({ user: req.user._id }).populate('game');

        const recommendations = await getRecommendationsFromReviews(userRatings);

        const aiMessage = recommendations.length
            ? "💬 Recommendations based on what you wrote in your reviews!"
            : "💬 You need to write reviews to get this kind of recommendation.";

        return res.render('reviewsRecommendations', {
            recommendations,
            aiMessage
        });

    } catch (err) {
        console.error("❌ Error in review-based recommendations:", err);
        return res.status(500).render('reviewsRecommendations', {
            recommendations: [],
            aiMessage: "❌ Error generating recommendations from reviews."
        });
    }
};

exports.recommendationsHub = async (req, res) => {
    const ratings = await Rating.find({ user: req.user._id }).populate('game');

const genreStats = {};
ratings.forEach(r => {
  const genre = r.game?.genre;
  if (!genre) return;
  if (!genreStats[genre]) genreStats[genre] = { total: 0, count: 0 };
  genreStats[genre].total += r.rating;
  genreStats[genre].count++;
});

const genreData = Object.entries(genreStats).map(([genre, stats]) => ({
  genre,
  avgRating: (stats.total / stats.count).toFixed(2)
}));

res.render("recommendationsHub", {
  genreData, // 🔥 זה בשביל הגרף
  user: req.user
});

};


