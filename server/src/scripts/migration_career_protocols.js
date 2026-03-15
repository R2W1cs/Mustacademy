import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Career Protocol Migration...");

        // 1. Update Users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS resume_url TEXT
        `);

        // 2. Update User Stats table
        await pool.query(`
            ALTER TABLE user_stats
            ADD COLUMN IF NOT EXISTS current_asc INTEGER DEFAULT 0
        `);
        console.log("✅ Users and Stats tables updated with Career columns.");

        // 2. Create Cheatsheets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cheatsheets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                category VARCHAR(100),
                upvotes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log(" Cheatsheets repository initialized.");

        console.log(" Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error(" Migration failed:", err);
        process.exit(1);
    }
};

migrate();
