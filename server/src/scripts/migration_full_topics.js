import pool from '../config/db.js';

async function migrate() {
    console.log("🚀 Starting comprehensive migration for topics table...");
    try {
        await pool.query(`
            ALTER TABLE topics 
            ADD COLUMN IF NOT EXISTS breadcrumb_path TEXT,
            ADD COLUMN IF NOT EXISTS difficulty TEXT,
            ADD COLUMN IF NOT EXISTS estimated_time TEXT,
            ADD COLUMN IF NOT EXISTS learning_objectives JSONB,
            ADD COLUMN IF NOT EXISTS first_principles TEXT,
            ADD COLUMN IF NOT EXISTS structural_breakdown TEXT,
            ADD COLUMN IF NOT EXISTS deep_dive JSONB,
            ADD COLUMN IF NOT EXISTS applied_practice JSONB,
            ADD COLUMN IF NOT EXISTS failure_analysis TEXT,
            ADD COLUMN IF NOT EXISTS production_standard JSONB,
            ADD COLUMN IF NOT EXISTS scholarly_references JSONB;
        `);
        console.log("✅ SUCCESS: All high-fidelity columns added.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration FAILED:", err.message);
        process.exit(1);
    }
}

migrate();
