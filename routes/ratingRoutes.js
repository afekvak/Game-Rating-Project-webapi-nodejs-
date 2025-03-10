const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
const ratingController = require('../controllers/ratingController');

router.post('/submit', authMiddleware, ratingController.submitRating);

module.exports = router;
