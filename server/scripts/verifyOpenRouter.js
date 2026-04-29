const OpenAI = require("openai");

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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", // User provided key
});

async function main() {
    try {
        console.log("Testing z-ai/glm-4.5-air:free with text...");
        const completion = await openai.chat.completions.create({
            model: "z-ai/glm-4.5-air:free",
            messages: [
                { role: "user", content: "Hello, are you working?" }
            ],
        });
        console.log("Text Response:", completion.choices[0].message.content);

        console.log("\nTesting z-ai/glm-4.5-air:free with IMAGE (Vision)...");
        // Using a reliable public image URL for testing
        const visionCompletion = await openai.chat.completions.create({
            model: "z-ai/glm-4.5-air:free",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is in this image?" },
                        {
                            type: "image_url",
                            image_url: {
                                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                            },
                        },
                    ],
                },
            ],
        });
        console.log("Vision Response:", visionCompletion.choices[0].message.content);

    } catch (error) {
        console.error("Error:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

main();
