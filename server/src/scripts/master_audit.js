import pool from "../config/db.js";
import fs from "fs";

const audit = async () => {
    try {
        let output = "";
        const log = (msg) => {
            console.log(msg);
            output += msg + "\n";
        };

        log("--- Course Audit ---");
        const courses = await pool.query("SELECT id, name FROM courses");
        log(`Course IDs: ${courses.rows.map(r => r.id).join(', ')}`);

        log("\n--- Daily Plans Audit (Searching for 412) ---");
        const plans = await pool.query("SELECT id, user_id, date, content FROM daily_plans");
        plans.rows.forEach(plan => {
            const contentStr = JSON.stringify(plan.content);
            if (contentStr.includes('412')) {
                log(`Found 412 in daily_plan ID: ${plan.id} for user: ${plan.user_id}`);
                log(`Content snippet: ${contentStr.substring(0, 500)}`);
            }
        });

        log("\n--- user_courses Audit ---");
        const uc = await pool.query("SELECT * FROM user_courses");
        uc.rows.forEach(r => {
            if (r.course_id == 412) log(`Found 412 in user_courses ID: ${r.id} for user: ${r.user_id}`);
        });

        fs.writeFileSync("master_audit_output.txt", output);
        process.exit(0);
    } catch (err) {
        console.error("Audit failed", err);
        process.exit(1);
    }
};

audit();
