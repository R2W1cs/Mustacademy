import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function inspectTopics() {
    try {
        console.log(`\n=== TABLE: topics ===`);
        const cols = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'topics'
        `);
        console.log("Columns:", cols.rows.map(r => r.column_name).join(', '));
        
        const sample = await pool.query(`SELECT * FROM topics WHERE video_url IS NOT NULL LIMIT 1`);
        if (sample.rows.length > 0) {
            console.log("Sample with video:", sample.rows[0]);
        } else {
            console.log("No topics with video_url found.");
            const anySample = await pool.query(`SELECT * FROM topics LIMIT 1`);
            console.log("Any sample:", anySample.rows[0]);
        }
    } catch (e) {
        console.error("FAIL:", e);
    } finally {
        await pool.end();
    }
}

inspectTopics();
