import pool from "../config/db.js";

const getFullSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'topics'
            ORDER BY ordinal_position;
        `);
        res.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

getFullSchema();
