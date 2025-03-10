const express = require('express');
const { getExploreGames, renderGameInfo, getGameStores } = require('../controllers/gameController'); // ✅ Import new function

const router = express.Router();

router.get('/explore', getExploreGames);
router.get('/game-info/:id', renderGameInfo); // ✅ Cleaner route
router.get('/:id/stores', getGameStores);

module.exports = router;
