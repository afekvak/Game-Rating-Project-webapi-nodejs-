// ✅ Import required modules
const User = require('../models/User'); // Import the User model to interact with the users collection in the database
const Rating = require('../models/Rating'); // Import the Rating model to interact with the ratings collection
const axios = require('axios'); // Import Axios for making HTTP requests (used for fetching game data from an API)
const bcrypt = require('bcryptjs'); // Import bcrypt.js for password hashing
const RAWG_API_KEY = process.env.RAWG_API_KEY; // Retrieve the API key for RAWG from environment variables

// ✅ Function to render user profile
exports.renderProfile = async (req, res) => {
    try {
        console.log("✅ Fetching profile for user:", req.user ? req.user._id : "undefined");

        // ✅ Find the user by their ID (extracted from the request object)
        const user = await User.findById(req.user._id);
        if (!user) {
            console.log("❌ User not found in database.");
            return res.redirect('/login'); // If user doesn't exist, redirect to login page
        }

        console.log("✅ User found:", user.username);

        // ✅ Fetch last visited games
        let recentGames = [];
        if (user.lastVisitedGames && user.lastVisitedGames.length > 0) {
            // Loop through last visited game IDs and fetch game details from RAWG API
            recentGames = await Promise.all(user.lastVisitedGames.map(async (gameId) => {
                try {
                    const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
                        params: { key: process.env.RAWG_API_KEY } // Send API key as a query parameter
                    });
                    return {
                        id: response.data.id, // Store game ID
                        name: response.data.name, // Store game name
                        image: response.data.background_image // Store game image URL
                    };
                } catch (error) {
                    console.error(`❌ Error fetching game data for ${gameId}:`, error.message);
                    return null; // Return null for games that failed to fetch
                }
            }));
            recentGames = recentGames.filter(game => game !== null); // Remove null values from the array
        }

        // ✅ Fetch user ratings from the database
        const ratings = await Rating.find({ user: user._id });

        // ✅ Fetch Game Names for Ratings
        const ratingsWithNames = await Promise.all(ratings.map(async (rating) => {
            try {
                // Fetch game details from RAWG API using game ID stored in the rating document
                const response = await axios.get(`https://api.rawg.io/api/games/${rating.gameId}`, {
                    params: { key: process.env.RAWG_API_KEY }
                });

                return {
                    _id: rating._id, // Keep rating ID
                    gameId: rating.gameId, // Store game ID
                    gameName: response.data.name || "Unknown Game", // Store game name (fallback to "Unknown Game" if not found)
                    rating: rating.rating // Store user rating
                };
            } catch (error) {
                console.error(`❌ Error fetching game name for rating ${rating.gameId}:`, error.message);
                return {
                    _id: rating._id,
                    gameId: rating.gameId,
                    gameName: "Unknown Game", // Set game name as "Unknown Game" in case of error
                    rating: rating.rating
                };
            }
        }));

        // ✅ Render the profile page and pass the user data & ratings
        res.render('profile', {
            user: { ...user.toObject(), recentGames }, // Convert Mongoose document to object and include recentGames
            ratings: ratingsWithNames // Pass ratings with game names
        });
    } catch (error) {
        console.error("❌ Error fetching profile data:", error);
        res.redirect('/login'); // Redirect to login page in case of error
    }
};

// ✅ Update Profile Picture
exports.updateProfilePhoto = async (req, res) => {
    try {
        // Update user's profile picture in the database
        await User.findByIdAndUpdate(req.user._id, { profilePicture: req.body.photoUrl });
        res.redirect('/profile'); // Redirect back to profile after update
    } catch (error) {
        console.error("❌ Error updating photo:", error);
        res.redirect('/profile'); // Redirect in case of error
    }
};

// ✅ Update Username
exports.updateUserInfo = async (req, res) => {
    try {
        // Update user's username in the database
        await User.findByIdAndUpdate(req.user._id, { username: req.body.username });
        res.redirect('/profile'); // Redirect back to profile
    } catch (error) {
        console.error("❌ Error updating user info:", error);
        res.redirect('/profile'); // Redirect in case of error
    }
};

// ✅ Update Password
exports.updatePassword = async (req, res) => {
    try {
        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Update the user's password in the database
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
        res.redirect('/profile'); // Redirect to profile page after update
    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.redirect('/profile'); // Redirect in case of error
    }
};

// ✅ Remove Rating
exports.removeRating = async (req, res) => {
    try {
        // Delete the rating from the database where the rating ID matches and belongs to the current user
        await Rating.findOneAndDelete({ _id: req.body.ratingId, user: req.user._id });
        res.redirect('/profile'); // Redirect back to profile after deletion
    } catch (error) {
        console.error("❌ Error removing rating:", error);
        res.redirect('/profile'); // Redirect in case of error
    }
};
