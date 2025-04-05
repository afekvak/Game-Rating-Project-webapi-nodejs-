// ✅ Import Express framework
const express = require('express');

const router = express.Router(); // ✅ Create a new Express router

// ✅ Import authentication middleware (recommendations are personalized)
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Import recommendation controller function
const { getRecommendations , recommendationsHub, getReviewBasedRecommendations} = require('../controllers/recommendationController');

// ✅ Define recommendation route (requires authentication)
router.get('/', authMiddleware, recommendationsHub); // Route to get recommendations
router.get('/quick', authMiddleware, getRecommendations);
router.get('/reviews',authMiddleware, getReviewBasedRecommendations);
router.get('/favoritegenre', );
router.get('/discover', );

module.exports = router; // ✅ Export router for use in the main app
