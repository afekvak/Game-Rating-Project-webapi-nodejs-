const bcrypt = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating and verifying JSON Web Tokens (JWT)
const User = require("../models/User"); // Import the User model

/**
 * Handles user registration
 * 1. Checks if the email already exists in the database.
 * 2. Hashes the password for security.
 * 3. Saves the new user in the database.
 * 4. Generates a JWT token for authentication.
 * 5. Stores the token in a cookie and redirects to home.
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body; // Extract user details from the request

        // Check if a user with this email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).render("register", { error: "❌ User already exists!", user: null });
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        user = new User({ username, email, password: hashedPassword });
        await user.save(); // Save user to database

        // Generate a JWT token containing the user's ID
        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Store the generated token in the user record
        user.token = token;
        await user.save();

        // Store the token in a cookie for authentication
        res.cookie("token", token, { httpOnly: true });

        console.log("✅ User registered and authenticated:", user);
        res.redirect("/"); // Redirect to home page after successful registration
    } catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).render("register", { error: "❌ Server error. Try again.", user: null });
    }
};

/**
 * Handles user login
 * 1. Checks if the email exists in the database.
 * 2. Compares the provided password with the stored hashed password.
 * 3. Generates a JWT token upon successful authentication.
 * 4. Stores the token in a cookie and redirects to home.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract login credentials

        // Check if the user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).render("login", { error: "❌ Invalid email or password!", user: null });
        }

        // Compare the hashed password with the user-provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render("login", { error: "❌ Invalid email or password!", user: null });
        }

        // Generate a new JWT token containing the user's ID
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h" // Token expires in 1 hour
        });

        // Store the token in a cookie for authentication
        res.cookie("token", token, { httpOnly: true, secure: false });

        res.redirect("/"); // Redirect to home page after successful login

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).render("login", { error: "❌ Server error. Try again.", user: null });
    }
};

/**
 * Handles user logout
 * 1. Clears the authentication token from cookies.
 * 2. Redirects to the home page.
 */
exports.logout = (req, res) => {
    res.clearCookie("token"); // Remove the authentication token
    res.redirect("/"); // Redirect to home page
};
