const express = require('express');
const { getExploreGames, getGameInfo } = require('../controllers/gameController');

const router = express.Router();

router.get('/explore', getExploreGames);
router.get('/game-info/:id', getGameInfo);

module.exports = router;

