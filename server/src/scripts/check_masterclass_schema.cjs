const pkg = require('pg');
const { Pool } = pkg;

const databaseUrl = "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require";

const pool = new Pool({ 
    connectionString: databaseUrl, 
    ssl: { rejectUnauthorized: false } 
});

async function checkMasterclassSchema() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'masterclass_episodes'");
        if (res.rows.length > 0) {
            console.log("Table 'masterclass_episodes' exists.");
            const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'masterclass_episodes'");
            console.log(JSON.stringify(columns.rows, null, 2));
        } else {
            console.log("Table 'masterclass_episodes' does NOT exist.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMasterclassSchema();
