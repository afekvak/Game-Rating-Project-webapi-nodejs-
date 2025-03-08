const express = require('express');
const { getExploreGames, getGameInfo, getGameStores } = require('../controllers/gameController'); // ✅ Import store function

const router = express.Router();

router.get('/explore', getExploreGames);
router.get('/game-info/:id', async (req, res) => {
    try {
        const referer = req.headers.referer;
        let backPage = "explore"; // Default to explore

        if (referer) {
            if (referer.includes("/")) backPage = "home"; // If coming from home
            if (referer.includes("/games/explore")) backPage = "explore"; // If coming from explore
        }

        // ✅ Fetch game details using `getGameInfo`
        const game = await getGameInfo(req.params.id);

        res.render('game-info', { game, user: res.locals.user || null, referer: backPage });
    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        res.render('game-info', { game: null, user: res.locals.user || null, referer: "explore" }); // Default to explore
    }
});
router.get('/:id/stores', getGameStores); // ✅ Add store page route

module.exports = router;

