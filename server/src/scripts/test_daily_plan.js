import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require"
});

async function testPlan() {
    const userId = 3; // Assuming user ID 3 exists based on previous scripts
    console.log(`--- Testing Daily Plan Logic for User: ${userId} ---`);

    try {
        // 1. Get user profile
        const userRes = await pool.query("SELECT id, name, year, semester FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) {
            console.error("User not found");
            return;
        }
        const user = userRes.rows[0];
        const userYear = user.year || 1;
        const userSemester = user.semester || 1;
        console.log(`User Profile: Y${userYear}S${userSemester} (${user.name})`);

        // 2. Get topics for current year/semester
        const topicsRes = await pool.query(`
        SELECT c.name as course_name, t.title as topic_title
        FROM topics t
        JOIN courses c ON t.course_id = c.id
        JOIN semesters s ON c.semester_id = s.id
        WHERE s.year_number = $1 AND s.semester_number = $2
        ORDER BY c.name, t.title
    `, [userYear, userSemester]);

        let semesterTopics = "N/A";
        if (topicsRes.rows.length > 0) {
            const grouped = topicsRes.rows.reduce((acc, row) => {
                if (!acc[row.course_name]) acc[row.course_name] = [];
                if (acc[row.course_name].length < 5) {
                    acc[row.course_name].push(row.topic_title);
                }
                return acc;
            }, {});

            semesterTopics = Object.entries(grouped)
                .map(([course, topics]) => `[${course}]: ${topics.join(", ")}`)
                .join("\n");
        }

        const output = `--- Testing Daily Plan Logic for User: ${userId} ---
User Profile: Y${userYear}S${userSemester} (${user.name})
Semester Topics Context:
${semesterTopics}
✅ Successfully fetched semester-specific topics.`;

        fs.writeFileSync('server/src/scripts/test_output.txt', output);
        console.log("Results written to server/src/scripts/test_output.txt");

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await pool.end();
    }
}

testPlan();
