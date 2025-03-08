const axios = require('axios');
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


exports.getGameInfo = async (gameId) => {
    try {
        const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        const gameData = response.data;

        // ✅ Fetch Trailer and Gameplay Video from YouTube
        console.log(`🔍 Fetching YouTube trailer and gameplay for "${gameData.name}"...`);
        const trailer = await fetchYouTubeVideo(gameData.name, "trailer");
        const gameplay = await fetchYouTubeVideo(gameData.name, "gameplay");

        // ✅ Fetch Store Links from RAWG
        const storeResponse = await axios.get(`https://api.rawg.io/api/games/${gameId}/stores`, {
            params: { key: process.env.RAWG_API_KEY }
        });

        const storeLinks = storeResponse.data.results.map(storeEntry => ({
            name: STORE_NAMES[storeEntry.store_id] || "Unknown Store",
            url: storeEntry.url
        }));

        return {
            id: gameData.id,
            name: gameData.name,
            description: gameData.description_raw || "No description available.",
            genre: gameData.genres.map(g => g.name).join(", "),
            averageRating: gameData.rating,
            image: gameData.background_image,
            trailer: trailer || null,
            gameplay: gameplay || null,
            stores: storeLinks.length > 0 ? storeLinks : null
        };
    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        return null;
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

