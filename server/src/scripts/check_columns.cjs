const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require' });

async function checkColumns() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses' ORDER BY column_name");
        console.log("SCHEMA_START");
        res.rows.forEach(r => console.log(r.column_name));
        console.log("SCHEMA_END");
    } finally {
        client.release();
        process.exit();
    }
}

checkColumns();
