// ✅ Import Express framework
const express = require('express');
// ✅ Import authentication controller functions
const { register, login, logout , verifyEmail,googleCallback,googleLogin} = require('../controllers/authController');


const router = express.Router(); // ✅ Create a new Express router


// ✅ Define authentication routes
router.post('/register', register); // Route for user registration
router.post('/login', login); // Route for user login
router.get('/logout', logout); // Route for logging out

router.get('/verify-email', verifyEmail); // Route for email verification

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

module.exports = router; // ✅ Export router for use in the main app
