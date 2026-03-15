import pool from "../config/db.js";

const checkSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND (column_name = 'id');
        `);
        console.log("Users.id type:", res.rows[0]);

        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'daily_plans';
        `);
        console.log("daily_plans schema:", res2.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSchema();
