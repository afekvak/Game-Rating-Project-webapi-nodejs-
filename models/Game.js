const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    rawgId: { type: String, required: true, unique: true }, // ✅ RAWG API game ID
    name: { type: String, required: true },
    image: { type: String, default: "/images/no-image.jpg" },
    genre: { type: String },
    description: { type: String, default: "No description available." },

    // ✅ 🎥 Videos
    trailer: { type: String, default: null },
    gameplay: { type: String, default: null },

    // ✅ 🛒 Stores
    stores: [{ name: String, url: String }],

    // ✅ 🔥 User favorites & popularity tracking
    popularity: { type: Number, default: 0 },
    timesPlayed: { type: Number, default: 0 },
    favoriteByUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ 🛒 Price Tracking
    priceTracking: [{
        storeName: String,
        currentPrice: Number,
        lastUpdated: { type: Date, default: Date.now }
    }],

    // ✅ 🎁 Special Offers / DLC
    specialOffers: [{
        title: String,
        discount: Number,
        validUntil: Date
    }],

    createdAt: { type: Date, default: Date.now }
});

// ✅ Virtual field for calculating the **average rating**
gameSchema.virtual("averageRating").get(async function () {
    const ratings = await mongoose.model("Rating").find({ game: this._id });
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
});

module.exports = mongoose.model("Game", gameSchema);
