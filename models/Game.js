const mongoose = require('mongoose');
const GameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genres: [String],
    rating: Number
});
module.exports = mongoose.model('Game', GameSchema);