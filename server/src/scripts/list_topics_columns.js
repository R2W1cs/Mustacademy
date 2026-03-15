import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });
import pool from '../config/db.js';

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'topics'").then(res => {
    fs.writeFileSync("cols.json", JSON.stringify(res.rows.map(r => r.column_name), null, 2));
    process.exit(0);
});
