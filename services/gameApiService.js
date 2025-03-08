const axios = require('axios');
require('dotenv').config();

const RAWG_API_URL = "https://api.rawg.io/api/games";
const API_KEY = process.env.RAWG_API_KEY;

const fetchGameInfo = async (gameId) => {
    try {
        const response = await axios.get(`${RAWG_API_URL}/${gameId}?key=${API_KEY}`);
        return {
            id: response.data.id,
            name: response.data.name,
            genre: response.data.genres.map(g => g.name).join(", "),
            averageRating: response.data.rating,
            description: response.data.description_raw,
            image: response.data.background_image
        };
    } catch (error) {
        console.error("Error fetching game info from RAWG:", error.message);
        return null;
    }
};

module.exports = { fetchGameInfo };
