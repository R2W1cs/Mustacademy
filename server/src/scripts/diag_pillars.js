import pool from '../config/db.js';

const check = async () => {
    try {
        console.log("Checking career_roadmaps for technical_pillars structure...");
        const res = await pool.query("SELECT id, architecture_json FROM career_roadmaps");
        res.rows.forEach(r => {
            const pillars = r.architecture_json?.technical_pillars;
            if (pillars && Array.isArray(pillars)) {
                pillars.forEach((p, i) => {
                    if (typeof p === 'object' && p !== null) {
                        console.log(`!!! Found object pillar (Roadmap ID: ${r.id}, Index: ${i}):`, JSON.stringify(p));
                    }
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
