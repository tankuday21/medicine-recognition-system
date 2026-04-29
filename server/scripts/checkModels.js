const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get client
        // Actually the SDK doesn't expose listModels directly on the instance easily in all versions, 
        // let's check the docs pattern or use a direct fetch if needed.
        // Standard Node SDK usually has it on the client.

        console.log("Fetching available models...");
        // Current SDK might not expose listModels easily, let's try strict REST if SDK fails or assume standard.
        // But let's verify if we can just try 2.0-flash-exp.

        // Quick test of 3.0-flash-preview
        try {
            const testModel = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
            await testModel.generateContent("test");
            console.log("✅ gemini-3-flash-preview is AVAILABLE");
        } catch (e) {
            console.log("❌ gemini-3-flash-preview failed: " + e.message);
        }

        // Quick test of gemini-2.5-flash
        try {
            const testModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await testModel.generateContent('Test');
            console.log("✅ gemini-2.5-flash is AVAILABLE");
        } catch (e) {
            console.log("❌ gemini-2.5-flash failed: " + e.message);
        }

        // Quick test of user's claim: gemini-2.5-flash
        try {
            const testModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await testModel.generateContent('Test');
            console.log("✅ gemini-2.5-flash is AVAILABLE");
        } catch (e) {
            console.log("❌ gemini-2.5-flash failed: " + e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
