const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Ensure it's updated

router.get('/', (req, res) => {
    res.render('home', { user: res.locals.user || null });
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

// ✅ Profile route now uses JWT authentication
router.get('/profile', authMiddleware, (req, res) => {
    res.render('profile', { user: res.locals.user });
});

module.exports = router;
