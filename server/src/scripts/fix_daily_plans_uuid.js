import pool from "../config/db.js";

const fixSchema = async () => {
    try {
        console.log("🛠️ Dropping and recreating 'daily_plans' with TEXT user_id...");
        await pool.query("DROP TABLE IF EXISTS daily_plans;");
        await pool.query(`
            CREATE TABLE daily_plans (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id TEXT NOT NULL,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                technique VARCHAR(50) NOT NULL,
                schedule JSONB NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, date)
            );
        `);
        console.log("✅ Table 'daily_plans' recreated successfully with TEXT user_id.");
    } catch (err) {
        console.error("❌ Error during schema fix:", err.message);
    } finally {
        await pool.end();
    }
};

fixSchema();
