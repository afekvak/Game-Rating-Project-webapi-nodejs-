const { OpenAI } = require('openai');
require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const getGameRecommendations = async (gameList) => {
    const prompt = `Based on the following games: ${gameList.join(", ")}, recommend similar games.`;
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "system", content: prompt }]
    });
    return response.choices[0].message.content;
};
module.exports = { getGameRecommendations };