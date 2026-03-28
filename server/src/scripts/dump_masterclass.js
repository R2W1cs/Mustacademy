import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';

const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const res = await pool.query(`SELECT * FROM masterclass_episodes ORDER BY id ASC`);
        fs.writeFileSync('masterclass_dump.json', JSON.stringify(res.rows, null, 2));
        console.log("Dumped to masterclass_dump.json");
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

main();
