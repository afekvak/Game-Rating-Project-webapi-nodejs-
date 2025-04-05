const Rating = require('../models/Rating');
const { getGameInfo } = require('./gameController');

exports.submitRating = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { gameId, rating, playedHours, review } = req.body;

        if (!gameId || !rating) {
            return res.status(400).json({ message: "Game ID and rating are required." });
        }

        const game = await getGameInfo(gameId, req.user._id);
        if (!game) {
            return res.status(404).json({ message: "Game not found." });
        }

        const existingRating = await Rating.findOne({ user: req.user._id, game: game._id });

        if (existingRating) {
            existingRating.rating = rating;
            existingRating.playedHours = playedHours || 0;
            existingRating.review = review || '';
            await existingRating.save();
            return res.json({ message: "Rating updated successfully!" });
        }

        await Rating.create({
            user: req.user._id,
            game: game._id,
            rating,
            playedHours: playedHours || 0,
            review: review || ''
        });

        res.json({ message: "Rating saved successfully!" });

    } catch (error) {
        console.error("❌ Error saving rating:", error);
        res.status(500).json({ message: "Error saving rating." });
    }
};