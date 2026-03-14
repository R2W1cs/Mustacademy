import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Dream Job Migration...");

        // Add dream_job column to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS dream_job TEXT
        `);

        console.log("✅ Users table updated with dream_job column.");
        console.log("🚀 Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
