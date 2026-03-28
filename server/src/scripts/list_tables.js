import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function listAllTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log("=== TABLES FOUND ===");
        res.rows.forEach(r => console.log(`- ${r.table_name}`));

    } catch (e) {
        console.error("FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

listAllTables();
