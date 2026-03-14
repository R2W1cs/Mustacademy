import pool from './src/config/db.js';

async function updateName() {
    try {
        const result = await pool.query("UPDATE users SET name = 'Rayen Oueslati' WHERE email = 'rayen@test.com' OR id = 1 RETURNING *");
        console.log('Update Result:', result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Update Failed:', err);
        process.exit(1);
    }
}

updateName();
