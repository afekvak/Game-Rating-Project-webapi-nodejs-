const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).render("register", { error: "User already exists", user: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });

        console.log("✅ User registered:", user);
        res.redirect("/");
    } catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).render("register", { error: "Server error", user: null });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).render("login", { error: "Invalid credentials", user: null });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render("login", { error: "Invalid credentials", user: null });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });

        console.log("✅ User logged in:", user);
        res.redirect("/");
    } catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).render("login", { error: "Server error", user: null });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
};
