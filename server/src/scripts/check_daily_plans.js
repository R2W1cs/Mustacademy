import pool from "../config/db.js";

const checkAndCreateTable = async () => {
    try {
        // Check if table exists
        const checkResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'daily_plans'
            );
        `);

        if (checkResult.rows[0].exists) {
            console.log("✅ 'daily_plans' table already exists.");
        } else {
            console.log("📋 Creating 'daily_plans' table...");
            await pool.query(`
                CREATE TABLE daily_plans (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID NOT NULL,
                    date DATE NOT NULL DEFAULT CURRENT_DATE,
                    technique VARCHAR(50) NOT NULL,
                    schedule JSONB NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id, date)
                );
            `);
            console.log("✅ 'daily_plans' table created successfully.");
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
};

checkAndCreateTable();
