const pkg = require('pg');
const { Pool } = pkg;

const databaseUrl = "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require";

const pool = new Pool({ 
    connectionString: databaseUrl, 
    ssl: { rejectUnauthorized: false } 
});

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'topics'");
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
