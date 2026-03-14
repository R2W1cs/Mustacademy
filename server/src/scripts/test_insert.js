import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from '../config/db.js';

async function testInsert() {
    try {
        await pool.query(
            `INSERT INTO topics (course_id, title, description, roadmap_position, importance_level, estimated_time, learning_objectives, breadcrumb_path) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [2, "Test Topic", "Desc", 10, "Essential", "120 Mins", JSON.stringify(['A']), "Test Path"]
        );
        console.log("Insert success!");
    } catch (err) {
        console.error("Exact DB error:", err);
    } finally {
        process.exit();
    }
}
testInsert();
