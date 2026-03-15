import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

async function runMigration() {
    try {
        console.log("Running Migration: Add ethical_dilemma to topics...");

        // Check if column exists
        const checkRes = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='topics' AND column_name='ethical_dilemma'
        `);

        if (checkRes.rows.length === 0) {
            await pool.query(`
                ALTER TABLE topics 
                ADD COLUMN ethical_dilemma JSONB DEFAULT NULL;
            `);
            console.log("Column 'ethical_dilemma' added successfully.");
        } else {
            console.log("Column 'ethical_dilemma' already exists.");
        }

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
