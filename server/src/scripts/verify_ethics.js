import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

async function verify() {
    try {
        console.log("Verifying PHIL 222 Topics...");
        const res = await pool.query(`
            SELECT t.title, c.code 
            FROM topics t 
            JOIN courses c ON t.course_id = c.id 
            WHERE c.code LIKE '%PHIL 222%' OR c.title LIKE '%Data Ethics%'
        `);

        console.log(`Found ${res.rows.length} topics.`);
        res.rows.forEach(r => console.log(`- ${r.title}`));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verify();
