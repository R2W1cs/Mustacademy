import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const tables = ['scholarly_assets', 'resources'];
        for (const t of tables) {
            console.log(`\n=== TABLE: ${t} ===`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${t}'
                ORDER BY ordinal_position
            `);
            console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
            
            const sample = await pool.query(`SELECT * FROM ${t} LIMIT 1`);
            if (sample.rows.length > 0) {
                console.log("Sample Data:", JSON.stringify(sample.rows[0], null, 2));
            }
        }
    } finally {
        await pool.end();
    }
}
check();
