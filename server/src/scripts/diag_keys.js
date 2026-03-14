import pool from '../config/db.js';

const check = async () => {
    try {
        console.log("Checking for problematic object structures in courses table...");
        const res = await pool.query("SELECT id, name FROM courses");
        res.rows.forEach(r => {
            if (typeof r.name === 'object' && r.name !== null) {
                console.log(`!!! Found object name in courses table (ID: ${r.id}):`, JSON.stringify(r.name));
            } else if (typeof r.name === 'string' && r.name.startsWith('{')) {
                try {
                    const parsed = JSON.parse(r.name);
                    console.log(`!!! Found JSON-string name in courses table (ID: ${r.id}):`, JSON.stringify(parsed));
                } catch (e) { }
            }
        });

        const roadmapRes = await pool.query("SELECT id, roadmap_steps_json FROM career_roadmaps");
        roadmapRes.rows.forEach(r => {
            if (r.roadmap_steps_json && Array.isArray(r.roadmap_steps_json)) {
                r.roadmap_steps_json.forEach((step, i) => {
                    Object.keys(step).forEach(key => {
                        if (typeof step[key] === 'object' && step[key] !== null && !Array.isArray(step[key])) {
                            console.log(`!!! Found object property in roadmap step (Roadmap ID: ${r.id}, Step: ${i}, Key: ${key}):`, JSON.stringify(step[key]));
                        }
                    });
                });
            }
        });

        console.log("Check complete.");
        process.exit(0);
    } catch (err) {
        console.error("DIAG FAILED:", err);
        process.exit(1);
    }
};

check();
