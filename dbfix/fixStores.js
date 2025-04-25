const mongoose = require('mongoose');
const Game = require('./models/Game'); // עדכן נתיב בהתאם למיקום האמיתי שלך
require('dotenv').config();

const STORE_NAMES = {
  1: "Steam",
  2: "Xbox Store",
  3: "PlayStation Store",
  4: "App Store",
  5: "GOG",
  6: "Nintendo Store",
  7: "Xbox 360 Store",
  8: "Google Play",
  9: "itch.io",
  11: "Epic Games"
};

const fixStoreNames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const games = await Game.find({ "stores.name": "Unknown Store" });

    console.log(`🔍 Found ${games.length} games with missing store names.`);

    for (const game of games) {
      let updated = false;

      game.stores = game.stores.map(store => {
        if (store.name === "Unknown Store" && store.url) {
          const matchedId = Object.keys(STORE_NAMES).find(id => {
            return store.url.includes(STORE_NAMES[id].toLowerCase().replace(/\s/g, '')) ||
                   store.url.includes(STORE_NAMES[id].split(" ")[0].toLowerCase());
          });

          if (matchedId) {
            updated = true;
            return {
              ...store.toObject(), // אם store הוא מסמך של mongoose
              name: STORE_NAMES[matchedId]
            };
          }
        }
        return store;
      });

      if (updated) {
        await game.save();
        console.log(`✅ Updated game: ${game.name}`);
      }
    }

    console.log("🎉 Done fixing store names.");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error fixing store names:", err);
    mongoose.disconnect();
  }
};

fixStoreNames();
