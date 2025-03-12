// ✅ Import Express framework
const express = require('express');

const router = express.Router(); // ✅ Create a new Express router

// ✅ Import view-related controller functions
const { renderHome, renderRegister, renderLogin, renderSearch, getSearchSuggestions } = require('../controllers/viewController');

// ✅ Define page rendering routes
router.get('/', renderHome); // Route for the home page
router.get('/register', renderRegister); // Route for the registration page
router.get('/login', renderLogin); // Route for the login page
router.get('/search', renderSearch); // Route for the search page
router.get('/search/suggestions', getSearchSuggestions); // Route for search auto-suggestions

module.exports = router; // ✅ Export router for use in the main app
