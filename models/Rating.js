

const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    rating: { type: Number, required: true, min: 0.5, max: 5 },
    playedHours: { type: Number, default: 0 }, // ✅ חדש: זמן משחק
    review: { type: String, default: '' }      // ✅ חדש: ביקורת טקסט
}, { timestamps: true });

RatingSchema.index({ user: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
