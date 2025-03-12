// ✅ Import Express framework
const express = require('express');

const router = express.Router(); // ✅ Create a new Express router

// ✅ Import authentication middleware to protect rating submission
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Import rating controller function
const { submitRating } = require('../controllers/ratingController');

// ✅ Define rating submission route (requires authentication)
router.post('/submit', authMiddleware, submitRating);

module.exports = router; // ✅ Export router for use in the main app
