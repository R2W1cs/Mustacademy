import pool from '../src/config/db.js';

const checkCourses = async () => {
    try {
        const semesters = await pool.query("SELECT * FROM semesters ORDER BY year_number, semester_number");
        console.log("--- SEMESTERS ---");
        semesters.rows.forEach(s => console.log(`ID: ${s.id}, Y: ${s.year_number}, S: ${s.semester_number}`));
        
        const courses = await pool.query(`
            SELECT c.id, c.name, s.year_number, s.semester_number 
            FROM courses c 
            JOIN semesters s ON c.semester_id = s.id
        `);
        console.log("--- COURSES COHORT DISTRIBUTION ---");
        const dist = {};
        courses.rows.forEach(c => {
            const key = `Y${c.year_number}S${c.semester_number}`;
            dist[key] = (dist[key] || 0) + 1;
        });
        console.table(dist);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCourses();
