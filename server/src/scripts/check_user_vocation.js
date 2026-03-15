import pool from "../config/db.js";

async function check() {
    try {
        // Check users table columns
        const userCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
        console.log("User Columns:", userCols.rows.map(r => r.column_name));

        const users = await pool.query("SELECT id, dream_job FROM users LIMIT 5;");
        console.log("Users:", users.rows);

        // Check topics table columns
        const topicCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'topics';");
        console.log("Topic Columns:", topicCols.rows.map(r => r.column_name));

        const latestUser = await pool.query("SELECT id, name, dream_job FROM users ORDER BY id DESC LIMIT 1;");
        console.log("Latest User:", latestUser.rows[0]);

        if (latestUser.rows[0]) {
            const userId = latestUser.rows[0].id;
            const userCourses = await pool.query("SELECT * FROM user_courses WHERE user_id = $1;", [userId]);
            console.log("User's Courses:", userCourses.rows);
        }

    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await pool.end();
    }
}

check();
