const Rating = require('../models/Rating');

exports.submitRating = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { gameId, rating } = req.body;
        if (!gameId || !rating) {
            return res.status(400).json({ message: "Game ID and rating are required." });
        }

        // ✅ Save Rating
        await Rating.create({ user: req.user._id, gameId, rating });

        res.json({ message: "Rating saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving rating:", error);
        res.status(500).json({ message: "Error saving rating." });
    }
};
