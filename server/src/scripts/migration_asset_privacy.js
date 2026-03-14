import pool from '../config/db.js';

const migrate = async () => {
    try {
        console.log("Starting Asset Privacy Protocol Migration...");

        // 1. Add general visibility toggle to scholarly_assets
        await pool.query(`
            ALTER TABLE scholarly_assets 
            ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE
        `);
        console.log("✅ Scholarly Assets updated with is_hidden toggle.");

        // 2. Create Granular Hiding table (Hide from specific students)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS asset_hiding (
                id SERIAL PRIMARY KEY,
                asset_id INTEGER REFERENCES scholarly_assets(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(asset_id, user_id)
            )
        `);
        console.log("✅ Asset Hiding table initialized for granular privacy.");

        console.log("🚀 Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};

migrate();
