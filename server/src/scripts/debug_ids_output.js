import pool from "../config/db.js";
import fs from "fs";

const audit = async () => {
    try {
        let output = "";
        const log = (msg) => {
            console.log(msg);
            output += msg + "\n";
        };

        log("--- Course Audit ---");
        const courses = await pool.query("SELECT id, name FROM courses ORDER BY id");
        log(`Course IDs found: ${courses.rows.map(r => r.id).join(', ')}`);

        log("\n--- User Audit ---");
        const users = await pool.query("SELECT id, name, email, year, semester FROM users LIMIT 10");
        log(JSON.stringify(users.rows, null, 2));

        log("\n--- Enrollment Audit ---");
        const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tableNames = tablesRes.rows.map(r => r.table_name);
        log(`Available tables: ${tableNames.join(', ')}`);

        // Try to check user_course_enrollment if it exists
        if (tableNames.includes('user_course_enrollment')) {
            const enrollRes = await pool.query("SELECT * FROM user_course_enrollment");
            log("\n--- user_course_enrollment content ---");
            log(JSON.stringify(enrollRes.rows, null, 2));
        }

        fs.writeFileSync("debug_ids_output.txt", output);
        process.exit(0);
    } catch (err) {
        console.error("Audit failed", err);
        process.exit(1);
    }
};

audit();
