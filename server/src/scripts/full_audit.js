import pool from '../config/db.js';

const audit = async () => {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, column_name
        `);
        res.rows.forEach(row => {
            console.log(`${row.table_name}.${row.column_name}: ${row.data_type}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
