import pool from "../config/db.js";

const createChatMessagesTable = async () => {
    try {
        console.log("Creating chat_messages table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                chat_type VARCHAR(20) NOT NULL,
                role VARCHAR(10) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("chat_messages table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
};

createChatMessagesTable();
