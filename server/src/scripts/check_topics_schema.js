
import pool from "../config/db.js";

const checkTopicsSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'topics';
        `);
        console.log("Topics Table Schema:");
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTopicsSchema();
