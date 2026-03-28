import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function inspectTables() {
    try {
        const tables = ['masterclass_episodes', 'modules', 'courses'];
        for (const table of tables) {
            console.log(`\n=== TABLE: ${table} ===`);
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY ordinal_position
            `);
            console.log("Columns:", columns.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
            
            const count = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log("Row count:", count.rows[0].count);

            if (count.rows[0].count > 0) {
                const sample = await pool.query(`SELECT * FROM ${table} LIMIT 1`);
                console.log("Sample Data:", JSON.stringify(sample.rows[0], null, 2));
            }
        }
    } catch (e) {
        console.error("FAIL:", e.message);
    } finally {
        await pool.end();
    }
}

inspectTables();
