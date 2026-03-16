import pool from '../src/config/db.js';
import { getCareerAlignment } from '../src/services/vocation.service.js';

const simulateProfile = async (userId) => {
    try {
        console.log(`Simulating getMyProfile for userId: ${userId}`);
        const result = await pool.query(
            "SELECT id, name, email, avatar_url, bio, passion, year, semester, status, dream_job, target_company, technical_pillar FROM users WHERE id = $1",
            [userId]
        );
        const profile = result.rows[0];
        if (!profile) {
            console.log("User not found");
            return;
        }
        console.log("Profile retrieved:", profile.name);

        const coursesRes = await pool.query(
            "SELECT c.name FROM user_courses uc JOIN courses c ON uc.course_id = c.id WHERE uc.user_id = $1 AND uc.status = 'completed'",
            [userId]
        );
        const completedCourses = coursesRes.rows;
        console.log("Completed courses:", completedCourses.length);

        const careerOracle = getCareerAlignment(profile.dream_job, completedCourses);
        console.log("Career Oracle generated:", careerOracle.title);

        console.log("SUCCESS: Simulation complete.");
        process.exit(0);
    } catch (err) {
        console.error("FAILURE: Simulation crashed.");
        console.error(err);
        process.exit(1);
    }
};

simulateProfile(5);
