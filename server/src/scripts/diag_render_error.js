import pool from '../config/db.js';

const check = async () => {
    try {
        console.log("Checking for problematic object structures...");
        const res = await pool.query("SELECT id, name FROM courses LIMIT 20");
        console.log("Courses preview:");
        res.rows.forEach(r => {
            console.log(`- ID: ${r.id}, Name type: ${typeof r.name}, Value: ${JSON.stringify(r.name)}`);
        });

        const roadmapRes = await pool.query("SELECT architecture_json, roadmap_steps_json FROM career_roadmaps LIMIT 5");
        roadmapRes.rows.forEach((r, i) => {
            console.log(`\nRoadmap ${i}:`);
            console.log(`Architecture Title type: ${typeof r.architecture_json?.title}`);
            console.log(`Architecture Title value: ${JSON.stringify(r.architecture_json?.title)}`);
            if (r.roadmap_steps_json && Array.isArray(r.roadmap_steps_json)) {
                r.roadmap_steps_json.forEach((step, j) => {
                    console.log(`  Step ${j} Title type: ${typeof step.title}`);
                    console.log(`  Step ${j} Title value: ${JSON.stringify(step.title)}`);
                });
            }
        });

        process.exit(0);
    } catch (err) {
        console.error("DIAG FAILED:", err);
        process.exit(1);
    }
};

check();
