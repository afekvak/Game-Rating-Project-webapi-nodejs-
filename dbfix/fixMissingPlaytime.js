const mongoose = require("mongoose");
const axios = require("axios");
const Game = require("../models/Game");
require("dotenv").config();

const RAWG_API_KEY = process.env.RAWG_API_KEY;

async function updateMissingPlaytime() {
  await mongoose.connect(process.env.MONGO_URI); // ודא שה-MONGO_URI מוגדר ב-.env שלך
  console.log("🟢 Connected to MongoDB");

  const games = await Game.find({ $or: [{ playtime: null }, { playtime: { $exists: false } }] });
  console.log(`🔍 Found ${games.length} games with missing playtime`);

  for (const game of games) {
    try {
      const response = await axios.get(`https://api.rawg.io/api/games/${game.rawgId}`, {
        params: { key: RAWG_API_KEY }
      });

      const newPlaytime = response.data?.playtime;

      if (newPlaytime !== undefined) {
        game.playtime = newPlaytime;
        await game.save();
        console.log(`✅ Updated ${game.name} with playtime: ${newPlaytime}h`);
      } else {
        console.warn(`⚠️ No playtime found for ${game.name}`);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${game.name}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log("🔚 Done & disconnected");
}

updateMissingPlaytime();
