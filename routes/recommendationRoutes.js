// ✅ Import Express framework
const express = require('express');

const router = express.Router(); // ✅ Create a new Express router

// ✅ Import authentication middleware (recommendations are personalized)
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Import recommendation controller function
const { getRecommendations } = require('../controllers/recommendationController');

// ✅ Define recommendation route (requires authentication)
router.get('/', authMiddleware, getRecommendations);

module.exports = router; // ✅ Export router for use in the main app
