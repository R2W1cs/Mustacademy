import pool from "../config/db.js";

const migrate = async () => {
    try {
        console.log("Creating daily_goals table...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        description TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        deadline TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Table created.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

migrate();
