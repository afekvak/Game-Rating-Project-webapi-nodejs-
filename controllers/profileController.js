const User = require('../models/User');
const Rating = require('../models/Rating');
const Game = require('../models/Game'); // ✅ נוסיף גם את המודל Game
const axios = require('axios');
const bcrypt = require('bcryptjs');

exports.renderProfile = async (req, res) => {
    try {
        console.log("✅ Fetching profile for user:", req.user ? req.user._id : "undefined");

        const user = await User.findById(req.user._id);
        if (!user) {
            console.log("❌ User not found in database.");
            return res.redirect('/login');
        }

        console.log("✅ User found:", user.username);

        // ✅ Fetch recent games from your local DB by rawgId
        let recentGames = [];
        if (user.lastVisitedGames && user.lastVisitedGames.length > 0) {
            const games = await Game.find({ rawgId: { $in: user.lastVisitedGames } });

            // סדר לפי הסדר ב-user.lastVisitedGames
            recentGames = user.lastVisitedGames.map(id =>
                games.find(g => g.rawgId === id)
            ).filter(game => game); // הסר null
        }

        // ✅ Get ratings and populate game info
        const ratings = await Rating.find({ user: user._id }).populate("game");

        const ratingsWithNames = ratings.map(rating => {
            const game = rating.game;
            return {
                _id: rating._id,
                gameId: game.rawgId || "N/A",
                gameName: game.name || "Unknown Game",
                rating: rating.rating
            };
        });

        // ✅ Render profile
        res.render('profile', {
            user: { ...user.toObject(), recentGames },
            ratings: ratingsWithNames
        });

    } catch (error) {
        console.error("❌ Error fetching profile data:", error);
        res.redirect('/login');
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
