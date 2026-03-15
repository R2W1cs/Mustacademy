import 'dotenv/config';
import pool from '../config/db.js';

async function migrate() {
    try {
        console.log("Checking for 'song_lyrics' column...");
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'topics' AND column_name = 'song_lyrics'
        `);

        if (checkResult.rows.length === 0) {
            console.log("Adding 'song_lyrics' column to topics table...");
            await pool.query("ALTER TABLE topics ADD COLUMN song_lyrics JSONB");
            console.log("✅ Column 'song_lyrics' added successfully.");
        } else {
            console.log("ℹ️ Column 'song_lyrics' already exists.");
        }

    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        process.exit(0);
    }
}

migrate();
