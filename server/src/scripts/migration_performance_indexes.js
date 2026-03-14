import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("🚀 Starting Performance Index Migration...");

        // Create index on room_id and created_at for fast message retrieval
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
            ON chat_messages (room_id, created_at DESC);
        `);
        console.log("✅ Index created on chat_messages(room_id, created_at)");

        // Index on chat_members for presence checks
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_chat_members_room 
            ON chat_members (room_id);
        `);
        console.log("✅ Index created on chat_members(room_id)");

        console.log("🎯 Performance migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
