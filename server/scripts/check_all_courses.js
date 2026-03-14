
import pool from '../src/config/db.js';
import fs from 'fs';

const run = async () => {
    try {
        const res = await pool.query(`
            SELECT c.id, c.name, s.year_number, s.semester_number, s.id as semester_id
            FROM courses c
            JOIN semesters s ON c.semester_id = s.id
            ORDER BY s.year_number, s.semester_number, c.name
        `);
        fs.writeFileSync('all_courses.json', JSON.stringify(res.rows, null, 2));
        console.log("Written to all_courses.json");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
