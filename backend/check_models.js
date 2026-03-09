const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
    try {
        console.log("Checking api key with length: " + process.env.GEMINI_API_KEY.length);
        // We can't use listModels directly in the current SDK if it doesn't expose it,
        // but we can try making a direct REST request.
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await res.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(m.name, " - supportedMethods:", m.supportedGenerationMethods.join(', ')));
        } else {
            console.log("Failed to load models:", data);
        }
    } catch (e) {
        console.error(e);
    }
}
checkModels();
