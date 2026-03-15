import pool from '../config/db.js';

const repair = async () => {
    try {
        console.log("🛠️ Starting Master Users Schema Repair...");

        const columns = [
            { name: 'last_active_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },

            { name: 'streak_current', type: 'INTEGER DEFAULT 0' },
            { name: 'streak_last_active_date', type: 'TIMESTAMP' }
        ];

        for (const col of columns) {
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};
            `);
            console.log(`✅ Checked/Added ${col.name}`);
        }



        console.log("🚀 Master Repair successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Master Repair failed:", err);
        process.exit(1);
    }
};

repair();
