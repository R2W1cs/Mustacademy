import axios from 'axios';
import 'dotenv/config';

const API_URL = 'http://localhost:3001/ai/chat';
const TOKEN = 'YOUR_TEST_TOKEN'; // Replace with a valid token from your DB or login

async function testAI(message) {
    console.log(`\nTesting Input: "${message}"`);
    try {
        const res = await axios.post(API_URL, { message }, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log(`Response Length: ${res.data.reply.length} chars`);
        console.log(`Word Count: ${res.data.reply.split(' ').length}`);
        console.log(`Full Response:\n${res.data.reply}`);
    } catch (err) {
        console.error("AI Request Failed:", err.response?.data || err.message);
    }
}

// simulate basic complexity detection logic (same as in controller)
function detectComplexity(message) {
    return message.length > 50 || /explain|how|why|deep dive|protocol|architecture|design/i.test(message);
}

const inputs = [
    "Hello Professor, how are you?",
    "Explain the difference between a process and a thread in terms of memory isolation and context switching overhead.",
    "What is a variable?",
    "I need a deep dive into React concurrency and transitions."
];

inputs.forEach(input => {
    console.log(`Input: "${input}" | Is Complex: ${detectComplexity(input)}`);
});
