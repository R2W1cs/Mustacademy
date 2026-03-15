import 'dotenv/config';
import pool from '../config/db.js';

async function diagnose() {
    try {
        console.log("--- Topic Database Diagnosis ---");

        // 1. Check columns
        const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'topics'");
        const columns = colRes.rows.map(r => r.column_name);
        console.log("Columns in 'topics' table:", columns.join(", "));

        const hasMarkdown = columns.includes('content_markdown');
        console.log("Has 'content_markdown' column:", hasMarkdown);

        if (hasMarkdown) {
            // 2. Count missing markdown
            const missingRes = await pool.query("SELECT COUNT(*) FROM topics WHERE content_markdown IS NULL OR content_markdown = ''");
            console.log("Topics missing 'content_markdown':", missingRes.rows[0].count);

            // 3. Count total topics
            const totalRes = await pool.query("SELECT COUNT(*) FROM topics");
            console.log("Total topics:", totalRes.rows[0].count);

            // 4. Sample topics missing markdown
            const sampleRes = await pool.query("SELECT id, title FROM topics WHERE content_markdown IS NULL OR content_markdown = '' LIMIT 10");
            console.log("Sample topics missing markdown:", JSON.stringify(sampleRes.rows, null, 2));

            // 5. Check 'Evolution of data warehousing'
            const targetRes = await pool.query("SELECT id, title, content_markdown FROM topics WHERE title ILIKE '%Evolution of data warehousing%'");
            console.log("Target topic 'Evolution of data warehousing':", JSON.stringify(targetRes.rows, null, 2));
        } else {
            console.error("CRITICAL: 'content_markdown' column is MISSING. Migration might have failed or not run on this DB.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Diagnosis failed:", err);
        process.exit(1);
    }
}

diagnose();
