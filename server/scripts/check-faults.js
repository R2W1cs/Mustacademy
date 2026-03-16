import pool from '../src/config/db.js';

const checkFaults = async () => {
    try {
        console.log("Checking for null/empty course names...");
        const nullNames = await pool.query("SELECT id FROM courses WHERE name IS NULL OR name = ''");
        console.log(`Found ${nullNames.rows.length} courses with null/empty names.`);
        if (nullNames.rows.length > 0) {
            console.table(nullNames.rows);
        }

        console.log("\nChecking RaniaB's (ID: 5) completed courses...");
        const raniaCourses = await pool.query(`
            SELECT uc.id, uc.status, c.name 
            FROM user_courses uc 
            LEFT JOIN courses c ON uc.course_id = c.id 
            WHERE uc.user_id = 5
        `);
        console.table(raniaCourses.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkFaults();
