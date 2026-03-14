import 'dotenv/config';
import fs from 'fs';
import pool from '../config/db.js';
import { callOllama } from '../utils/aiClient.js';
import { PROFESSOR_THEORY_SYNTHESIS_PROMPT } from '../utils/aiRules.js';

async function run() {
    // Pick a well-known theory topic
    const res = await pool.query("SELECT id, title, course_id FROM topics LIMIT 1");
    const topic = res.rows[0];
    const courseRes = await pool.query("SELECT name FROM courses WHERE id = $1", [topic.course_id]);
    const courseName = courseRes.rows[0]?.name || "Computer Science";

    console.log(`Testing synthesis for: "${topic.title}" (${courseName})`);

    const prompt = PROFESSOR_THEORY_SYNTHESIS_PROMPT
        .replace("{topic}", topic.title)
        .replace("{course}", courseName)
        .replace("{level}", "Intermediate");

    const aiData = await callOllama(prompt);

    // Write full AI response to file for inspection
    fs.writeFileSync('last_ai_data.json', JSON.stringify(aiData, null, 2));

    console.log("\n--- FIELD PRESENCE CHECK ---");
    const fields = ['content_markdown', 'historical_context', 'first_principles', 'breadcrumb_path'];
    fields.forEach(f => {
        const val = aiData[f];
        console.log(`${f}: ${val ? '✅ present (' + String(val).substring(0, 80) + '...)' : '❌ MISSING/NULL'}`);
    });

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
