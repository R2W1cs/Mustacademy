import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../server/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function findCourse() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, name FROM courses WHERE name = 'Advanced Data Warehousing & BI'");
        console.log("Course info:", JSON.stringify(res.rows, null, 2));
        if (res.rows.length > 0) {
            const courseId = res.rows[0].id;
            const topics = await client.query("SELECT id, title FROM topics WHERE course_id = $1 ORDER BY id", [courseId]);
            console.log("Topics for course " + courseId + ":", JSON.stringify(topics.rows, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        pool.end();
    }
}

findCourse();
