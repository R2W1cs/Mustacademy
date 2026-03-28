import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log("Connecting...");
        const res = await pool.query("SELECT NOW()");
        console.log("Success:", res.rows[0]);
        
        console.log("Checking masterclass_episodes columns...");
        const cols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'masterclass_episodes'
        `);
        console.log("Columns:", cols.rows.map(r => r.column_name));

    } catch (e) {
        console.error("DETAILED FAIL:", e);
    } finally {
        await pool.end();
    }
}

testConnection();
