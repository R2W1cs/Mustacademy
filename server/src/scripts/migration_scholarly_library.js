import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Scholarly Library Protocol Migration...");

        // 1. Create Scholarly Assets table (Unified Summaries & Cheatsheets)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS scholarly_assets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                asset_type VARCHAR(50) NOT NULL, -- 'summary' | 'cheatsheet'
                subject_area VARCHAR(100),
                status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'matured'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Scholarly Assets table initialized.");

        // 2. Create Asset Reviews table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS asset_reviews (
                id SERIAL PRIMARY KEY,
                asset_id INTEGER REFERENCES scholarly_assets(id) ON DELETE CASCADE,
                reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asset_id, reviewer_id)
            )
        `);
        console.log("✅ Asset Reviews table initialized.");

        // 3. Migrate existing cheatsheets to the new unified table
        const cheatsheets = await pool.query("SELECT * FROM cheatsheets");
        for (const cs of cheatsheets.rows) {
            await pool.query(
                "INSERT INTO scholarly_assets (user_id, title, file_url, asset_type, subject_area, created_at) VALUES ($1, $2, $3, 'cheatsheet', $4, $5)",
                [cs.user_id, cs.title, cs.file_url, cs.category, cs.created_at]
            );
        }
        console.log(`✅ Migrated ${cheatsheets.rows.length} cheatsheets to the new protocol.`);

        // 4. Migrate existing user summaries (resume_url)
        const summaries = await pool.query("SELECT id, resume_url FROM users WHERE resume_url IS NOT NULL");
        for (const user of summaries.rows) {
            await pool.query(
                "INSERT INTO scholarly_assets (user_id, title, file_url, asset_type) VALUES ($1, 'Institutional Summary', $2, 'summary')",
                [user.id, user.resume_url]
            );
        }
        console.log(`✅ Migrated ${summaries.rows.length} user summaries to the library.`);

        console.log("🚀 Scholarly Library Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
