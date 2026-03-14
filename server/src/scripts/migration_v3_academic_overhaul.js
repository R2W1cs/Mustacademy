
import pool from "../config/db.js";

const runMigration = async () => {
    try {
        const dbInfo = await pool.query("SELECT current_database(), current_schema()");
        console.log(`Connected to DB: ${dbInfo.rows[0].current_database}, Schema: ${dbInfo.rows[0].current_schema}`);
        console.log("Starting Academic Overhaul Migration (v3) - Granular Mode...");

        const columns = [
            { name: "breadcrumb_path", type: "TEXT" },
            { name: "difficulty", type: "VARCHAR(20)", default: "'Intermediate'" },
            { name: "estimated_time", type: "VARCHAR(50)", default: "'1h 30m'" },
            { name: "prerequisites", type: "JSONB", default: "'[]'::jsonb" },
            { name: "learning_objectives", type: "JSONB", default: "'[]'::jsonb" },
            { name: "historical_context", type: "TEXT" },
            { name: "structural_breakdown", type: "TEXT" },
            { name: "deep_dive", type: "JSONB", default: "'{}'::jsonb" },
            { name: "applied_practice", type: "JSONB", default: "'[]'::jsonb" },
            { name: "failure_analysis", type: "TEXT" },
            { name: "production_standard", type: "JSONB", default: "'{}'::jsonb" },
            { name: "scholarly_references", type: "JSONB", default: "'[]'::jsonb" },
            { name: "updated_at", type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
        ];

        for (const col of columns) {
            try {
                let query = `ALTER TABLE topics ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
                if (col.default) {
                    query += ` DEFAULT ${col.default}`;
                }
                await pool.query(query);
                console.log(`- Column '${col.name}' checked/added.`);
            } catch (colErr) {
                console.error(`- Error with column '${col.name}':`, colErr.message);
            }
        }

        console.log("Updating existing topics with default breadcrumb path...");
        await pool.query(`
            UPDATE topics 
            SET breadcrumb_path = 'General > Computer Science > ' || title
            WHERE breadcrumb_path IS NULL;
        `);

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error("Migration fatal error:", err);
        process.exit(1);
    }
};

runMigration();
