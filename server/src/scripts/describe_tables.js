import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function describeTables() {
    try {
        const tables = ['masterclass_episodes', 'courses', 'topics', 'learning_paths'];
        for (const table of tables) {
            console.log(`\n--- SCHEMA: ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
    } catch (e) {
        console.error("FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

describeTables();
