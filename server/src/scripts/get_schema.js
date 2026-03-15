import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

async function outputSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log("Columns in 'users' table:");
        res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

outputSchema();
