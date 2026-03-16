import pool from '../src/config/db.js';

const checkUsers = async () => {
    try {
        const users = await pool.query("SELECT id, name, email FROM users ORDER BY id DESC LIMIT 20");
        console.log("--- LATEST USERS ---");
        console.table(users.rows);
        
        const count = await pool.query("SELECT COUNT(*) FROM users");
        console.log(`TOTAL USERS: ${count.rows[0].count}`);
        
        const rania = await pool.query("SELECT * FROM users WHERE name ILIKE '%Rania%' OR email ILIKE '%Rania%'");
        console.log("--- SEARCH RESULTS FOR RANIA ---");
        console.table(rania.rows);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
