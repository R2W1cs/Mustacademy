import pool from "../config/db.js";

const createGoalSubmissionsTable = async () => {
    try {
        console.log("Creating goal_submissions table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS goal_submissions (
                id SERIAL PRIMARY KEY,
                goal_id INTEGER REFERENCES daily_goals(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                submission_text TEXT NOT NULL,
                ai_grade INTEGER CHECK (ai_grade >= 0 AND ai_grade <= 100),
                ai_feedback TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("goal_submissions table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
};

createGoalSubmissionsTable();
