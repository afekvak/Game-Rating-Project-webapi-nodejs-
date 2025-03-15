// ✅ Import Mongoose
const mongoose = require('mongoose');

// ✅ Define schema for storing user details
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    token: { type: String,  },
    profilePicture: { type: String, default: '/assets/empty.jpeg' }, // ✅ Profile Picture
    lastVisitedGames: [{ type: String }], // ✅ Store last visited game IDs
    createdAt: { type: Date, default: Date.now }
});

// ✅ Export the User model
module.exports = mongoose.model('User', UserSchema);
