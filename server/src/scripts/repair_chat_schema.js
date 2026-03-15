import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
import pool from '../config/db.js';

const repair = async () => {
    try {
        console.log("🛠️ Starting Chat Schema Repair...");

        // Add user_id if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
        `);
        console.log("✅ Checked/Added user_id");

        // Add role if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS role VARCHAR(50);
        `);
        console.log("✅ Checked/Added role");

        // Add chat_type if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS chat_type VARCHAR(50);
        `);
        console.log("✅ Checked/Added chat_type");

        // Add attachment_url if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS attachment_url TEXT;
        `);
        console.log("✅ Checked/Added attachment_url");

        // Add attachment_type if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(50);
        `);
        console.log("✅ Checked/Added attachment_type");

        // Add message if missing
        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS message TEXT;
        `);
        console.log("✅ Checked/Added message");

        console.log("🚀 Repair successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Repair failed:", err);
        process.exit(1);
    }
};

repair();
