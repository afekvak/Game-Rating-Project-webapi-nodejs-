const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ✅ Ensure this is set in your .env

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.getGameRecommendations = async (ratedGames, numGames = 10) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
        I have played and rated these video games: ${ratedGames.join(", ")}.
        Based on this, recommend ${numGames} similar games.
        Respond with a JSON array like:
        ["Game 1", "Game 2", "Game 3", ..., "Game ${numGames}"].
        `;

        const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });

        const response = result.response;
        const text = response.candidates[0]?.content?.parts[0]?.text;

// ✅ Remove Markdown formatting if present
const cleanText = text.replace(/```json|```/g, "").trim();

try {
    return JSON.parse(cleanText).map(game => ({ name: game }));
} catch (error) {
    console.error("❌ JSON Parsing Error from Gemini:", error.message);
    return [];
}


    } catch (error) {
        console.error("❌ Gemini API Error:", error.message);
        return [];
    }
};

