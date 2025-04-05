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

// ✅ מיפוי עם דירוגים ומיון לפי הדירוג מהגבוה לנמוך
const ratingsWithNames = ratings
    .map(rating => ({
        _id: rating._id,
        gameId: rating.game?.rawgId || "N/A",
        gameName: rating.game?.name || "Unknown Game",
        rating: rating.rating
    }))
    .sort((a, b) => b.rating - a.rating); // ⬅️ מיון מהגבוה לנמוך


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
                    {
                        folder: "profile_pictures",
                        use_filename: true, // שימוש בשם המקורי
                        unique_filename: false, // לא יוסיף מזהה ייחודי
                        overwrite: true // יאפשר להחליף אם כבר קיים
                    },
                    (error, result) => {
                        if (result) {
                            console.log("✅ Cloudinary result:", result);
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file.buffer);

        if (!result || !result.secure_url) {
            throw new Error("Image upload failed or returned no URL");
        }

        await User.findByIdAndUpdate(req.user._id, {
            profilePicture: result.secure_url
        });

        res.redirect('/profile/edit');
    } catch (error) {
        console.error("❌ Error uploading profile photo:", error);
        res.redirect('/profile/edit');
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
        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        const user = await User.findById(req.user._id);
        const ratings = await Rating.find({ user: req.user._id }).populate("game");
        const ratingsWithNames = ratings.map(rating => ({
            _id: rating._id,
            gameId: rating.game?.rawgId || "N/A",
            gameName: rating.game?.name || "Unknown Game",
            gameImage: rating.game?.image || "/images/no-image.jpg",
            rating: rating.rating
        })).sort((a, b) => b.rating - a.rating);

        if (!strongPasswordRegex.test(req.body.password)) {
            return res.render("edit-profile", {
                user,
                error: null,
                success: null,
                passwordError: "🔐 Password must be at least 6 characters, include a number and an uppercase letter.",
                passwordSuccess: null,
                ratings: ratingsWithNames,
                section: "security"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        res.render("edit-profile", {
            user,
            error: null,
            success: null,
            passwordError: null,
            passwordSuccess: "✅ Password updated successfully!",
            ratings: ratingsWithNames,
            section: "security"
        });
    } catch (error) {
        console.error("❌ Error updating password:", error);
        res.redirect('/profile');
    }
};





// ✅ Remove Rating
exports.removeRating = async (req, res) => {
    try {
        await Rating.findOneAndDelete({ _id: req.body.ratingId, user: req.user._id });

        const user = await User.findById(req.user._id);
        const ratings = await Rating.find({ user: req.user._id }).populate("game");
        const ratingsWithNames = ratings.map(rating => ({
            _id: rating._id,
            gameId: rating.game?.rawgId || "N/A",
            gameName: rating.game?.name || "Unknown Game",
            gameImage: rating.game?.image || "/images/no-image.jpg",
            rating: rating.rating
        })).sort((a, b) => b.rating - a.rating);

        res.render("edit-profile", {
            user,
            ratings: ratingsWithNames,
            section: "ratings",
            success: "✅ Rating removed successfully!",
            error: null,
            passwordError: null,
            passwordSuccess: null
        });

    } catch (error) {
        console.error("❌ Error removing rating:", error);
        res.redirect('/profile');
    }
};


exports.renderEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.redirect('/login');

        const ratings = await Rating.find({ user: req.user._id }).populate("game");
        const ratingsWithNames = ratings.map(rating => ({
            _id: rating._id,
            gameId: rating.game?.rawgId || "N/A",
            gameName: rating.game?.name || "Unknown Game",
            gameImage: rating.game?.image || "/images/no-image.jpg",
            rating: rating.rating
        })).sort((a, b) => b.rating - a.rating);

        res.render('edit-profile', {
            user,
            ratings: ratingsWithNames,
            error: null,
            success: null,
            passwordError: null,
            passwordSuccess: null,
            section: req.query.section || null
        });
    } catch (error) {
        console.error("❌ Error rendering edit profile:", error);
        res.redirect('/profile');
    }
};





exports.updateFullProfile = async (req, res) => {
    try {
        const { fullName, phone, birthday, username, favoriteGenre } = req.body;
        const updates = { fullName, phone, birthday, username, favoriteGenre };

        // 📵 ולידציית טלפון
        if (phone && !/^\d{9,10}$/.test(phone)) {
            return res.render("edit-profile", {
                user: { ...req.body },
                error: "📵 Invalid phone number format!",
                success: null,
                passwordError: null,
                passwordSuccess: null,
                ratings: ratingsWithNames, // תשלוף אותם גם כאן
                section: "personal" // ✅ להישאר בטאב הנכון
            });
            
        }

        await User.findByIdAndUpdate(req.user._id, updates);
        const updatedUser = await User.findById(req.user._id);

        // שליפת דירוגים מחדש להצגה תקינה
        const ratings = await Rating.find({ user: req.user._id }).populate("game");
        const ratingsWithNames = ratings.map(rating => ({
            _id: rating._id,
            gameId: rating.game?.rawgId || "N/A",
            gameName: rating.game?.name || "Unknown Game",
            gameImage: rating.game?.image || "/images/no-image.jpg",
            rating: rating.rating
        })).sort((a, b) => b.rating - a.rating);

        res.render("edit-profile", {
            user: updatedUser,
            success: "Profile updated!",
            error: null,
            passwordError: null,
            passwordSuccess: null,
            ratings: ratingsWithNames,
            section: "personal" // ✅ חשוב!
        });
        
        

    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.redirect('/profile');
    }
};
