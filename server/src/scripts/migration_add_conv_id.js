import pool from "../config/db.js";

const addConversationIdToChatMessages = async () => {
    try {
        console.log("Adding conversation_id to chat_messages...");

        await pool.query(`
            ALTER TABLE chat_messages 
            ADD COLUMN IF NOT EXISTS conversation_id UUID;
        `);

        // Update existing interview messages if they have a conversation context (optional, but good for consistency)
        // For now, mentor chats will start getting these IDs.

        console.log("Migration successful: conversation_id column added.");
        process.exit(0);
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
};

addConversationIdToChatMessages();
