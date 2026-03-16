import pool from '../src/config/db.js';

const checkUsersTable = async () => {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY column_name
        `);
        console.log("--- USERS COLUMNS ---");
        columns.rows.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsersTable();
