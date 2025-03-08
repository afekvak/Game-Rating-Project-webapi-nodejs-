const express = require('express');
const { rateGame } = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/rate', authMiddleware, rateGame);

module.exports = router;