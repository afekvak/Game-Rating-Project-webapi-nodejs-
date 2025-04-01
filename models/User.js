// ✅ Import Mongoose
const mongoose = require('mongoose');

// ✅ Define schema for storing user details
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullName: { type: String }, // ✅ New
    phone: { type: String }, // ✅ New
    birthday: { type: Date }, // ✅ New
    favoriteGenre: { type: String }, // ✅ New
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    token: { type: String },
    profilePicture: { type: String, default: '/assets/empty.jpeg' },
    lastVisitedGames: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
// ✅ Export the User model
module.exports = mongoose.model('User', UserSchema);
