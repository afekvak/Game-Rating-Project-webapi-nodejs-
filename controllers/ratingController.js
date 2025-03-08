const Rating = require('../models/Rating');

exports.rateGame = async (req, res) => {
    try {
        const { gameId, rating } = req.body;
        const userId = req.user.id;

        let existingRating = await Rating.findOne({ user: userId, game: gameId });
        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
        } else {
            const newRating = new Rating({ user: userId, game: gameId, rating });
            await newRating.save();
        }

        res.json({ message: "Rating saved!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};