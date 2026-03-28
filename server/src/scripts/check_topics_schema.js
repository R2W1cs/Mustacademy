import pool from "../config/db.js";

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'topics'
    `);
    console.log("TOPICS COLUMNS:", res.rows.map(r => r.column_name).join(", "));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
