import pool from '../config/db.js';

const finalFix = async () => {
    try {
        console.log("🔥 Re-creating chat_messages table...");

        // Drop if exists to clean up mismatched schema
        await pool.query("DROP TABLE IF EXISTS chat_messages CASCADE;");

        // Create with correct schema for MUST ACADEMY Lounge
        await pool.query(`
            CREATE TABLE chat_messages (
                id SERIAL PRIMARY KEY,
                room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
                sender_id INTEGER REFERENCES users(id),
                text TEXT,
                attachment_url TEXT,
                attachment_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ chat_messages table created successfully.");

        process.exit(0);
    } catch (err) {
        console.error("❌ Final fix failed:", err);
        process.exit(1);
    }
};

finalFix();
