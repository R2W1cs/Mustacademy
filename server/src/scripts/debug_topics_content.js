import pool from "../config/db.js";
import fs from "fs";

async function debug() {
    console.log("Starting DB investigation...");
    let output = "DB INVESTIGATION RESULTS\n========================\n\n";
    try {
        const res = await pool.query(`
            SELECT id, title, historical_context, applied_practice, first_principles 
            FROM topics 
            ORDER BY id ASC 
            LIMIT 20
        `);

        output += "TOPIC SAMPLES:\n";
        res.rows.forEach(row => {
            output += `\nID: ${row.id} | Title: ${row.title}\n`;
            output += `Context: ${row.historical_context?.substring(0, 100)}...\n`;
            output += `Principles: ${row.first_principles}\n`;
            output += `Practice: ${JSON.stringify(row.applied_practice)}\n`;
        });

        const checkUniform = await pool.query(`
            SELECT historical_context, COUNT(*) as count
            FROM topics 
            GROUP BY historical_context
            ORDER BY count DESC
        `);

        output += "\nDISTRIBUTION OF HISTORICAL CONTEXT:\n";
        checkUniform.rows.forEach(row => {
            output += `${row.count} topics have: ${row.historical_context?.substring(0, 100)}\n`;
        });

        fs.writeFileSync("db_debug_output.txt", output);
        console.log("Results written to db_debug_output.txt");

    } catch (err) {
        console.error("DB ERROR:", err);
    } finally {
        await pool.end();
        process.exit();
    }
}

debug();
