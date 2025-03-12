// ✅ Import required modules
const axios = require('axios'); // Import Axios for making HTTP requests
const Rating = require('../models/Rating'); // Import the Rating model to interact with the database
const { getGameRecommendations } = require('../services/geminiService'); // Import AI-based recommendation service
const RAWG_API_KEY = process.env.RAWG_API_KEY; // Retrieve the RAWG API key from environment variables

// ✅ Function to fetch game recommendations
exports.getRecommendations = async (req, res) => {
    try {
        // ✅ Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." }); // Return 401 if user is not logged in
        }

        // ✅ Fetch all game ratings given by the user
        const userRatings = await Rating.find({ user: req.user._id });

        // ✅ If the user has not rated any games, show an empty recommendation page
        if (!userRatings || userRatings.length === 0) {
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "🎮 Rate some games to get recommendations!" // Message in Hebrew: "Rate games to get personalized recommendations!"
            });
        }

        // ✅ Extract game names from the user's rated games
        const ratedGameNames = await Promise.all(
            userRatings.map(async (rating) => {
                try {
                    // Fetch game details from RAWG API using the game ID stored in the rating document
                    const response = await axios.get(`https://api.rawg.io/api/games/${rating.gameId}`, {
                        params: { key: RAWG_API_KEY }
                    });
                    return response.data.name; // Return the game's name
                } catch (error) {
                    console.error("⚠️ Error fetching game name:", error.message);
                    return null; // Return null if the request fails
                }
            })
        );

        // ✅ Filter out any null values (failed API requests)
        const validRatedGames = ratedGameNames.filter(name => name !== null);
        console.log("🔍 User's Rated Games:", validRatedGames);

        // ✅ If no valid games are found, show a fallback message
        if (validRatedGames.length === 0) {
            return res.render('recommendations', {
                recommendations: [],
                aiMessage: "⚠️ לא הצלחנו לשלוף את שמות המשחקים שדירגת. נסה שוב מאוחר יותר." // "We couldn't retrieve your rated games. Try again later."
            });
        }

        // ✅ Fetch AI-based recommendations using the Gemini service
        let geminiRecommendations = [];
        let aiMessage = "🎯 כאן המשחקים שאולי תאהב!"; // "Here are games you might like!"

        try {
            // Get AI-generated game recommendations based on the user's rated games
            const response = await getGameRecommendations(validRatedGames, 12);
            console.log("🔍 Gemini API Response:", response); // Log the full response for debugging

            // ✅ Ensure the response is an array before assigning it
            if (Array.isArray(response)) {
                geminiRecommendations = response; // Assign the response array directly
                aiMessage = "🤖 AI Recommender found games you might like!";
            } else {
                console.warn("⚠️ Unexpected Gemini API response format:", response);
            }
        } catch (error) {
            console.error("❌ Gemini API Error:", error);
        }

        // ✅ If the AI service fails, log the fallback usage
        if (geminiRecommendations.length === 0) {
            console.warn("⚠️ No valid Gemini recommendations found. Falling back to RAWG.");
        }

        // ✅ If AI recommendations exist, fetch their images from RAWG API
        if (geminiRecommendations.length > 0) {
            const gameDetails = await Promise.all(
                geminiRecommendations.map(async (game) => {
                    try {
                        // Search for the game in RAWG API to fetch its image
                        const response = await axios.get(`https://api.rawg.io/api/games`, {
                            params: { key: RAWG_API_KEY, search: game.name, page_size: 1 }
                        });

                        const gameData = response.data.results[0]; // Retrieve the first search result

                        return {
                            id: gameData?.id || null, // Store the game ID if available
                            name: game.name, // Keep the game name from the AI recommendation
                            image: gameData?.background_image || "/images/default-game.png" // Use default image if none found
                        };
                    } catch (err) {
                        console.error(`⚠️ Error fetching RAWG data for ${game.name}:`, err.message);
                        return { name: game.name, image: "/images/default-game.png" }; // Provide fallback game image
                    }
                })
            );

            return res.render('recommendations', { recommendations: gameDetails, aiMessage });
        }

        // 🔹 Fallback Recommendation if Gemini API fails
        console.log("🔄 Using fallback recommendations...");
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY,
                ordering: "-rating", // Fetch top-rated games
                page_size: 12 // Limit results to 12 games
            }
        });

        // ✅ Map the fetched games to return necessary details
        const fallbackRecommendations = response.data.results.map(game => ({
            id: game.id, // Store game ID
            name: game.name, // Store game name
            image: game.background_image // Store game image URL
        }));

        // ✅ Render the recommendations page with the fallback list
        return res.render('recommendations', {
            recommendations: fallbackRecommendations,
            aiMessage: "🔍 מצאנו עבורך משחקים פופולריים!" // "We found popular games for you!"
        });

    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
        res.status(500).render('recommendations', {
            recommendations: [],
            aiMessage: "❌ שגיאה בהמלצות. נסה שוב מאוחר יותר." // "Error in recommendations. Try again later."
        });
    }
};
