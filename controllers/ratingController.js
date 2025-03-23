const Rating = require('../models/Rating');
const { getGameInfo } = require('./gameController');

exports.submitRating = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { gameId, rating } = req.body;

        if (!gameId || !rating) {
            return res.status(400).json({ message: "Game ID and rating are required." });
        }

        // ✅ קבל את המשחק (יביא מה-RAWG אם לא קיים)
        const game = await getGameInfo(gameId, req.user._id);
        if (!game) {
            return res.status(404).json({ message: "Game not found." });
        }

        // ✅ בדוק אם המשתמש כבר דירג את המשחק
        const existingRating = await Rating.findOne({ user: req.user._id, game: game._id });

        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            return res.json({ message: "Rating updated successfully!" });
        }

        // ✅ צור דירוג חדש
        await Rating.create({
            user: req.user._id,
            game: game._id, // ✅ חייב להיות game ולא gameId
            rating
        });

        res.json({ message: "Rating saved successfully!" });

    } catch (error) {
        console.error("❌ Error saving rating:", error);
        res.status(500).json({ message: "Error saving rating." });
    }
};
