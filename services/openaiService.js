
// currently not using OpenAI API, using gemini API instead


// const OpenAI = require("openai");
// require('dotenv').config();

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// exports.getGameRecommendations = async (userRatings) => {
//     const userGamePreferences = userRatings.map(rating => `Game ID: ${rating.gameId}, Rating: ${rating.rating}`).join("\n");

//     const prompt = `
//     Based on the following game ratings from a user, suggest 5 similar games:
//     ${userGamePreferences}
    
//     Provide the game names in a numbered list.
//     `;

//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [{ role: "system", content: prompt }],
//             max_tokens: 100
//         });

//         return response.choices[0].message.content.trim().split("\n");
//     } catch (error) {
//         console.error("❌ OpenAI API Error:", error);
//         return [];
//     }
// };
