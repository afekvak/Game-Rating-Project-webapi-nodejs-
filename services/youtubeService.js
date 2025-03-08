const axios = require('axios');
require('dotenv').config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Function to fetch a YouTube video (trailer or gameplay)
const fetchYouTubeVideo = async (gameName, type) => {
    try {
        const query = type === "trailer" ? `${gameName} official game trailer` : `${gameName} gameplay`;

        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: "snippet",
                q: query,
                type: "video",
                key: YOUTUBE_API_KEY,
                maxResults: 1
            }
        });

        if (response.data.items.length > 0) {
            return `https://www.youtube.com/embed/${response.data.items[0].id.videoId}`;
        }
    } catch (error) {
        console.error(`❌ YouTube API error (${type}):`, error);
    }

    return null; // Return null if no video is found
};

module.exports = { fetchYouTubeVideo };
