// ✅ Import Mongoose
const mongoose = require('mongoose');

// ✅ Define schema for storing user ratings
const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ Reference to the User model (who gave the rating)
    gameId: { type: String, required: true }, // ✅ Store the game ID from RAWG API or manually added games
    rating: { type: Number, required: true, min: 1, max: 5 } // ✅ Ensure rating is between 1 and 5
});

// ✅ Export the Rating model
module.exports = mongoose.model('Rating', RatingSchema);
