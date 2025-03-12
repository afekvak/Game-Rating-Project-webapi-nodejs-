// ✅ Import required modules
const jwt = require('jsonwebtoken'); // Import JSON Web Token (JWT) for authentication
const User = require('../models/User'); // Import the User model to interact with the database
require('dotenv').config(); // Load environment variables from the .env file

// ✅ Middleware function to authenticate the user
module.exports = async (req, res, next) => {
    try {
        // ✅ Check if the request contains user data and a valid userId
        if (!req.user || !req.user.userId) {
            console.log("❌ No user ID in request."); // Log the issue if user ID is missing
            return res.redirect('/login'); // Redirect to login page if user is not authenticated
        }

        // ✅ Fetch the user from the database using the provided userId
        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log("❌ User not found in database."); // Log if user does not exist in DB
            return res.redirect('/login'); // Redirect to login page if user is not found
        }

        // ✅ Attach the user object to the request and response locals
        req.user = user; // Store user data in req.user for further use in request lifecycle
        res.locals.user = user; // Store user data in res.locals to be accessible in templates

        console.log("✅ Authenticated User:", user.username); // Log successful authentication
        next(); // ✅ Proceed to the next middleware or route handler
    } catch (error) {
        console.error("❌ Authentication error:", error.message); // Log authentication errors
        return res.redirect('/login'); // Redirect to login page if an error occurs
    }
};
