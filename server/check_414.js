
import pool from "./src/config/db.js";

async function checkIds() {
    try {
        const courseRes = await pool.query("SELECT id, name FROM courses WHERE id = 414");
        console.log("Course 414:", courseRes.rows);

        const topicRes = await pool.query("SELECT id, title, course_id FROM topics WHERE id = 414");
        console.log("Topic 414:", topicRes.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIds();
