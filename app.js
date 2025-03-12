// ✅ Import required modules
const express = require('express'); // Import Express framework
const connectDB = require('./config/db'); // Import database connection function
const dotenv = require('dotenv'); // Load environment variables from .env file
const cors = require('cors'); // Enable Cross-Origin Resource Sharing (CORS)
const cookieParser = require('cookie-parser'); // Parse cookies from incoming requests
const jwt = require('jsonwebtoken'); // JSON Web Token (JWT) for authentication

// ✅ Import route handlers
const recommendationRoutes = require('./routes/recommendationRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const profileRoutes = require('./routes/profileRoutes'); 
const gameRoutes = require('./routes/gameRoutes');
const authRoutes = require('./routes/authRoutes');
const viewRoutes = require('./routes/viewRoutes');

const User = require('./models/User'); // Import User model (not used in this file but required in project)

dotenv.config(); // ✅ Load environment variables
const app = express(); // ✅ Create an instance of Express
connectDB(); // ✅ Connect to the database

// ✅ Middleware setup
app.use(express.json()); // Enable JSON parsing for incoming requests
app.use(express.urlencoded({ extended: false })); // Enable parsing of URL-encoded data
app.use(cors()); // Enable CORS for handling cross-origin requests
app.use(cookieParser()); // Enable parsing of cookies

// ✅ Set the view engine to EJS (for rendering dynamic HTML pages)
app.set('view engine', 'ejs');

// ✅ Serve static files from the 'public' folder (CSS, JS, images, etc.)
app.use(express.static('public'));

// ✅ Middleware to extract user from JWT cookie
app.use((req, res, next) => {
    const token = req.cookies.token; // Retrieve the token from cookies

    if (!token) {
        console.log("❌ No token found in request.");
        res.locals.user = null; // Set user to null in EJS templates
        return next(); // Proceed to the next middleware
    }

    try {
        // ✅ Verify and decode the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded JWT:", decoded);

        // ✅ Assign user ID to request object for future use
        req.user = { userId: decoded.userId };
        res.locals.user = req.user; // ✅ Make user data available in EJS templates
        console.log("✅ Middleware assigned user:", req.user);
    } catch (err) {
        console.error("❌ Invalid Token:", err.message);
        res.locals.user = null; // Clear user data on invalid token
    }
    next(); // Proceed to the next middleware or route handler
});

// ✅ Define Routes
app.use('/profile', profileRoutes); // Routes related to user profiles
app.use('/auth', authRoutes); // Authentication routes (register, login, logout)
app.use('/games', gameRoutes); // Game-related routes (explore, game details, stores)
app.use('/ratings', ratingRoutes); // Rating system routes
app.use('/recommendations', recommendationRoutes); // AI-powered recommendations route
app.use('/', viewRoutes); // General page views (home, search, register, login)

module.exports = app; // ✅ Export the Express app instance for use in the main server file
