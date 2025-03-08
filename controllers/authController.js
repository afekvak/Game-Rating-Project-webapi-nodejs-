const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("🔹 Trying to register user:", email);

        let user = await User.findOne({ email });
        if (user) {
            console.log("⚠️ User already exists:", user);
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        user = new User({ username, email, password: hashedPassword, token });

        console.log("🟢 Saving user to database...");
        await user.save();
        console.log("✅ User successfully saved to database!");

        req.session.user = { id: user._id, username: user.username, email: user.email, token };
        res.redirect('/');
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ error: error.message });
    }
};



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.token) {
            return res.status(400).json({ message: "No valid token found. Please register again." });
        }

        req.session.user = { id: user._id, username: user.username, email: user.email, token: user.token };
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};