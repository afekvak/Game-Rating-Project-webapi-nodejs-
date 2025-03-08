const express = require('express');
const router = express.Router();

// Middleware לבדוק אם המשתמש מחובר
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/search', (req, res) => {
    res.render('search', { game: null });
});

// ✅ נתיב לתצוגת הפרופיל
router.get('/profile', authMiddleware, (req, res) => {
    res.render('profile', { user: req.session.user });
});

module.exports = router;
