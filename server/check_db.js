import pool from '../src/config/db.js';

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'interview_sessions'");
        console.log("Schema for interview_sessions:");
        res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        process.exit();
    }
}

checkSchema();
