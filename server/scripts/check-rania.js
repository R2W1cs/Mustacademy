import pool from '../src/config/db.js';

const checkRania = async () => {
    try {
        const res = await pool.query("SELECT * FROM users WHERE id = 5");
        console.log(JSON.stringify(res.rows[0], null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkRania();
