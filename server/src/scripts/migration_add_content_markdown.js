import pool from '../config/db.js';

async function migrate() {
    console.log("🚀 Starting migration: Adding content_markdown to topics table...");
    try {
        await pool.query(`
            ALTER TABLE topics 
            ADD COLUMN IF NOT EXISTS content_markdown TEXT;
        `);
        console.log("✅ SUCCESS: content_markdown column added.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration FAILED:", err.message);
        process.exit(1);
    }
}

migrate();
