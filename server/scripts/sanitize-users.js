import pool from '../src/config/db.js';

const sanitizeUsers = async () => {
    try {
        console.log("Sanitizing user academic data...");
        const result = await pool.query(`
            UPDATE users 
            SET year = COALESCE(year, 1), 
                semester = COALESCE(semester, 1)
            WHERE year IS NULL OR semester IS NULL
            RETURNING id, name, year, semester
        `);
        console.log(`Updated ${result.rows.length} users.`);
        result.rows.forEach(u => console.log(`- [${u.id}] ${u.name}: Y${u.year}S${u.semester}`));

        console.log("SUCCESS: User data sanitized.");
        process.exit(0);
    } catch (err) {
        console.error("FAILURE: Error sanitizing user data.");
        console.error(err);
        process.exit(1);
    }
};

sanitizeUsers();
