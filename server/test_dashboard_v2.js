
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

const login = async () => {
    console.log("Logging in with rayen@test.com...");
    const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rayen@test.com', password: 'password' })
    });
    const data = await res.json();
    if (!data.token) {
        console.error("Login failed:", data);
        process.exit(1);
    }
    return data.token;
};

const getStats = async (token) => {
    console.log("Fetching stats...");
    const res = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Stats Response:", data);
};

const run = async () => {
    try {
        const token = await login();
        await getStats(token);
    } catch (err) {
        console.error("Test failed:", err);
    }
};

run();
