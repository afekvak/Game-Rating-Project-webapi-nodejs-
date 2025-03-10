const axios = require('axios');
const Rating = require('../models/Rating');
const { getGameRecommendations } = require('../services/geminiService');
const RAWG_API_KEY = process.env.RAWG_API_KEY;

exports.getRecommendations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const userRatings = await Rating.find({ user: req.user._id });

        if (!userRatings || userRatings.length === 0) {
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "🎮 דרג משחקים כדי לקבל המלצות מותאמות אישית!"
            });
        }

        const ratedGameNames = await Promise.all(
            userRatings.map(async (rating) => {
                try {
                    const response = await axios.get(`https://api.rawg.io/api/games/${rating.gameId}`, {
                        params: { key: RAWG_API_KEY }
                    });
                    return response.data.name;
                } catch (error) {
                    console.error("⚠️ Error fetching game name:", error.message);
                    return null; // Skip game if API fails
                }
            })
        );

        const validRatedGames = ratedGameNames.filter(name => name !== null);
        console.log("🔍 User's Rated Games:", validRatedGames);

        if (validRatedGames.length === 0) {
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "⚠️ לא הצלחנו לשלוף את שמות המשחקים שדירגת. נסה שוב מאוחר יותר."
            });
        }

        // ✅ Fetch recommendations from Gemini API
        let geminiRecommendations = [];
        let aiMessage = "🎯 כאן המשחקים שאולי תאהב!";

        try {
            const response = await getGameRecommendations(validRatedGames, 12);
            console.log("🔍 Gemini API Response:", response); // Log full response for debugging

            // Ensure response has recommendations
            // ✅ Correctly handle Gemini API response as an array
if (Array.isArray(response)) {
    geminiRecommendations = response; // Assigns the array directly
    aiMessage = "🤖 AI Recommender found games you might like!";
} else {
    console.warn("⚠️ Unexpected Gemini API response format:", response);
}

        } catch (error) {
            console.error("❌ Gemini API Error:", error);
        }

        if (geminiRecommendations.length === 0) {
            console.warn("⚠️ No valid Gemini recommendations found. Falling back to RAWG.");
        }

        if (geminiRecommendations.length > 0) {
            // ✅ Fetch game images from RAWG API
            const gameDetails = await Promise.all(
                geminiRecommendations.map(async (game) => {
                    try {
                        const response = await axios.get(`https://api.rawg.io/api/games`, {
                            params: { key: RAWG_API_KEY, search: game.name, page_size: 1 }
                        });

                        const gameData = response.data.results[0];

                        return {
                            id: gameData?.id || null,
                            name: game.name,
                            image: gameData?.background_image || "/images/default-game.png"
                        };
                    } catch (err) {
                        console.error(`⚠️ Error fetching RAWG data for ${game.name}:`, err.message);
                        return { name: game.name, image: "/images/default-game.png" };
                    }
                })
            );

            return res.render('recommendations', { recommendations: gameDetails, aiMessage });
        }

        // 🔹 Fallback Recommendation if Gemini fails
        console.log("🔄 Using fallback recommendations...");
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY,
                ordering: "-rating",
                page_size: 12
            }
        });

        const fallbackRecommendations = response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image
        }));

        return res.render('recommendations', {
            recommendations: fallbackRecommendations,
            aiMessage: "🔍 מצאנו עבורך משחקים פופולריים!"
        });

    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
        res.status(500).render('recommendations', {
            recommendations: [],
            aiMessage: "❌ שגיאה בהמלצות. נסה שוב מאוחר יותר."
        });
    }
};
