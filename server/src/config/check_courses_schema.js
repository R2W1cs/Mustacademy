import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/rayen/cs-roadmap-platform/server/.env' });
import pool from './db.js';

const checkSchema = async () => {
    try {
        const tables = ['courses', 'topics'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\nTable: ${table}`);
            res.rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type})`);
            });
        }
    } catch (err) {
        console.error("Schema check failed:", err);
    } finally {
        process.exit(0);
    }
};

checkSchema();
