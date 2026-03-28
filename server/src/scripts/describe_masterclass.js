import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function describeMasterclass() {
    try {
        console.log(`\n--- SCHEMA: masterclass_episodes ---`);
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'masterclass_episodes'
        `);
        res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log(`\n--- DATA: masterclass_episodes ---`);
        const data = await pool.query(`SELECT * FROM masterclass_episodes`);
        console.log(JSON.stringify(data.rows, null, 2));

    } catch (e) {
        console.error("FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

describeMasterclass();
