// ✅ Import Express framework
const express = require('express');

// ✅ Import game-related controller functions
const { getExploreGames, renderGameInfo, getGameStores } = require('../controllers/gameController');

const router = express.Router(); // ✅ Create a new Express router

// ✅ Define game-related routes
router.get('/explore', getExploreGames); // Route for exploring games
router.get('/game-info/:id', renderGameInfo); // Route for fetching game details by ID
router.get('/:id/stores', getGameStores); // Route for fetching stores selling a specific game

module.exports = router; // ✅ Export router for use in the main app
