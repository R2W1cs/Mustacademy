import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

async function debug() {
    try {
        console.log("Debugging Courses...");
        const res = await pool.query(`
            SELECT id, name, description, semester_id 
            FROM courses 
            WHERE name ILIKE '%Ethics%' OR name ILIKE '%PHIL%' OR description ILIKE '%Ethics%'
        `);

        let output = `Found ${res.rows.length} courses:\n`;
        for (const c of res.rows) {
            output += `[ID: ${c.id}] ${c.name} (SemID: ${c.semester_id})\n`;

            // Check topics for this course
            const topics = await pool.query("SELECT id, title FROM topics WHERE course_id = $1 ORDER BY id", [c.id]);
            output += `   -> Topics: ${topics.rows.length}\n`;
            topics.rows.forEach(t => output += `      - [${t.id}] ${t.title}\n`);
            output += "\n";
        }

        const outputPath = path.join(__dirname, "../../debug_output_clean.txt");
        fs.writeFileSync(outputPath, output);
        console.log(`Debug output written to ${outputPath}`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debug();
