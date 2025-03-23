const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ Reference to the User model
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true }, // ✅ Reference to the Game model
    rating: { type: Number, required: true, min: 1, max: 5 } // ✅ Ratings must be between 1-5
}, { timestamps: true }); // ✅ Auto-created timestamps

// ✅ Prevent duplicate ratings per user for the same game
RatingSchema.index({ user: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
