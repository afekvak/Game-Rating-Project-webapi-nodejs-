const User = require('../models/User');
const Rating = require('../models/Rating');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const RAWG_API_KEY = process.env.RAWG_API_KEY;

exports.renderProfile = async (req, res) => {
    try {
        console.log("✅ Fetching profile for user:", req.user ? req.user._id : "undefined");

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log("❌ User not found in database.");
            return res.redirect('/login');
        }

        console.log("✅ User found:", user.username);

        // ✅ Fetch last visited games
        let recentGames = [];
        if (user.lastVisitedGames && user.lastVisitedGames.length > 0) {
            recentGames = await Promise.all(user.lastVisitedGames.map(async (gameId) => {
                try {
                    const response = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
                        params: { key: process.env.RAWG_API_KEY }
                    });
                    return {
                        id: response.data.id,
                        name: response.data.name,
                        image: response.data.background_image
                    };
                } catch (error) {
                    console.error(`❌ Error fetching game data for ${gameId}:`, error.message);
                    return null;
                }
            }));
            recentGames = recentGames.filter(game => game !== null);
        }

        // ✅ Fetch user ratings & Get Game Names
        const ratings = await Rating.find({ user: user._id });

        // ✅ Fetch Game Names for Ratings
        const ratingsWithNames = await Promise.all(ratings.map(async (rating) => {
            try {
                const response = await axios.get(`https://api.rawg.io/api/games/${rating.gameId}`, {
                    params: { key: process.env.RAWG_API_KEY }
                });

                return {
                    _id: rating._id,
                    gameId: rating.gameId,
                    gameName: response.data.name || "Unknown Game",
                    rating: rating.rating
                };
            } catch (error) {
                console.error(`❌ Error fetching game name for rating ${rating.gameId}:`, error.message);
                return {
                    _id: rating._id,
                    gameId: rating.gameId,
                    gameName: "Unknown Game",
                    rating: rating.rating
                };
            }
        }));

        res.render('profile', {
            user: { ...user.toObject(), recentGames },
            ratings: ratingsWithNames // ✅ Pass fixed ratings
        });
    } catch (error) {
        console.error("❌ Error fetching profile data:", error);
        res.redirect('/login');
    }
};


// ✅ Update Profile Picture
exports.updateProfilePhoto = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { profilePicture: req.body.photoUrl });
        res.redirect('/profile');
    } catch (error) {
        console.error("❌ Error updating photo:", error);
        res.redirect('/profile');
    }
};

// ✅ Update Username
exports.updateUserInfo = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { username: req.body.username });
        res.redirect('/profile');
    } catch (error) {
        console.error("❌ Error updating user info:", error);
        res.redirect('/profile');
    }
};

// ✅ Update Password
exports.updatePassword = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
        res.redirect('/profile');
    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.redirect('/profile');
    }
};

// ✅ Remove Rating
exports.removeRating = async (req, res) => {
    try {
        await Rating.findOneAndDelete({ _id: req.body.ratingId, user: req.user._id });
        res.redirect('/profile');
    } catch (error) {
        console.error("❌ Error removing rating:", error);
        res.redirect('/profile');
    }
};
