import pool from './src/config/db.js';

const run = async () => {
    try {
        console.log("🔍 Checking Topic Transfer for Course 184...");
        const res = await pool.query(
            "SELECT id, title, course_id, importance_level FROM topics WHERE course_id = 184"
        );
        console.log(`Found ${res.rowCount} topics:`, res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
