// ✅ Import Mongoose
const mongoose = require('mongoose');

// ✅ Define schema for storing user details
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // ✅ Unique username (required)
    email: { type: String, required: true, unique: true }, // ✅ Unique email (required)
    password: { type: String, required: true }, // ✅ Hashed password (required)
    token: { type: String }, // ✅ JWT authentication token (optional)
    profilePicture: { type: String, default: '/assets/empty.jpeg' }, // ✅ Default profile picture if none is uploaded
    lastVisitedGames: [{ type: String }], // ✅ Array to store recently visited game IDs
    createdAt: { type: Date, default: Date.now } // ✅ Store user creation date
});

// ✅ Export the User model
module.exports = mongoose.model('User', UserSchema);
