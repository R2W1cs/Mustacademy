import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    console.log("Checking DB Connection for:", process.env.DATABASE_URL.split('@')[1]); // Hide credentials
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("DB Success:", res.rows[0].now);
    } catch (err) {
        console.error("DB Connection FAILED:", err);
    } finally {
        await pool.end();
    }
}

check();
