import pool from "../config/db.js";

const addDifficultyColumn = async () => {
    try {
        console.log("Adding difficulty column to daily_goals...");

        await pool.query(`
            ALTER TABLE daily_goals 
            ADD COLUMN IF NOT EXISTS difficulty VARCHAR(10) DEFAULT 'medium';
        `);

        console.log("Difficulty column added successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error adding column:", err);
        process.exit(1);
    }
};

addDifficultyColumn();
