import pool from './src/config/db.js';

const run = async () => {
    try {
        const res = await pool.query(
            "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'topics_importance_level_check'"
        );
        console.log(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
