// ✅ Import Mongoose for MongoDB interactions
const mongoose = require('mongoose');

// ✅ Define schema for manually added games (currently not in use)
const GameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true }, // ✅ Unique game identifier
    name: { type: String, required: true }, // ✅ Game name (required)
    genres: [String], // ✅ Array of genre names (e.g., ["Action", "RPG"])
    rating: Number // ✅ Optional game rating (stored as a number)
});

// ✅ Export the Game model for database interactions
module.exports = mongoose.model('Game', GameSchema);
