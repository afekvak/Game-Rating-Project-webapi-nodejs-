const axios = require('axios');
require('dotenv').config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

exports.getExploreGames = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: RAWG_API_KEY,
                page_size: 24,
                page: page
            }
        });

        const games = response.data.results.map(game => ({
            id: game.id,
            name: game.name,
            image: game.background_image || "https://via.placeholder.com/200x300?text=No+Image"
        }));

        // אם הבקשה היא AJAX, מחזירים JSON בלבד
        if (req.xhr || req.headers.accept.includes('application/json')) {
            return res.json({ games });
        }

        console.log("🔍 Current User in explore:", req.user); // נבדוק אם המשתמש מגיע

        // אחרת, מרנדרים את הדף עם המידע של המשתמש
        res.render('explore', { games, user: req.user || null });
    } catch (error) {
        console.error("❌ Error fetching games from RAWG:", error);
        res.status(500).json({ error: "Error fetching games" });
    }
};




exports.getGameInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://api.rawg.io/api/games/${id}`, {
            params: {
                key: RAWG_API_KEY
            }
        });

        const game = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description_raw,
            genre: response.data.genres.map(g => g.name).join(", "),
            averageRating: response.data.rating,
            image: response.data.background_image || "https://via.placeholder.com/200x300?text=No+Image"
        };

        res.render('game-info', { game });
    } catch (error) {
        console.error("Error fetching game info from RAWG:", error);
        res.status(500).send("Error fetching game info");
    }
};