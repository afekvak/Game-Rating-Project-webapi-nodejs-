// ✅ Import the Rating model to interact with the ratings collection in the database
const Rating = require('../models/Rating');

// ✅ Function to handle rating submission
exports.submitRating = async (req, res) => {
    try {
        // ✅ Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. Please log in." }); // Return 401 Unauthorized if no user is logged in
        }

        // ✅ Extract gameId and rating from the request body
        const { gameId, rating } = req.body;

        // ✅ Validate input: Ensure both gameId and rating are provided
        if (!gameId || !rating) {
            return res.status(400).json({ message: "Game ID and rating are required." }); // Return 400 Bad Request if any field is missing
        }

        // ✅ Save the rating to the database
        await Rating.create({ user: req.user._id, gameId, rating }); // Create a new rating document with the user ID, game ID, and rating

        // ✅ Send success response
        res.json({ message: "Rating saved successfully!" }); // Respond with a success message
    } catch (error) {
        console.error("❌ Error saving rating:", error); // Log error to the console
        res.status(500).json({ message: "Error saving rating." }); // Return 500 Internal Server Error if something goes wrong
    }
};
