import pool from '../config/db.js';

async function reset() {
    console.log("Resetting content_markdown for all topics...");
    try {
        const res = await pool.query("UPDATE topics SET content_markdown = NULL");
        console.log(`✅ SUCCESS: Reset ${res.rowCount} topics.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Reset FAILED:", err.message);
        process.exit(1);
    }
}

reset();
