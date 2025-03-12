// ✅ Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Retrieve API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ✅ Ensure this is set in your .env file

// ✅ Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ Function to fetch game recommendations using AI
exports.getGameRecommendations = async (ratedGames, numGames = 10) => {
    try {
        // ✅ Select the AI model (Gemini 1.5 Pro)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // ✅ Construct the AI prompt with the user's rated games
        const prompt = `
        I have played and rated these video games: ${ratedGames.join(", ")}.
        Based on this, recommend ${numGames} similar games.
        Respond with a JSON array like:
        ["Game 1", "Game 2", "Game 3", ..., "Game ${numGames}"].
        `;

        // ✅ Send the prompt to Gemini AI and request recommendations
        const result = await model.generateContent({ 
            contents: [{ 
                role: "user", 
                parts: [{ text: prompt }] // ✅ Provide the prompt as input
            }] 
        });

        // ✅ Extract the AI response
        const response = result.response;
        const text = response.candidates[0]?.content?.parts[0]?.text; // ✅ Get AI response text

        // ✅ Remove unnecessary Markdown formatting if present
        const cleanText = text.replace(/```json|```/g, "").trim();

        try {
            // ✅ Parse the AI response into a valid JSON array
            return JSON.parse(cleanText).map(game => ({ name: game })); // ✅ Convert game names to object format
        } catch (error) {
            console.error("❌ JSON Parsing Error from Gemini:", error.message);
            return []; // ✅ Return an empty array in case of parsing failure
        }

    } catch (error) {
        console.error("❌ Gemini API Error:", error.message); // ✅ Log API errors
        return []; // ✅ Return an empty array if API request fails
    }
};
