import 'dotenv/config';
import pool from '../config/db.js';

const r1 = await pool.query('SELECT COUNT(*) as total, COUNT(content_markdown) as done FROM topics');
console.log('PROGRESS:', r1.rows[0].done + '/' + r1.rows[0].total, 'topics have content_markdown');

const r2 = await pool.query("SELECT id, title, content_markdown IS NOT NULL as has_md, left(content_markdown, 150) as preview FROM topics WHERE title ILIKE '%OLTP%' OR title ILIKE '%OLAP%'");
console.log('\nOLTP/OLAP topics:');
r2.rows.forEach(row => {
    console.log(`  ID:${row.id} | ${row.title} | has_md: ${row.has_md}`);
    if (row.preview) console.log(`  Preview: ${row.preview}`);
});

process.exit(0);
