import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
console.log(`[DEBUG] Attempting to load .env from: ${envPath}`);
dotenv.config({ path: envPath });

import pool from "../config/db.js";

const setupChat = async () => {
    try {
        console.log("🛠️ Re-initializing Synaptic Peer Chat Infrastructure...");

        // Test connection
        const testRes = await pool.query('SELECT NOW()');
        console.log(`✅ DB Connection verified at: ${testRes.rows[0].now}`);

        // 1. Chat Rooms (Channels)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) DEFAULT 'public',
                password VARCHAR(255),
                admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ chat_rooms table established.");

        // 2. Chat Members (Presence)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_members (
                room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_voice_active BOOLEAN DEFAULT FALSE,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (room_id, user_id)
            )
        `);
        console.log("✅ chat_members table established.");

        // 3. Synaptic Messages (Peer Chat)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS synaptic_messages (
                id SERIAL PRIMARY KEY,
                room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                attachment_url TEXT,
                attachment_type VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ synaptic_messages table established.");

        console.log("🚀 Synaptic Chat Migration Successful.");
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        if (pool) await pool.end();
        process.exit(1);
    }
};

setupChat();
