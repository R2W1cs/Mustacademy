import pool from '../src/config/db.js';

const checkUsers = async () => {
    try {
        const countRes = await pool.query("SELECT COUNT(*) FROM users");
        console.log(`TOTAL USERS: ${countRes.rows[0].count}`);
        
        const rania = await pool.query("SELECT id, name, email FROM users WHERE name ILIKE '%Rania%' OR email ILIKE '%Rania%'");
        if (rania.rows.length > 0) {
            console.log("--- FOUND USERS ---");
            rania.rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`));
        } else {
            console.log("Rania not found in database.");
        }
        
        const lastUsers = await pool.query("SELECT id, name, email FROM users ORDER BY id DESC LIMIT 5");
        console.log("--- LAST 5 REGISTERED ---");
        lastUsers.rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
