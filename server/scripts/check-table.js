import pool from '../src/config/db.js';

const checkTable = async () => {
    try {
        const res = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'user_courses'
            );
        `);
        console.log(`Table 'user_courses' exists: ${res.rows[0].exists}`);
        
        if (res.rows[0].exists) {
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'user_courses'
            `);
            console.log("--- COLUMNS ---");
            console.table(columns.rows);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTable();
