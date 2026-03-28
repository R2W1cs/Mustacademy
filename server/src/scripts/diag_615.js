import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function diag() {
    try {
        console.log("--- SCHEMA: COURSES ---");
        const schemaRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'");
        console.log(schemaRes.rows.map(r => r.column_name).join(', '));

        console.log("\n--- COURSE 615 CHECK ---");
        const c615 = await pool.query("SELECT * FROM courses WHERE id = 615");
        console.log("Course 615 rows:", c615.rows.length);

        console.log("\n--- RECENT COURSES ---");
        const recent = await pool.query("SELECT id, name FROM courses LIMIT 5");
        console.log(recent.rows);

        console.log("\n--- USER PROGRESS FOR 615 CHECK ---");
        try {
            const progress = await pool.query("SELECT * FROM user_progress WHERE course_id = 615");
            console.log("Progress entries for 615:", progress.rows);
        } catch (e) {
            console.log("user_progress table may not exist:", e.message);
        }

        console.log('\n--- Checking Masterclass Episodes ---');
    const mcEpisodes = await pool.query("SELECT id, title, part_number FROM masterclass_episodes");
    console.log('Masterclass Episodes:', mcEpisodes.rows);

        console.log("\n--- ENROLLMENTS FOR 615 CHECK ---");
        // Check if there is an enrollments table or similar
        try {
            const enroll = await pool.query("SELECT * FROM enrollments WHERE course_id = 615");
            console.log("Enrollment entries for 615:", enroll.rows);
        } catch (e) {
            console.log("Enrollments table may not exist or column different:", e.message);
        }

        console.log("\n--- TOPIC FOR 615 RE-CHECK (as ID) ---");
        const topicAs615 = await pool.query("SELECT id, title, course_id FROM topics WHERE id = 615");
        console.log("Topic with ID 615:", topicAs615.rows);

    } catch (e) {
        console.error("DIAG FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

diag();
