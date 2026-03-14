import 'dotenv/config';
import { callOllama } from '../utils/aiClient.js';

async function test() {
    console.log("Testing AI Client Fallback...");
    try {
        const res = await callOllama("Explain Binary Search in one sentence.");
        console.log("RESPONSE:", JSON.stringify(res, null, 2));
    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

test();
