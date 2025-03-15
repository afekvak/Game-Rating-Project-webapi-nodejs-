const bcrypt = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating and verifying JSON Web Tokens (JWT)
const User = require("../models/User"); // Import the User model
const { sendVerificationEmail, sendWelcomeEmail } = require("../services/emailService"); // ✅ Import email service


/**
 * Handles user registration
 * 1. Checks if the email already exists in the database.
 * 2. Hashes the password for security.
 * 3. Saves the new user in the database.
 * 4. Sends a verification email to the user.
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

        // Create a new user instance (emailVerified set to false)
        user = new User({ username, email, password: hashedPassword, emailVerified: false });
        await user.save(); // Save user to database

        // Generate a verification token
        const verificationToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        // ✅ Send verification email
        sendVerificationEmail(user.email, verificationToken);

        console.log("✅ User registered. Verification email sent.");
        res.render("register", { error: "📧 Please check your email to verify your account!", user: null });

    } catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).render("register", { error: "❌ Server error. Try again.", user: null });
    }
};

/**
 * Handles email verification
 * 1. Decodes the verification token.
 * 2. Finds the user and updates their emailVerified status.
 * 3. Redirects to login after successful verification.
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send("Invalid verification link.");
        }

        // ✅ Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Find user and update verification status
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).send("User not found.");
        }

        user.emailVerified = true;
        await user.save();

        console.log(`✅ User ${user.email} verified.`);

        // ✅ Send Welcome Email
        sendWelcomeEmail(user.email, user.username);

        // ✅ Redirect to login page with a success message
        res.render("login", { error: "✅ Email verified! You can now log in.", user: null });

    } catch (error) {
        console.error("❌ Verification Error:", error);
        res.status(500).send("Verification failed.");
    }
};


/**
 * Handles user login
 * 1. Checks if the email exists in the database.
 * 2. Compares the provided password with the stored hashed password.
 * 3. Ensures the user's email is verified before allowing login.
 * 4. Generates a JWT token upon successful authentication.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract login credentials

        // Check if the user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).render("login", { error: "❌ Invalid email or password!", user: null });
        }

        // ✅ Ensure email is verified before login
        if (!user.emailVerified) {
            return res.status(400).render("login", { error: "❌ Please verify your email before logging in!", user: null });
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


