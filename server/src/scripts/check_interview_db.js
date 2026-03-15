
import pool from "../config/db.js";

async function checkTable() {
    try {
        const res = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'interview_sessions'
            );
        `);
        console.log("Table exists:", res.rows[0].exists);
        if (res.rows[0].exists) {
            const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'interview_sessions'");
            console.log("Columns:", columns.rows);
        }
    } catch (err) {
        console.error("Check failed:", err.message);
    } finally {
        process.exit();
    }
}

checkTable();
