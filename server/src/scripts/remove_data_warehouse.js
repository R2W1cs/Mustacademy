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

async function removeDataWarehouse() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const courseName = "Advanced Data Warehousing & BI";

        // Find course ID
        const res = await client.query("SELECT id FROM courses WHERE name = $1", [courseName]);

        if (res.rows.length === 0) {
            console.log(`Course '${courseName}' not found.`);
        } else {
            for (const row of res.rows) {
                const courseId = row.id;
                console.log(`Deleting course: ${courseName} (ID: ${courseId})`);

                // Delete topics first due to foreign key constraints
                await client.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

                // Delete course
                await client.query("DELETE FROM courses WHERE id = $1", [courseId]);

                console.log(`Course ${courseId} and its topics removed.`);
            }
        }

        await client.query('COMMIT');
        console.log("Removal operation completed.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Removal operation failed:", e);
    } finally {
        client.release();
        pool.end();
    }
}

removeDataWarehouse();
