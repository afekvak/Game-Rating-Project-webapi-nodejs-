const axios = require('axios'); // Library for making HTTP requests
const User = require('../models/User'); // Import User model from database
const mongoose = require("mongoose"); // MongoDB library for ObjectId validation
const { fetchYouTubeVideo } = require('../services/youtubeService'); // Import YouTube service
const Game = require("../models/Game"); // Import Game model
const Rating = require('../models/Rating'); // Import Rating model
require('dotenv').config(); // Load environment variables

const RAWG_API_KEY = process.env.RAWG_API_KEY; // API Key for RAWG API
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // API Key for YouTube

// ✅ Store names mapping
const STORE_NAMES = {
    1: "Steam",
    2: "Microsoft Store",
    3: "PlayStation Store",
    4: "App Store",
    5: "GOG",
    6: "Nintendo Store",
    7: "Xbox Store",
    8: "Google Play",
    9: "Epic Games Store", // ✅ Epic Games Store (previous known ID)
    11: "Epic Games Store" // ✅ Another possible ID for Epic Games Store
};

/**
 * Fetches a list of games from RAWG API for the explore page.
 * - Retrieves game data and displays it on the explore page.
 * - Handles both JSON responses and EJS page rendering.
 */
exports.getExploreGames = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        // ✅ שליפה מ-RAWG API
        const response = await axios.get(`https://api.rawg.io/api/games`, {
            params: { key: RAWG_API_KEY, page_size: 12, page: page }
        });

        const rawgGames = response.data.results;

        // ✅ שלוף דירוגים מקומיים עם המידע על המשחקים
        const allRatings = await Rating.find().populate("game");

        // ✅ בנה מיפוי של דירוגים לפי rawgId
        const ratingMap = {};
        allRatings.forEach(rating => {
            const rawgId = rating.game?.rawgId?.toString();
            if (!rawgId) return; // אם אין rawgId – תדלג
            if (!ratingMap[rawgId]) ratingMap[rawgId] = [];
            ratingMap[rawgId].push(rating.rating);
        });

        // ✅ הכנס את הדירוגים למערך המשחקים מ-RAWG
        const games = rawgGames.map(game => {
            const ratings = ratingMap[game.id.toString()] || [];
            const totalRatings = ratings.length;
            const averageRating = totalRatings > 0
                ? (ratings.reduce((sum, r) => sum + r, 0) / totalRatings).toFixed(1)
                : 'N/A';

            return {
                id: game.id,
                name: game.name,
                image: game.background_image || "https://via.placeholder.com/200x300?text=No+Image",
                rating: averageRating,
                totalRatings: totalRatings
            };
        });

        // ✅ אם זו בקשה דרך AJAX
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ games });
        }

        // ✅ טען את עמוד Explore
        res.render("explore", { games, user: req.user || null });

    } catch (error) {
        console.error("❌ Error fetching games from RAWG:", error.message);
        res.status(500).json({ error: "Error fetching games" });
    }
};




// better function (for saving games requires better youtube api )
// exports.getExploreGames = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; // Get current page, default to 1

//         // ✅ Fetch games from RAWG API first
//         const response = await axios.get(`https://api.rawg.io/api/games`, {
//             params: { key: RAWG_API_KEY, page_size: 12, page: page }
//         });

//         let games = await Promise.all(response.data.results.map(async (gameData) => {
//             // ✅ Use getGameInfo to check and save the game
//             let game = await exports.getGameInfo(gameData.id);

//             // ✅ Return formatted game object
//             return {
//                 id: game.rawgId,
//                 name: game.name,
//                 image: game.image || "https://via.placeholder.com/200x300?text=No+Image",
//                 rating: game.averageRating || "N/A"
//             };
//         }));

//         console.log("🔍 Current User in explore:", req.user); // Debugging user info

//         // ✅ If it's an AJAX request, return JSON instead of rendering a page
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             return res.json({ games });
//         }

//         // ✅ Render the explore page with game data
//         res.render("explore", { games, user: req.user || null });

//     } catch (error) {
//         console.error("❌ Error fetching games from RAWG:", error);
//         res.status(500).json({ error: "Error fetching games" });
//     }
// };
/**
 * Fetches detailed game information from RAWG API.
 * - Retrieves game data, trailer, gameplay, and store links.
 * - Updates the user's last viewed games if logged in.
 */


exports.getGameInfo = async (gameId, userId) => {
    try {
        const rawgId = String(gameId); 
        console.log("📥 getGameInfo called with gameId:", rawgId, "| userId:", userId);

        // ✅ Try to find the game in DB
        let game = await Game.findOne({ rawgId });

        if (game) {
            console.log(`✅ Game found in database: ${game.name}`);
        } else {
            console.log(`🔍 Game not found in database. Fetching from RAWG API...`);

            const response = await axios.get(`https://api.rawg.io/api/games/${rawgId}`, {
                params: { key: RAWG_API_KEY }
            });

            if (!response.data || !response.data.id) {
                console.error(`❌ Game not found for ID: ${rawgId}`);
                return null;
            }

            const gameData = response.data;

            // ✅ Fetch YouTube trailer & gameplay
            const trailer = await fetchYouTubeVideo(gameData.name, "trailer");
            const gameplay = await fetchYouTubeVideo(gameData.name, "gameplay");

            // ✅ Fetch Store Links
            const storeResponse = await axios.get(`https://api.rawg.io/api/games/${rawgId}/stores`, {
                params: { key: RAWG_API_KEY }
            });

            const storeLinks = storeResponse.data.results.map(store => ({
                name: STORE_NAMES[store.store_id] || "Unknown Store",
                url: store.url
              }));

            // ✅ Create new game and save
            game = new Game({
                rawgId: String(gameData.id),
                name: gameData.name || "Unknown Game",
                description: gameData.description_raw || "No description available.",
                genre: gameData.genres?.map(g => g.name).join(", ") || "Unknown",
                image: gameData.background_image || "/images/no-image.jpg",
                trailer: trailer || null,
                gameplay: gameplay || null,
                stores: storeLinks.length > 0 ? storeLinks : [],
                playtime: gameData.playtime || null // ✅ הוספה חשובה!
            });
            

            await game.save();
            console.log(`✅ Game saved in database: ${game.name}`);
        }

        console.log("🔎 typeof game.rawgId:", typeof game.rawgId, "| value:", game.rawgId);

        // ✅ Update user's last viewed games
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user) {
                let lastGames = user.lastVisitedGames?.map(String) || [];

                // הסר אם כבר קיים
                lastGames = lastGames.filter(id => id !== String(game.rawgId));

                // הוסף לראש
                lastGames.unshift(String(game.rawgId));

                // שמור עד 5
                lastGames = lastGames.slice(0, 5);

                await User.findByIdAndUpdate(userId, { lastVisitedGames: lastGames });

                console.log(`✅ Last viewed games updated for ${user.username}:`, lastGames);
            } else {
                console.warn(`⚠️ No user found with ID ${userId}`);
            }
        } else {
            console.warn(`⚠️ No valid userId provided. Skipping lastViewedGames update.`);
        }

        return game;

    } catch (error) {
        console.error("❌ Error fetching game info:", error);
        return null;
    }
};



/**
 * Renders the game information page.
 * - Determines the previous page to set the back button.
 * - Fetches game details from RAWG API.
 * - Updates the user's last viewed games if logged in.
 */




exports.renderGameInfo = async (req, res) => {
    try {
        const referer = req.headers.referer;
        let backPage = "explore";

        if (referer) {
            if (referer.endsWith("/")) backPage = "home";
            if (referer.includes("/games/explore")) backPage = "explore";
        }

        const userId = req.user?.userId || req.user?._id || null;
        console.log(`🔄 User ${userId ? userId : "Guest"} is viewing game ID: ${req.params.id}`);

        const game = await exports.getGameInfo(req.params.id, userId);

        if (!game) {
            return res.status(404).render('game-info', { game: null, referer: backPage, averageRating: 0, totalRatings: 0 });
        }

        const ratings = await Rating.find({ game: game._id });

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings)
            : 0;

        res.render('game-info', {
            game,
            referer: backPage,
            averageRating,
            totalRatings
        });

    } catch (error) {
        console.error("❌ Error rendering game info:", error);
        res.status(500).render('game-info', { game: null, referer: "explore", averageRating: 0, totalRatings: 0 });
    }
};




/**
 * Fetches the available store links for a game from RAWG API.
 * - Retrieves game store purchase links from RAWG API.
 * - Maps store IDs to human-readable names.
 */
exports.getGameStores = async (req, res) => {
    try {
      const { id } = req.params;
  
      console.log("🔎 Requested store links for RAWG ID:", id);
  
      // 1. Try to get the game from DB first
      let game = await Game.findOne({ rawgId: id });
  
      // 2. If not in DB – fetch from RAWG API
      if (!game) {
        console.log("📡 Game not found in DB, fetching from RAWG API...");
  
        const gameRes = await axios.get(`https://api.rawg.io/api/games/${id}`, {
          params: { key: process.env.RAWG_API_KEY }
        });
  
        if (!gameRes.data || !gameRes.data.name) {
          return res.status(404).send("Game not found.");
        }
  
        game = {
          name: gameRes.data.name
        };
      }
  
      // 3. Fetch store links
      const storeRes = await axios.get(`https://api.rawg.io/api/games/${id}/stores`, {
        params: { key: process.env.RAWG_API_KEY }
      });
  
      const storeLinks = (storeRes.data.results || []).map(store => ({
        name: STORE_NAMES[store.store_id] || "Unknown Store",
        url: store.url
      }));
  
      // 4. Render page with data
      res.render('game-stores', {
        game: {
          name: game.name,
          stores: storeLinks
        }
      });
  
    } catch (error) {
      console.error("❌ Error fetching store links:", error.message);
      res.status(500).send("Error fetching store links.");
    }
  };

/**
 * Fetches the most popular games from RAWG API.
 * - Retrieves the most popular games based on number of additions.
 * - Returns a list of games with name, ID, image, and rating.
 */

exports.getTopRatedGames = async () => {
    try {
        // 🧠 שלוף את כל הדירוגים + המשחקים הקשורים
        const ratings = await Rating.find().populate('game');

        // 🧮 צור מיפוי של משחקים עם סכום דירוגים ומספר מדרגים
        const gameStats = {};

        for (const rating of ratings) {
            const game = rating.game;
            if (!game || !game._id) continue;

            const id = game._id.toString();

            if (!gameStats[id]) {
                gameStats[id] = {
                    id: game.rawgId,
                    name: game.name,
                    image: game.image,
                    trailer: game.trailer || null, // ✅ הוספת לינק לווידאו אם קיים
                    totalRatings: 0,
                    sumRatings: 0
                };
            }

            gameStats[id].totalRatings++;
            gameStats[id].sumRatings += rating.rating;
        }

        // ✨ הפוך את המיפוי לרשימה עם ממוצע דירוג
        const gamesWithAvg = Object.values(gameStats).map(game => {
            const avg = game.sumRatings / game.totalRatings;
            return {
                id: game.id,
                name: game.name,
                image: game.image,
                trailer: game.trailer, // ✅ נוסיף גם בהחזרה
                rating: avg.toFixed(1),
                totalRatings: game.totalRatings
            };
        });

        // 🔝 מיין לפי ממוצע דירוג ותחזיר רק 20
        return gamesWithAvg
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 20);

    } catch (error) {
        console.error("❌ Error getting top rated games:", error);
        return [];
    }
};



