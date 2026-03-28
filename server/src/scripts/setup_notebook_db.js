import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function setup() {
    try {
        console.log("Creating user_topic_notes table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_topic_notes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                topic_id INTEGER REFERENCES topics(id),
                content TEXT,
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, topic_id)
            )
        `);
        console.log("TABLE user_topic_notes READY ✅");
    } catch (e) {
        console.error("DB SETUP FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

setup();
