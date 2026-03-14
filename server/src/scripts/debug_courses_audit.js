import pool from "../config/db.js";

const audit = async () => {
    try {
        console.log("--- Course Audit ---");
        const courses = await pool.query("SELECT id, name FROM courses");
        console.log("Course IDs found:", courses.rows.map(r => r.id));

        console.log("\n--- Semester Audit ---");
        const semesters = await pool.query("SELECT id, year_number, semester_number FROM semesters");
        console.table(semesters.rows);

        console.log("\n--- User Audit ---");
        const users = await pool.query("SELECT id, name, year, semester FROM users LIMIT 5");
        console.table(users.rows);

        console.log("\n--- Enrollment Audit ---");
        try {
            const enrollments = await pool.query("SELECT * FROM enrollments LIMIT 10");
            console.table(enrollments.rows);
        } catch (e) {
            console.log("Enrollments table likely named differently or missing. Searching...");
            const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            console.log("Available tables:", tables.rows.map(r => r.table_name));
        }

        process.exit(0);
    } catch (err) {
        console.error("Audit failed", err);
        process.exit(1);
    }
};

audit();
