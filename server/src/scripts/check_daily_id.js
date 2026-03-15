import pool from '../config/db.js';
async function check() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'daily_plans' AND column_name = 'user_id'");
    console.log(res.rows[0]);
    process.exit(0);
}
check();
