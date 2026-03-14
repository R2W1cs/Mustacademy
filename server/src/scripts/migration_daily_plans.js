import pool from "../config/db.js";

const createDailyPlansTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_plans (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                technique VARCHAR(50) NOT NULL, -- 'pomodoro', 'deep_work', 'flow'
                schedule JSONB NOT NULL, -- Array of { time, activity, duration, type }
                status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'abandoned'
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, date) -- One plan per day per user
            );
        `);
        console.log("✅ 'daily_plans' table created successfully.");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    } finally {
        pool.end();
    }
};

createDailyPlansTable();
