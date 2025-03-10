const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            console.log("❌ No user ID in request.");
            return res.redirect('/login');
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log("❌ User not found in database.");
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.user = user;
        console.log("✅ Authenticated User:", user.username);
        next();
    } catch (error) {
        console.error("❌ Authentication error:", error.message);
        return res.redirect('/login');
    }
};
