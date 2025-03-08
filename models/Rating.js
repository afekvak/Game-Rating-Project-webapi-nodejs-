const mongoose = require('mongoose');
const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    rating: { type: Number, required: true, min: 1, max: 5 }
});
module.exports = mongoose.model('Rating', RatingSchema);