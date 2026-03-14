import pool from '../config/db.js';

async function audit() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'topics'
        `);
        console.log("--- TOPICS SCHEMA ---");
        res.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type})`);
        });

        const updateCols = [
            'breadcrumb_path', 'difficulty', 'estimated_time', 'learning_objectives',
            'historical_context', 'first_principles', 'structural_breakdown', 'deep_dive',
            'applied_practice', 'failure_analysis', 'production_standard', 'scholarly_references',
            'content_markdown', 'staff_engineer_note'
        ];

        const existingCols = res.rows.map(r => r.column_name);
        console.log("ACTUAL_COLUMNS_IN_DB:", existingCols.join(", "));

        const missing = updateCols.filter(col => !existingCols.includes(col));

        if (missing.length === 0) {
            console.log("RESULT: ALL_COLUMNS_PRESENT_IN_UPDATE_LIST");
        } else {
            console.log("RESULT: MISSING_COLUMNS_FROM_UPDATE_LIST:", missing.join(", "));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
