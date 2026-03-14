import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Campus Lounge Security Update...");

        // Add password column to chat_rooms if it doesn't exist
        await pool.query(`
            ALTER TABLE chat_rooms 
            ADD COLUMN IF NOT EXISTS password VARCHAR(255);
        `);
        console.log("✅ chat_rooms table updated with password column.");

        console.log("🚀 Security Update successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
