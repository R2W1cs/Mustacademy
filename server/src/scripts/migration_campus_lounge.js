import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Campus Lounge Migration...");

        // 1. Create Chat Rooms Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) DEFAULT 'public', -- public, private
                admin_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ chat_rooms table created.");

        // 2. Create Chat Messages Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id),
                text TEXT,
                attachment_url TEXT,
                attachment_type VARCHAR(50), -- image, pdf, etc.
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ chat_messages table created.");

        // 3. Create Chat Members Table (for tracking presence/voice in rooms)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_members (
                room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_voice_active BOOLEAN DEFAULT FALSE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (room_id, user_id)
            );
        `);
        console.log("✅ chat_members table created.");

        // 4. Create Default Public Rooms
        await pool.query(`
            INSERT INTO chat_rooms (name, type) 
            SELECT 'General Lounge', 'public'
            WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'General Lounge');
        `);
        await pool.query(`
            INSERT INTO chat_rooms (name, type) 
            SELECT 'Deep Focus / Quiet', 'public'
            WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'Deep Focus / Quiet');
        `);
        await pool.query(`
            INSERT INTO chat_rooms (name, type) 
            SELECT 'Algorithm Night', 'public'
            WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'Algorithm Night');
        `);
        console.log("✅ Default rooms initialized.");

        console.log("🚀 Campus Lounge Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
