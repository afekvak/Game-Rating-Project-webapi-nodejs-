const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

router.get('/', authMiddleware, profileController.renderProfile);
router.post('/update-photo', authMiddleware, profileController.updateProfilePhoto);
router.post('/update-info', authMiddleware, profileController.updateUserInfo);
router.post('/update-password', authMiddleware, profileController.updatePassword);
router.post('/remove-rating', authMiddleware, profileController.removeRating);

module.exports = router;
