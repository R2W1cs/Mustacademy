import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ 
    connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log("Cleaning up masterclass_episodes...");
        await pool.query('DELETE FROM masterclass_episodes');
        
        console.log("Seeding Chapter 1...");
        await pool.query(`
            INSERT INTO masterclass_episodes (title, summary, video_url, chapter_number, part_number, segments)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            "Chapter I: The Foundation — Origins & Logic",
            "This first chapter dives into the core logic and historical context that built the digital world. We explore vacuum tubes, Turing machines, and the birth of the digital age.",
            "/tts-docum/capter1,episode1.mp4",
            1,
            1,
            JSON.stringify([])
        ]);

        console.log("Done! Series started.");
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

main();
