import 'dotenv/config';
import pool from '../src/config/db.js';

const replacements = [
  ['%/pulse/cloud-demand%', 'https://www.linkedin.com/jobs/search/?keywords=Platform%20Engineer%20OR%20Kubernetes', 'LinkedIn Jobs'],
  ['%/pulse/ai-infra%', 'https://www.linkedin.com/jobs/search/?keywords=%22ML%20Infrastructure%22%20OR%20vLLM', 'LinkedIn Jobs'],
  ['%/pulse/cyber-hiring%', 'https://www.linkedin.com/jobs/search/?keywords=%22Security%20Engineer%22%20OR%20AppSec', 'LinkedIn Jobs'],
  ['%/pulse/fullstack%', 'https://www.linkedin.com/jobs/search/?f_WT=2&keywords=Full%20Stack%20Engineer', 'LinkedIn Jobs'],
  ['%/pulse/edge%', 'https://www.linkedin.com/jobs/search/?keywords=%22Web%20Performance%22%20OR%20CDN', 'LinkedIn Jobs'],
];

const before = await pool.query(
  `SELECT count(*)::int AS n FROM market_news WHERE source_url ILIKE '%mustacademy.dev/pulse%'`
);
console.log('fake links before', before.rows[0].n);

for (const [pattern, url, name] of replacements) {
  const r = await pool.query(
    `UPDATE market_news
     SET source_url = $1, source_name = $2
     WHERE source_url LIKE $3
     RETURNING id`,
    [url, name, pattern]
  );
  console.log(pattern, 'updated', r.rowCount);
}

const leftover = await pool.query(
  `UPDATE market_news
   SET source_url = NULL
   WHERE source_url ILIKE '%mustacademy.dev/pulse%'
   RETURNING id`
);
console.log('nulled leftovers', leftover.rowCount);

const after = await pool.query(
  `SELECT count(*)::int AS n FROM market_news WHERE source_url ILIKE '%mustacademy.dev/pulse%'`
);
console.log('fake links after', after.rows[0].n);

const sample = await pool.query(
  `SELECT title, source_url FROM market_news
   WHERE source_name = 'LinkedIn Jobs'
   ORDER BY created_at DESC LIMIT 5`
);
console.table(sample.rows);

await pool.end();
