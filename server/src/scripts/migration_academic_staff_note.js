import pool from '../config/db.js';

async function migrate() {
    console.log("🚀 Starting migration: Adding staff_engineer_note to topics table...");
    try {
        await pool.query(`
            ALTER TABLE topics 
            ADD COLUMN IF NOT EXISTS staff_engineer_note TEXT;
        `);
        console.log("✅ SUCCESS: staff_engineer_note column added.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration FAILED:", err.message);
        process.exit(1);
    }
}

migrate();
