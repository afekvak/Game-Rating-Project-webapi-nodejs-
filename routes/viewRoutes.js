const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Ensure it's updated
const axios = require('axios');
const { getPopularGames } = require('../controllers/gameController');
const RAWG_API_KEY = process.env.RAWG_API_KEY;
router.get('/', async (req, res) => {
    try {
        const popularGames = await getPopularGames();
        res.render('home', { user: res.locals.user || null, popularGames });
    } catch (error) {
        console.error("❌ Error loading home page:", error);
        res.render('home', { user: res.locals.user || null, popularGames: [] });
    }
});
router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) return res.render('search', { error: null });

        // 🔍 Fetch game from RAWG API
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: {
                key: process.env.RAWG_API_KEY,
                search: query,
                page_size: 1
            }
        });

        if (response.data.results.length > 0) {
            const game = response.data.results[0]; // First result
            return res.redirect(`/games/game-info/${game.id}`);
        } else {
            return res.render('search', { error: "❌ No results found. Try again." });
        }
    } catch (error) {
        console.error("❌ RAWG API Error:", error.response?.data || error.message);
        return res.render('search', { error: "❌ Error fetching search results. Please try again later." });
    }
});


// ✅ Auto-Suggestions for Live Search
router.get('/search/suggestions', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) return res.json({ suggestions: [] });

        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: { key: RAWG_API_KEY, search: query, page_size: 5 }
        });

        const suggestions = response.data.results.map(game => ({
            name: game.name
        }));

        res.json({ suggestions });
    } catch (error) {
        console.error("❌ Error fetching suggestions:", error);
        res.status(500).json({ suggestions: [] });
    }
});

// ✅ Profile route now uses JWT authentication
router.get('/profile', authMiddleware, (req, res) => {
    res.render('profile', { user: res.locals.user });
});

module.exports = router;
