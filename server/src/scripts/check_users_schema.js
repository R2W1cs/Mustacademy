import pool from '../config/db.js';

async function checkSchema() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Users table columns:', res.rows);
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        client.release();
    }
}

checkSchema();
