import pool from "./src/config/db.js";

async function checkTopics() {
    try {
        const dbInfo = await pool.query("SELECT current_database(), current_schema()");
        console.log(`Connected to DB: ${dbInfo.rows[0].current_database}, Schema: ${dbInfo.rows[0].current_schema}`);
        const res = await pool.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'scholarly_references'");
        console.log("Tables with scholarly_references:", res.rows.map(r => r.table_name));
    } catch (err) {
        console.error("Error checking topics:", err);
    } finally {
        process.exit();
    }
}

checkTopics();
