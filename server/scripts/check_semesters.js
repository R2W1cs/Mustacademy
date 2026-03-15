
import pool from '../src/config/db.js';

const run = async () => {
    try {
        const res = await pool.query("SELECT * FROM semesters");
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
