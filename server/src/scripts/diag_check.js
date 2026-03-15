import pool from "../config/db.js";

async function checkData() {
    try {
        const courses = await pool.query("SELECT COUNT(*) FROM courses");
        const topics = await pool.query("SELECT COUNT(*) FROM topics");
        const cyberCourses = await pool.query("SELECT id, name FROM courses WHERE name ILIKE '%Linux%' OR name ILIKE '%Network%' OR name ILIKE '%Ethical%' OR name ILIKE '%Security%';");

        console.log("Course Count:", courses.rows[0].count);
        console.log("Topic Count:", topics.rows[0].count);
        console.log("Cyber-related Courses:", cyberCourses.rows);

        if (cyberCourses.rows.length > 0) {
            const topicCheck = await pool.query("SELECT course_id, COUNT(*) FROM topics GROUP BY course_id");
            console.log("Topic counts per course:", topicCheck.rows);
        }
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await pool.end();
    }
}

checkData();
