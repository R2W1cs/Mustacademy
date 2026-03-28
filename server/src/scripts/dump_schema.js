import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function dumpSchema() {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        `);
        
        let currentTable = "";
        res.rows.forEach(r => {
            if (r.table_name !== currentTable) {
                currentTable = r.table_name;
                console.log(`\n=== ${currentTable} ===`);
            }
            console.log(`${r.column_name} (${r.data_type})`);
        });

    } catch (e) {
        console.error("FAIL:", e);
    } finally {
        await pool.end();
    }
}

dumpSchema();
