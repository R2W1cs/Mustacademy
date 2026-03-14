import 'dotenv/config';
import pool from '../config/db.js';

async function check() {
    const res = await pool.query(`
        SELECT id, title, 
               LENGTH(content_easy_markdown) as easy_len,
               LENGTH(content_deep_markdown) as deep_len,
               LEFT(content_easy_markdown, 100) as easy_preview,
               LEFT(content_deep_markdown, 100) as deep_preview
        FROM topics WHERE id = 130
    `);
    const row = res.rows[0];
    console.log(`Topic: ${row.title}`);
    console.log(`Easy Length: ${row.easy_len || 0}`);
    console.log(`Deep Length: ${row.deep_len || 0}`);
    console.log(`Easy Preview: ${row.easy_preview || 'NULL'}`);
    console.log(`Deep Preview: ${row.deep_preview || 'NULL'}`);
    console.log(row.easy_len && row.deep_len ? '✅ BOTH POPULATED' : '❌ MISSING CONTENT');
    await pool.end();
}
check();
