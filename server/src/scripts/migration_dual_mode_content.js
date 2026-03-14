import pool from '../config/db.js';

async function migrate() {
    console.log("🚀 Starting migration: Adding dual-mode content columns to topics table...");
    try {
        await pool.query(`
            ALTER TABLE topics 
            ADD COLUMN IF NOT EXISTS content_easy_markdown TEXT,
            ADD COLUMN IF NOT EXISTS content_deep_markdown TEXT;
        `);

        console.log("📊 Migrating existing content to content_easy_markdown...");
        await pool.query(`
            UPDATE topics 
            SET content_easy_markdown = content_markdown 
            WHERE content_easy_markdown IS NULL AND content_markdown IS NOT NULL;
        `);

        console.log("✅ SUCCESS: Dual-mode content columns added and data migrated.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration FAILED:", err.message);
        process.exit(1);
    }
}

migrate();
