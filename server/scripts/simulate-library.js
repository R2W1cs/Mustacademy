import pool from '../src/config/db.js';

const simulateLibrary = async (userId) => {
    try {
        console.log(`Simulating getRecommendedCourses for userId: ${userId}`);
        const userRes = await pool.query("SELECT year, semester FROM users WHERE id = $1", [userId]);
        const { year, semester } = userRes.rows[0];
        console.log(`User cohort: Y${year}S${semester}`);

        const coursesRes = await pool.query(
            "SELECT c.id, c.name FROM courses c JOIN semesters s ON c.semester_id = s.id WHERE s.year_number = $1 AND s.semester_number = $2",
            [year, semester]
        );
        console.log(`Found ${coursesRes.rows.length} courses:`);
        coursesRes.rows.forEach(c => console.log(`- [${c.id}] ${c.name}`));

        console.log("SUCCESS: Simulation complete.");
        process.exit(0);
    } catch (err) {
        console.error("FAILURE: Simulation crashed.");
        console.error(err);
        process.exit(1);
    }
};

simulateLibrary(5);
