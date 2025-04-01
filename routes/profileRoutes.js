// ✅ Import Express framework
const express = require('express');

// ✅ Import authentication middleware to protect profile routes
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Import profile-related controller functions
const {renderEditProfile, updateFullProfile, renderProfile, updateProfilePhoto, updateUserInfo, updatePassword, removeRating } = require('../controllers/profileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router(); // ✅ Create a new Express router

// ✅ Define profile-related routes (all require authentication)
router.get('/', authMiddleware, renderProfile); // Route to view profile
// router.post('/update-photo', authMiddleware, updateProfilePhoto); // Route to update profile picture
// router.post('/update-info', authMiddleware, updateUserInfo); // Route to update user information
// router.post('/update-password', authMiddleware, updatePassword); // Route to update password
router.post('/remove-rating', authMiddleware, removeRating); // Route to remove a rating

router.post('/update-photo', authMiddleware, upload.single('photo'), updateProfilePhoto);

router.get('/edit', authMiddleware, renderEditProfile); // דף טופס עריכה
router.post('/edit', authMiddleware, updateFullProfile); // שליחת טופס עריכה

module.exports = router; // ✅ Export router for use in the main app
