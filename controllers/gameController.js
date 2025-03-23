const axios = require('axios'); // Library for making HTTP requests
const User = require('../models/User'); // Import User model from database
const mongoose = require("mongoose"); // MongoDB library for ObjectId validation
const { fetchYouTubeVideo } = require('../services/youtubeService'); // Import YouTube service
const Game = require("../models/Game"); // Import Game model
const Rating = require('../models/Rating'); // Import Rating model
require('dotenv').config(); // Load environment variables

const RAWG_API_KEY = process.env.RAWG_API_KEY; // API Key for RAWG API
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // API Key for YouTube

// ✅ Store names mapping
const STORE_NAMES = {
    1: "Steam",
    2: "Microsoft Store",
    3: "PlayStation Store",
    4: "App Store",
    5: "GOG",
    6: "Nintendo Store",
    7: "Xbox Store",
    8: "Google Play",
    9: "Epic Games Store", // ✅ Epic Games Store (previous known ID)
    11: "Epic Games Store" // ✅ Another possible ID for Epic Games Store
};

/**
 * Fetches a list of games from RAWG API for the explore page.
 * - Retrieves game data and displays it on the explore page.
 * - Handles both JSON responses and EJS page rendering.
 */
exports.getExploreGames = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get current page, default to 1
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: { key: RAWG_API_KEY, page_size: 12, page: page }
        });

        // Map the fetched games into a cleaner format
        const games = response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image || "https://via.placeholder.com/200x300?text=No+Image"
        }));

        console.log("🔍 Current User in explore:", req.user); // Debugging user info

        // ✅ If it's an AJAX request, return JSON instead of rendering a page
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ games });
        }

        // Render the explore page with game data
        res.render("explore", { games, user: req.user || null });

    } catch (error) {
        console.error("❌ Error fetching games from RAWG:", error);
        res.status(500).json({ error: "Error fetching games" });
    }
};


// better function (for saving games requires better youtube api )
// exports.getExploreGames = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; // Get current page, default to 1

//         // ✅ Fetch games from RAWG API first
//         const response = await axios.get(`https://api.rawg.io/api/games`, {
//             params: { key: RAWG_API_KEY, page_size: 12, page: page }
//         });

//         let games = await Promise.all(response.data.results.map(async (gameData) => {
//             // ✅ Use getGameInfo to check and save the game
//             let game = await exports.getGameInfo(gameData.id);

//             // ✅ Return formatted game object
//             return {
//                 id: game.rawgId,
//                 name: game.name,
//                 image: game.image || "https://via.placeholder.com/200x300?text=No+Image",
//                 rating: game.averageRating || "N/A"
//             };
//         }));

//         console.log("🔍 Current User in explore:", req.user); // Debugging user info

//         // ✅ If it's an AJAX request, return JSON instead of rendering a page
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             return res.json({ games });
//         }

//         // ✅ Render the explore page with game data
//         res.render("explore", { games, user: req.user || null });

//     } catch (error) {
//         console.error("❌ Error fetching games from RAWG:", error);
//         res.status(500).json({ error: "Error fetching games" });
//     }
// };
/**
 * Fetches detailed game information from RAWG API.
 * - Retrieves game data, trailer, gameplay, and store links.
 * - Updates the user's last viewed games if logged in.
 */


exports.getGameInfo = async (gameId, userId) => {
    try {
        // ✅ Check if game exists in your database
        let game = await Game.findOne({ rawgId: gameId });

        if (game) {
            console.log(`✅ Game found in database: ${game.name}`);
        } else {
            console.log(`🔍 Game not found in database. Fetching from RAWG API...`);

            // ✅ Fetch game details from RAWG API
            const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
                params: { key: RAWG_API_KEY }
            });

            if (!response.data || !response.data.id) {
                console.error(`❌ Game not found for ID: ${gameId}`);
                return null;
            }

            const gameData = response.data;

            // ✅ Fetch Trailer & Gameplay from YouTube
            console.log(`🎥 Fetching YouTube trailer and gameplay for "${gameData.name}"...`);
            const trailer = await fetchYouTubeVideo(gameData.name, "trailer");
            const gameplay = await fetchYouTubeVideo(gameData.name, "gameplay");

            // ✅ Fetch Store Links from RAWG API
            const storeResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/stores`, {
                params: { key: RAWG_API_KEY }
            });

            const storeLinks = storeResponse.data.results.map(store => ({
                name: store.store?.name || "Unknown Store",
                url: store.url
            }));

            // ✅ Construct new game object for database
            game = new Game({
                rawgId: gameData.id,
                name: gameData.name || "Unknown Game",
                description: gameData.description_raw || "No description available.",
                genre: gameData.genres?.map(g => g.name).join(", ") || "Unknown",
                image: gameData.background_image || "/images/no-image.jpg",
                trailer: trailer || null,
                gameplay: gameplay || null,
                stores: storeLinks.length > 0 ? storeLinks : [],
            });

            await game.save(); // ✅ Save the game in the database
            console.log(`✅ Game saved in database: ${game.name}`);
        }

        // ✅ Update last viewed games for logged-in user
        if (userId) {
            console.log(`🔄 Updating last viewed games for user: ${userId}`);

            if (mongoose.Types.ObjectId.isValid(userId)) {
                const user = await User.findById(userId);
                if (user) {
                    let lastGames = user.lastVisitedGames || [];
                    lastGames = lastGames.filter(id => id !== game.rawgId); // Remove duplicates
                    lastGames.unshift(game.rawgId); // Add new game at the start
                    lastGames = lastGames.slice(0, 5); // Keep only last 5 games

                    await User.findByIdAndUpdate(userId, { lastVisitedGames: lastGames });
                    console.log(`✅ Last viewed games updated for ${user.username}`);
                }
            }
        }

        return game;

    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        return null;
    }
};



/**
 * Renders the game information page.
 * - Determines the previous page to set the back button.
 * - Fetches game details from RAWG API.
 * - Updates the user's last viewed games if logged in.
 */




exports.renderGameInfo = async (req, res) => {
    try {
        const referer = req.headers.referer;
        let backPage = "explore"; // Default back button destination

        if (referer) {
            if (referer.endsWith("/")) backPage = "home";
            if (referer.includes("/games/explore")) backPage = "explore";
        }

        const userId = req.user && req.user._id ? req.user._id : null;
        console.log(`🔄 User ${userId ? userId : "Guest"} is viewing game ID: ${req.params.id}`);

        // ✅ Fetch game details (either from DB or RAWG API)
        const game = await exports.getGameInfo(req.params.id, userId);

        if (!game) {
            return res.status(404).render('game-info', { game: null, referer: backPage, averageRating: 0 });
        }

        // ✅ Fetch ratings from `RatingSchema`
        const ratings = await Rating.find({ game: game._id });

        // ✅ Calculate Average Rating dynamically
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) 
            : 0;

        // ✅ Render the game-info page with the fetched data
        res.render('game-info', { game, referer: backPage, averageRating });

    } catch (error) {
        console.error("❌ Error rendering game info:", error);
        res.status(500).render('game-info', { game: null, referer: "explore", averageRating: 0 });
    }
};



/**
 * Fetches the available store links for a game from RAWG API.
 * - Retrieves game store purchase links from RAWG API.
 * - Maps store IDs to human-readable names.
 */
exports.getGameStores = async (req, res) => {
    try {
        const { id } = req.params; // Extract game ID from URL

        // ✅ Fetch game details (for the name)
        const response = await axios.get(`https://api.rawg.io/api/games/${id}`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        const gameData = response.data; // Store game information

        // ✅ Fetch available store links for the game
        const storeResponse = await axios.get(`https://api.rawg.io/api/games/${id}/stores`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        // ✅ Extract store links and map store_id to human-readable names
        const storeLinks = storeResponse.data.results.map(store => ({
            name: STORE_NAMES[store.store_id] || "Unknown Store", // Convert store ID to store name
            url: store.url // Store purchase link
        }));

        // ✅ Render the game-stores page with store data
        res.render('game-stores', { game: { name: gameData.name, stores: storeLinks } });

    } catch (error) {
        console.error("❌ Error fetching store links:", error);
        res.status(500).send("Error fetching store links");
    }
};

/**
 * Fetches the most popular games from RAWG API.
 * - Retrieves the most popular games based on number of additions.
 * - Returns a list of games with name, ID, image, and rating.
 */
exports.getPopularGames = async () => {
    try {
        // ✅ Fetch the most popular games
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY, // Use RAWG API key
                ordering: "-added", // Sort by most added games
                page_size: 12 // Limit the number of results
            }
        });

        // ✅ Process and return the game list
        return response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image,
            rating: game.rating
        }));

    } catch (error) {
        console.error("❌ Error fetching popular games:", error);
        return []; // Return an empty array in case of an error
    }
};
