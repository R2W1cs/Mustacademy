import pool from './server/src/config/db.js';

async function checkColumns() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'chat_messages'");
        console.log("Columns in chat_messages:", res.rows.map(r => r.column_name));
        process.exit(0);
    } catch (err) {
        console.error("Error checking columns:", err);
        process.exit(1);
    }
}

checkColumns();
