// ✅ Import Mongoose
const mongoose = require('mongoose');

// ✅ Define schema for storing user details
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function() {
          return !this.googleId;
        }
      },
    fullName: { type: String }, // ✅ New
    phone: { type: String }, // ✅ New
    birthday: { type: Date }, // ✅ New
    favoriteGenre: { type: String }, // ✅ New
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function() {
          return !this.googleId;
        }
      },
    emailVerified: { type: Boolean, default: false },
    token: { type: String },
    profilePicture: { type: String, default: '/assets/empty.jpeg' },
    lastVisitedGames: [{ type: String }],
    googleId: {type: String,default: null},
    createdAt: { type: Date, default: Date.now }
    
});
// ✅ Export the User model
module.exports = mongoose.model('User', UserSchema);
