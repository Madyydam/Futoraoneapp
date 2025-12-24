require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testGenerate() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const payload = {
        contents: [{
            role: 'user',
            parts: [{ text: "Hello, are you working?" }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Error: " + response.status);
            console.error(await response.text());
        } else {
            const data = await response.json();
            console.log("Response: ", data.candidates?.[0]?.content?.parts?.[0]?.text);
        }
    } catch (e) {
        console.error(e);
    }
}

testGenerate();
