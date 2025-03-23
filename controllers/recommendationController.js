const axios = require('axios');
const Rating = require('../models/Rating');
const Game = require('../models/Game');
const { getGameRecommendations } = require('../services/geminiService');
const { getGameInfo } = require('./gameController');
const RAWG_API_KEY = process.env.RAWG_API_KEY;

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

        // ✅ AI recommendations from Gemini
        let geminiRecommendations = [];
        let aiMessage = "🎯 הנה משחקים שאולי תאהב!";

        try {
            const response = await getGameRecommendations(ratedGameNames, 12);
            console.log("🔍 Gemini API Response:", response);

            if (Array.isArray(response)) {
                geminiRecommendations = response;
                aiMessage = "🤖 מצאנו עבורך המלצות מותאמות!";
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
                        const fullGame = await getGameInfo(rawgGame.id);

                        return {
                            id: fullGame.rawgId,
                            name: fullGame.name,
                            image: fullGame.image
                        };
                    } catch (err) {
                        console.error(`❌ Error processing recommendation ${game.name}:`, err.message);
                        return { name: game.name, image: "/images/default-game.png" };
                    }
                })
            );


            return res.render('recommendations', { recommendations: gameDetails, aiMessage });
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

        return res.render('recommendations', {
            recommendations: fallbackRecommendations,
            aiMessage: "🔍 מצאנו עבורך משחקים פופולריים!"
        });

    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
        return res.status(500).render('recommendations', {
            recommendations: [],
            aiMessage: "❌ שגיאה בהמלצות. נסה שוב מאוחר יותר."
        });
    }
};
