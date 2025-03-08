const Rating = require('../models/Rating');
const { getGameRecommendations } = require('../services/openaiService');

exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const ratings = await Rating.find({ user: userId }).populate('game');

        if (ratings.length === 0) {
            return res.status(400).json({ message: "No ratings found. Please rate some games first!" });
        }

        const ratedGames = ratings.map(r => r.game.name);
        const recommendations = await getGameRecommendations(ratedGames);
        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};