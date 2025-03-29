// ✅ Import required modules
const axios = require('axios'); // Import Axios to make HTTP requests
const { getTopRatedGames } = require('../controllers/gameController'); // Import function to fetch popular games
const RAWG_API_KEY = process.env.RAWG_API_KEY; // Retrieve RAWG API key from environment variables



exports.renderHome = async (req, res) => {
    const popularGames = await getTopRatedGames();
    res.render('home', {
        user: req.user,
        popularGames
    });
};


// ✅ Function to render the Register Page
exports.renderRegister = (req, res) => {
    res.render('register'); // Render the register page
};

// ✅ Function to render the Login Page
exports.renderLogin = (req, res) => {
    res.render('login'); // Render the login page
};

// ✅ Function to render the Search Page with results
exports.renderSearch = async (req, res) => {
    try {
        // ✅ Get search query from request parameters
        const query = req.query.query;

        // ✅ If query is empty, render the search page with no error message
        if (!query) return res.render('search', { error: null });

        // 🔍 Fetch game details from RAWG API based on user search input
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: { key: RAWG_API_KEY, search: query, page_size: 1 } // Limit results to 1 for best match
        });

        // ✅ Check if any results were found
        if (response.data.results.length > 0) {
            const game = response.data.results[0]; // Retrieve the first result

            // ✅ Redirect user to the game's information page
            return res.redirect(`/games/game-info/${game.id}`);
        } else {
            // ✅ If no results are found, display an error message on the search page
            return res.render('search', { error: "❌ No results found. Try again." });
        }
    } catch (error) {
        console.error("❌ RAWG API Error:", error.response?.data || error.message);

        // ✅ Display an error message in case of API failure
        return res.render('search', { error: "❌ Error fetching search results. Please try again later." });
    }
};

// ✅ Function to fetch auto-suggestions for live search
exports.getSearchSuggestions = async (req, res) => {
    try {
        // ✅ Get search query from request parameters
        const query = req.query.query;

        // ✅ If query is empty, return an empty suggestions array
        if (!query) return res.json({ suggestions: [] });

        // ✅ Fetch game suggestions from RAWG API
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: { key: RAWG_API_KEY, search: query, page_size: 5 } // Limit to 5 suggestions
        });

        // ✅ Extract game names from API response
        const suggestions = response.data.results.map(game => ({
            name: game.name // Store only the game name
        }));

        // ✅ Send the suggestions as a JSON response
        res.json({ suggestions });
    } catch (error) {
        console.error("❌ Error fetching suggestions:", error);

        // ✅ In case of error, return an empty suggestions array
        res.status(500).json({ suggestions: [] });
    }
};
