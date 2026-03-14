import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Users Table Extension Migration...");

        // Add targeted career columns to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS target_company TEXT,
            ADD COLUMN IF NOT EXISTS technical_pillar TEXT
        `);

        console.log("✅ Users table updated with new career columns.");
        console.log("🚀 Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
