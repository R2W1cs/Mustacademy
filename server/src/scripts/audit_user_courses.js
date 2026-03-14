import pool from "../config/db.js";
import fs from "fs";

const audit = async () => {
    try {
        let output = "";
        const log = (msg) => {
            console.log(msg);
            output += msg + "\n";
        };

        log("--- user_courses Audit ---");
        const res = await pool.query("SELECT * FROM user_courses");
        log(JSON.stringify(res.rows, null, 2));

        fs.writeFileSync("user_courses_audit.txt", output);
        process.exit(0);
    } catch (err) {
        console.error("Audit failed", err);
        process.exit(1);
    }
};

audit();
