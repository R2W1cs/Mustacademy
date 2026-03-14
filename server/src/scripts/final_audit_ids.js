import pool from "../config/db.js";
import fs from "fs";

const audit = async () => {
    try {
        const res = await pool.query("SELECT id, name FROM courses ORDER BY id");
        let output = res.rows.map(r => `${r.id}: ${r.name}`).join('\n');
        fs.writeFileSync("final_course_ids.txt", output);
        console.log(`Audited ${res.rows.length} courses.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

audit();
