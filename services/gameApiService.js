// ✅ Import required modules
const axios = require('axios'); // Import Axios for making HTTP requests
require('dotenv').config(); // Load environment variables from the .env file

// ✅ Define RAWG API base URL and API key
const RAWG_API_URL = "https://api.rawg.io/api/games"; // RAWG API endpoint for fetching game data
const API_KEY = process.env.RAWG_API_KEY; // Retrieve API key from environment variables

// ✅ Function to fetch game details from RAWG API
const fetchGameInfo = async (gameId) => {
    try {
        // ✅ Make a request to the RAWG API to get game details
        const response = await axios.get(`${RAWG_API_URL}/${gameId}?key=${API_KEY}`);

        // ✅ Extract relevant game details from the API response
        return {
            id: response.data.id, // ✅ Game ID
            name: response.data.name, // ✅ Game name
            genre: response.data.genres.map(g => g.name).join(", "), // ✅ Convert genre array to a comma-separated string
            averageRating: response.data.rating, // ✅ Average user rating
            description: response.data.description_raw, // ✅ Raw game description (without HTML formatting)
            image: response.data.background_image // ✅ Game background image
        };
    } catch (error) {
        console.error("Error fetching game info from RAWG:", error.message); // ✅ Log error if API request fails
        return null; // ✅ Return null in case of an error
    }
};

// ✅ Export the function to use in other files
module.exports = { fetchGameInfo };
