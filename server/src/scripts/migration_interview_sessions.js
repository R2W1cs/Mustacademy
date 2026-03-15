import pool from "../config/db.js";

const migrate = async () => {
    try {
        console.log("Running migration: Create interview_sessions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id UUID PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                target_job TEXT NOT NULL,
                current_phase TEXT DEFAULT 'INTRO',
                metadata JSONB DEFAULT '{}',
                is_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
