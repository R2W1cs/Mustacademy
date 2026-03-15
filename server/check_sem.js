import pool from './src/config/db.js';

const check = async () => {
    try {
        const res = await pool.query("SELECT * FROM semesters WHERE year_number = 2 AND semester_number = 2");
        console.log("Semesters found:", res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
