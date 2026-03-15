import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Forum Hub Migration...");

        // 1. Create forum_threads
        await pool.query(`
            CREATE TABLE IF NOT EXISTS forum_threads (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
                type TEXT DEFAULT 'discussion', -- 'discussion' | 'summary'
                status TEXT DEFAULT 'active', -- 'active' | 'archived' | 'flagged'
                last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ forum_threads table created.");

        // 2. Create forum_comments
        await pool.query(`
            CREATE TABLE IF NOT EXISTS forum_comments (
                id SERIAL PRIMARY KEY,
                thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                parent_comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ forum_comments table created.");

        // 3. Create forum_upvotes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS forum_upvotes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                thread_id INTEGER REFERENCES forum_threads(id) ON DELETE CASCADE,
                comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT one_upvote_per_user_item UNIQUE(user_id, thread_id, comment_id),
                CONSTRAINT upvote_target_check CHECK (
                    (thread_id IS NOT NULL AND comment_id IS NULL) OR
                    (thread_id IS NULL AND comment_id IS NOT NULL)
                )
            )
        `);
        console.log("✅ forum_upvotes table created.");

        // 4. Indexing for High-Performance Search (Full Text Search)
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_forum_threads_search ON forum_threads USING gin(to_tsvector('english', title || ' ' || content));
            CREATE INDEX IF NOT EXISTS idx_forum_threads_topic ON forum_threads(topic_id);
            CREATE INDEX IF NOT EXISTS idx_forum_threads_user ON forum_threads(user_id);
            CREATE INDEX IF NOT EXISTS idx_forum_comments_thread ON forum_comments(thread_id);
        `);
        console.log("✅ High-performance indices registered.");

        console.log("🚀 Forum Hub migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
