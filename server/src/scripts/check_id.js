import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require"
});

async function check() {
    try {
        const res = await pool.query("SELECT * FROM user_courses WHERE course_id = 412");
        console.log("Enrollments with course_id 412:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
