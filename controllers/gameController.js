const axios = require('axios');
const User = require('../models/User');
const { fetchYouTubeVideo } = require('../services/youtubeService'); // ✅ Import the YouTube service
require('dotenv').config();

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


const RAWG_API_KEY = process.env.RAWG_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

exports.getExploreGames = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: process.env.RAWG_API_KEY,
                page_size: 12,
                page: page
            }
        });

        const games = response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image || "https://via.placeholder.com/200x300?text=No+Image"
        }));

        console.log("🔍 Current User in explore:", req.user); // Debugging

        // ✅ If it's an AJAX request, return JSON instead of rendering a page
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ games });
        }

        res.render("explore", { games, user: req.user || null });
    } catch (error) {
        console.error("❌ Error fetching games from RAWG:", error);
        res.status(500).json({ error: "Error fetching games" });
    }
};


const mongoose = require("mongoose");

exports.getGameInfo = async (gameId, userId) => {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
            params: { key: RAWG_API_KEY }
        });

        if (!response.data || !response.data.id) {
            console.error(`❌ Game not found for ID: ${gameId}`);
            return null;
        }

        const gameData = response.data;

        console.log(`🔍 Fetching YouTube trailer and gameplay for "${gameData.name}"...`);
        const trailer = await fetchYouTubeVideo(gameData.name, "trailer");
        const gameplay = await fetchYouTubeVideo(gameData.name, "gameplay");

        const storeResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/stores`, {
            params: { key: RAWG_API_KEY }
        });

        const storeLinks = storeResponse.data.results.map(store => ({
            name: store.store?.name || "Unknown Store",
            url: store.url
        }));

        const game = {
            id: gameData.id,
            name: gameData.name || "Unknown Game",
            description: gameData.description_raw || "No description available.",
            genre: gameData.genres?.map(g => g.name).join(", ") || "Unknown",
            averageRating: gameData.rating || "N/A",
            image: gameData.background_image || "/images/no-image.jpg",
            trailer: trailer || null,
            gameplay: gameplay || null,
            stores: storeLinks.length > 0 ? storeLinks : null
        };

        // ✅ Log userId status
        if (!userId) {
            console.warn(`⚠️ No valid userId provided, skipping last viewed games update.`);
            return game;
        }

        console.log(`🔄 Attempting to update last viewed games for user: ${userId}`);

        // ✅ Ensure `userId` is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.warn(`⚠️ Invalid userId: ${userId}, skipping last viewed games update.`);
            return game;
        }

        // ✅ Find the user and update last viewed games
        const user = await User.findById(userId);
        if (user) {
            console.log(`✅ User found: ${user.username}. Current last viewed games:`, user.lastVisitedGames);

            let lastGames = user.lastVisitedGames || [];

            // ✅ Remove duplicate game entries
            lastGames = lastGames.filter(id => id !== game.id);

            // ✅ Add the new game at the start
            lastGames.unshift(game.id);

            // ✅ Keep only the last 5 games
            lastGames = lastGames.slice(0, 5);

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { lastVisitedGames: lastGames },
                { new: true }
            );

            console.log(`✅ Last viewed games updated for ${user.username}:`, updatedUser.lastVisitedGames);
        } else {
            console.warn(`⚠️ User not found in DB. Could not update last viewed games.`);
        }

        return game;

    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        return null;
    }
};


exports.renderGameInfo = async (req, res) => {
    try {
        const referer = req.headers.referer;
        let backPage = "explore"; // Default back button page

        if (referer) {
            if (referer.endsWith("/")) backPage = "home";
            if (referer.includes("/games/explore")) backPage = "explore";
        }

        // ✅ Ensure userId is extracted correctly
        const userId = req.user && req.user.userId ? req.user.userId : null;

        console.log(`🔄 User ${userId ? userId : "Guest"} is viewing game ID: ${req.params.id}`);

        // ✅ Fetch game info and track last viewed games
        const game = await exports.getGameInfo(req.params.id, userId);

        res.render('game-info', { game, referer: backPage });

    } catch (error) {
        console.error("❌ Error rendering game info:", error);
        res.status(500).render('game-info', { game: null, referer: "explore" });
    }
};



exports.getGameStores = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch game details (for the name)
        const response = await axios.get(`https://api.rawg.io/api/games/${id}`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        const gameData = response.data;

        // Fetch store links
        const storeResponse = await axios.get(`https://api.rawg.io/api/games/${id}/stores`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        // Extract store links and map store_id to readable name
        const storeLinks = storeResponse.data.results.map(store => ({
            name: STORE_NAMES[store.store_id] || "Unknown Store", // ✅ Fix: Use mapped store name
            url: store.url
        }));

        res.render('game-stores', { game: { name: gameData.name, stores: storeLinks } });

    } catch (error) {
        console.error("❌ Error fetching store links:", error);
        res.status(500).send("Error fetching store links");
    }
};


exports.getPopularGames = async () => {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY,
                ordering: "-added",
                page_size: 12
            }
        });

        return response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image,
            rating: game.rating
        }));
    } catch (error) {
        console.error("❌ Error fetching popular games:", error);
        return [];
    }
};

