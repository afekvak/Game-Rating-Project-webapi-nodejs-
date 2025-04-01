const User = require('../models/User');
const Rating = require('../models/Rating');
const Game = require('../models/Game'); // ✅ נוסיף גם את המודל Game
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../services/cloudinaryCloud');
const streamifier = require('streamifier');


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
        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profile_pictures" },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file.buffer);

        await User.findByIdAndUpdate(req.user._id, {
            profilePicture: result.secure_url
        });

        res.redirect('/profile');
    } catch (error) {
        console.error("❌ Error uploading profile photo:", error);
        res.redirect('/profile');
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

exports.renderEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.redirect('/login');

        res.render('edit-profile', { user, error: null, success: null });
    } catch (error) {
        console.error("❌ Error rendering edit profile:", error);
        res.redirect('/profile');
    }
};


exports.updateFullProfile = async (req, res) => {
    try {
        const { fullName, phone, birthday, username, password, favoriteGenre } = req.body;
        const updates = { fullName, phone, birthday, username, favoriteGenre };

        // 📵 ולידציית טלפון
        if (phone && !/^\d{9,10}$/.test(phone)) {
            return res.render("edit-profile", {
                user: { ...req.body },
                error: "📵 Invalid phone number format!"
            });
        }

        // 🔐 ולידציית סיסמה
        if (password && password.trim() !== "") {
            const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
            if (!strongPasswordRegex.test(password)) {
                return res.render("edit-profile", {
                    user: { ...req.body },
                    error: "🔐 Password must be at least 6 characters, include a number and an uppercase letter."
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            updates.password = hashedPassword;
        }

        // 📷 אם יש תמונה חדשה – העלאה ל-Cloudinary
        if (req.file) {
            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "profile_pictures" },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(buffer).pipe(stream);
                });
            };

            const result = await streamUpload(req.file.buffer);
            updates.profilePicture = result.secure_url;
        }

        // ✅ עדכון במסד
        await User.findByIdAndUpdate(req.user._id, updates);
        const updatedUser = await User.findById(req.user._id);

        res.render("edit-profile", {
            user: updatedUser,
            success: "✅ Profile updated successfully!",
            error: null
        });

    } catch (error) {
        console.error("❌ Error updating full profile:", error);
        res.redirect('/profile');
    }
};