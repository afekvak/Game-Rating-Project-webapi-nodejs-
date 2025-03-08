const axios = require('axios');
require('dotenv').config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

exports.getExploreGames = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: process.env.RAWG_API_KEY,
                page_size: 24,
                page: page
            }
        });

        const games = response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image || "https://via.placeholder.com/200x300?text=No+Image"
        }));

        console.log("🔍 Current User in explore:", req.user); // Debugging

        res.render("explore", { games, user: req.user || null });
    } catch (error) {
        console.error("❌ Error fetching games from RAWG:", error);
        res.status(500).json({ error: "Error fetching games" });
    }
};





exports.getGameInfo = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Fetch game details
        const response = await axios.get(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`);
        const gameData = response.data;

        // ✅ Fetch trailers (ensuring it's a valid MP4)
        const trailersResponse = await axios.get(`https://api.rawg.io/api/games/${id}/movies?key=${RAWG_API_KEY}`);
        const trailers = trailersResponse.data.results;
        const video = trailers.length > 0 && trailers[0].data ? trailers[0].data.max : null; // ✅ Correct video URL

        // ✅ Fetch store links
        const storeResponse = await axios.get(`https://api.rawg.io/api/games/${id}/stores?key=${RAWG_API_KEY}`);
        const steamStore = storeResponse.data.results.find(store => store.store_id === 1); // ✅ Steam store link

        const game = {
            id: gameData.id,
            name: gameData.name,
            description: gameData.description_raw,
            genre: gameData.genres.map(g => g.name).join(", "),
            averageRating: gameData.rating,
            image: gameData.background_image,
            video: video ? video : null, // ✅ Ensure a valid video link
            steamLink: steamStore ? `https://store.steampowered.com/app/${gameData.id}` : null // ✅ Steam purchase link
        };

        res.render('game-info', { game });
    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        res.status(500).send("Error fetching game info");
    }
};