import 'dotenv/config';
import pool from '../config/db.js';
import { synthesizeTopic } from '../controllers/ai.controller.js';

async function test() {
    const topicId = 130; // Ideation & Sketching
    console.log(`🚀 Starting dual-mode synthesis test for Topic ID: ${topicId}`);

    // Mock req and res for the controller
    const req = { body: { topicId } };
    const res = {
        status: (code) => ({
            json: (data) => console.log(`Response [${code}]:`, JSON.stringify(data, null, 2))
        }),
        json: (data) => console.log(`Response [200]:`, JSON.stringify(data, null, 2))
    };

    try {
        await synthesizeTopic(req, res);

        console.log("\n📊 Verifying database columns...");
        const dbRes = await pool.query(`
            SELECT id, title, content_easy_markdown, content_deep_markdown 
            FROM topics 
            WHERE id = $1
        `, [topicId]);

        const row = dbRes.rows[0];
        console.log(`Topic: ${row.title}`);
        console.log(`Easy Content Length: ${row.content_easy_markdown?.length || 0}`);
        console.log(`Deep Content Length: ${row.content_deep_markdown?.length || 0}`);

        if (row.content_easy_markdown && row.content_deep_markdown) {
            console.log("✅ SUCCESS: Both easy and deep content generated.");
        } else {
            console.log("❌ FAILURE: Missing dual-mode content.");
        }

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await pool.end();
        process.exit();
    }
}

test();
