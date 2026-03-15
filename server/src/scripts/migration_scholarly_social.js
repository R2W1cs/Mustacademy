import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Scholarly Social Protocol Migration...");

        // 1. Update Users table for Online Presence
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log("✅ Users table updated with last_active_at column.");

        console.log("🚀 Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
