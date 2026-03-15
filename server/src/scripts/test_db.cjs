const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require' });

async function test() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM topics LIMIT 1");
        if (res.rows.length > 0) {
            const keys = Object.keys(res.rows[0]);
            console.log("SCHEMA START");
            console.log(keys.join(', '));
            console.log("SCHEMA END");
        } else {
            console.log("No rows in topics table.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        process.exit();
    }
}

test();
