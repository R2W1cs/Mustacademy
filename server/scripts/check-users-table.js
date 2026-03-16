import pool from '../src/config/db.js';

const checkUsersTable = async () => {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log("--- USERS COLUMNS ---");
        console.table(columns.rows);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsersTable();
