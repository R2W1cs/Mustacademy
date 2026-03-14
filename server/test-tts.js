import Groq from "groq-sdk";
import 'dotenv/config';
import fs from 'fs';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    console.log("Testing Groq Orpheus TTS...");
    try {
        const response = await groq.audio.speech.create({
            model: "canopylabs/orpheus-v1-english",
            voice: "troy",
            input: "Hello from the CSM Roadmap Platform. Testing the high quality Nova voice.",
            response_format: "wav"
        });
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync("test-tts.wav", buffer);
        console.log("Success! Audio saved to test-tts.wav");
    } catch (err) {
        console.error("TTS Test Failed:", err);
    }
}

main();
