// ✅ Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Retrieve API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ✅ Ensure this is set in your .env file

// ✅ Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const axios = require("axios");
const RAWG_API_KEY = process.env.RAWG_API_KEY; // API Key for RAWG API
const { getGameInfo } = require("../controllers/gameController");
// ✅ Function to fetch game recommendations using AI
exports.getGameRecommendations = async (ratedGames, numGames = 10, prefs = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // ✅ נבנה חלקים מתוך ההעדפות של המשתמש
    const genrePart = prefs?.favoriteGenres?.length
      ? `I especially enjoy games in the genres: ${prefs.favoriteGenres.join(", ")}.`
      : "";

    const hourPart = prefs?.avgHours
      ? `I usually play around ${prefs.avgHours.toFixed(1)} hours per game.`
      : "";

    const ratingPart = prefs?.avgRating
      ? `My average rating for games is about ${prefs.avgRating.toFixed(1)}.`
      : "";

    // ✅ נבנה את ה־Prompt המלא
    const prompt = `
I have played and rated the following video games: ${ratedGames.join(", ")}.
${genrePart}
${hourPart}
${ratingPart}
Based on this, recommend ${numGames} similar games I might like.
Respond with a JSON array like:
["Game 1", "Game 2", ..., "Game ${numGames}"].
Only output the JSON array with no extra explanation or text.
`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    });

    const response = result.response;
    const text = response.candidates[0]?.content?.parts[0]?.text;
    const cleanText = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanText).map(name => ({ name }));
    } catch (error) {
      console.error("❌ JSON Parsing Error from Gemini:", error.message);
      return [];
    }

  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return [];
  }
};


analyzeReviews = async (reviews) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
  Analyze the following user game reviews.
  For each one, identify whether it's positive, neutral, or negative.
  Then extract what aspects the user mentioned (story, gameplay, graphics, characters, etc.), and summarize the user's preferences.
  
  Return JSON array like:
  [
    {
      "review": "I loved the story and characters...",
      "sentiment": "positive",
      "liked": ["story", "characters"],
      "disliked": []
    },
    ...
  ]
  Here are the reviews:
  ${reviews.map(r => `- ${r}`).join("\n")}
    `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = result.response.candidates[0]?.content?.parts[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error("❌ Error analyzing reviews:", error.message);
    return [];
  }
};

exports.getRecommendationsFromReviews = async (userRatings) => {
  const reviews = userRatings.map(r => r.review).filter(Boolean);
  if (!reviews.length) return [];

  const analyzed = await analyzeReviews(reviews);
  const likedAspects = new Set();

  analyzed.forEach(entry => {
    entry.liked?.forEach(aspect => likedAspects.add(aspect));
  });

  const aspectString = Array.from(likedAspects).join(", ") || "gameplay";

  // 📤 בקשה לג'מיני
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
Based on a user who enjoys these aspects in games: ${aspectString}, suggest 12 great games.
Respond with a JSON array: ["Game 1", "Game 2", ...]
  `;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  const raw = result.response.candidates[0]?.content?.parts[0]?.text || "";
  const gameNames = JSON.parse(raw.replace(/```json|```/g, "").trim());

  // 🔁 שליפה מ־RAWG
  const gameDetails = await Promise.all(
    gameNames.map(async name => {
      try {
        const search = await axios.get(`https://api.rawg.io/api/games`, {
          params: { key: RAWG_API_KEY, search: name, page_size: 1 }
        });

        const rawgGame = search.data.results[0];
        if (!rawgGame || !rawgGame.id) return { name, image: "/images/default-game.png" };

        const fullGame = await getGameInfo(rawgGame.id);

        return {
          id: fullGame.rawgId,
          name: fullGame.name,
          image: fullGame.image,
          genre: fullGame.genre || "Unknown",
          playtime: fullGame.playtime || null,
          reason: `💬 Recommended based on your interest in: ${aspectString}`
        };
      } catch (err) {
        console.error(`❌ Error for game "${name}":`, err.message);
        return { name, image: "/images/default-game.png" };
      }
    })
  );

  return gameDetails;
};