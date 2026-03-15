const pkg = require('pg');
const { Pool } = pkg;

const databaseUrl = "postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require";

const pool = new Pool({ 
    connectionString: databaseUrl, 
    ssl: { rejectUnauthorized: false } 
});

async function listAITopics() {
    try {
        const res = await pool.query(`
            SELECT t.id, t.title 
            FROM topics t 
            JOIN courses c ON t.course_id = c.id 
            WHERE c.name ILIKE '%CS 481%' OR c.name ILIKE '%Artificial Intelligence%' 
            ORDER BY t.id
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAITopics();
