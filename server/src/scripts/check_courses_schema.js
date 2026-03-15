import pool from '../config/db.js';

async function check() {
    try {
        const res = await pool.query("SELECT * FROM courses LIMIT 1");
        const names = res.fields.map(f => f.name).sort();
        console.log("COURSES_COLUMNS:", names.join("|"));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
