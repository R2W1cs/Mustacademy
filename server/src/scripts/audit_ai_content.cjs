const pkg = require('pg');
const { Pool } = pkg;

const databaseUrl = "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require";

const pool = new Pool({ 
    connectionString: databaseUrl, 
    ssl: { rejectUnauthorized: false } 
});

async function auditAIContent() {
    try {
        const res = await pool.query(`
            SELECT id, title, content_easy_markdown, content_deep_markdown 
            FROM topics 
            WHERE id IN (694, 695, 696, 697, 698, 699)
            ORDER BY id
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

auditAIContent();
