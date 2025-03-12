// ✅ Import required modules
const axios = require('axios'); // Import Axios to make HTTP requests
require('dotenv').config(); // Load environment variables from the .env file

// ✅ Retrieve YouTube API key from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Ensure this is set in your .env file

// ✅ Function to fetch a YouTube video (trailer or gameplay) for a game
const fetchYouTubeVideo = async (gameName, type) => {
    try {
        // ✅ Determine the search query based on the requested type
        const query = type === "trailer" 
            ? `${gameName} official game trailer` // Search for an official game trailer
            : `${gameName} gameplay`; // Search for gameplay footage

        // ✅ Make a request to the YouTube API to search for videos
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: "snippet", // Request video snippet details (title, thumbnail, etc.)
                q: query, // ✅ Use the dynamically generated search query
                type: "video", // ✅ Ensure we only fetch videos (not channels or playlists)
                key: YOUTUBE_API_KEY, // ✅ Use the API key for authentication
                maxResults: 1 // ✅ Limit results to only one video
            }
        });

        // ✅ If a video is found, return its embedded URL
        if (response.data.items.length > 0) {
            return `https://www.youtube.com/embed/${response.data.items[0].id.videoId}`; // ✅ Generate an embeddable YouTube link
        }
    } catch (error) {
        console.error(`❌ YouTube API error (${type}):`, error); // ✅ Log API errors for debugging
    }

    return null; // ✅ Return null if no video is found or an error occurs
};

// ✅ Export the function to use it in other parts of the application
module.exports = { fetchYouTubeVideo };
