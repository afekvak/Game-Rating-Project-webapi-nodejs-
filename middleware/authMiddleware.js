const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        const token = req.session.user ? req.session.user.token : null;
        if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email, token });
        if (!user) return res.status(401).json({ message: "Invalid token." });

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};