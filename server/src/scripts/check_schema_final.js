import pool from '../config/db.js';
import fs from 'fs';

async function check() {
    try {
        const res = await pool.query("SELECT * FROM topics LIMIT 1");
        const names = res.fields.map(f => f.name).sort();
        console.log("COLUMNS_FOUND:", names.join("|"));
        fs.writeFileSync('schema_dump.txt', names.join("\n"));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
