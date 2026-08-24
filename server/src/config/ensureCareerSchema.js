import pool from './db.js';

/**
 * Idempotent career_roadmaps schema patch for free-tier hosts without a shell.
 * Safe to run every boot — uses IF NOT EXISTS / information_schema checks.
 */
export async function ensureCareerRoadmapSchema() {
  if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'test') return;

  const client = await pool.connect();
  try {
    const table = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'career_roadmaps'
      LIMIT 1
    `);
    if (table.rowCount === 0) {
      console.warn('[ensureCareerSchema] career_roadmaps table missing — skip');
      return;
    }

    await client.query(`
      ALTER TABLE career_roadmaps
        ADD COLUMN IF NOT EXISTS full_roadmap_json JSONB,
        ADD COLUMN IF NOT EXISTS career_key TEXT
    `);

    // Make architecture columns nullable when present and still NOT NULL
    for (const col of ['architecture_json', 'roadmap_steps_json']) {
      const colInfo = await client.query(
        `
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'career_roadmaps'
          AND column_name = $1
        `,
        [col]
      );
      if (colInfo.rowCount > 0 && colInfo.rows[0].is_nullable === 'NO') {
        await client.query(
          `ALTER TABLE career_roadmaps ALTER COLUMN ${col} DROP NOT NULL`
        );
      }
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_career_roadmaps_career_key
        ON career_roadmaps (user_id, career_key)
    `);

    console.log('[ensureCareerSchema] ✓ career_roadmaps columns ready');
  } catch (err) {
    console.error('[ensureCareerSchema] Failed:', err.message);
  } finally {
    client.release();
  }
}

/**
 * Optional idempotent course↔career seed (no-op if tables/careers missing).
 */
export async function ensureCourseCareerSeed() {
  if (!process.env.DATABASE_URL || process.env.NODE_ENV === 'test') return;

  const RULES = [
    { match: 'computer networks', careers: ['Software Engineer', 'Cybersecurity', 'Web Developer'] },
    { match: 'CS 411', careers: ['Software Engineer', 'Cybersecurity', 'Web Developer'] },
    { match: 'data structures', careers: ['Software Engineer', 'AI Engineer', 'Data Scientist'] },
    { match: 'algorithms', careers: ['Software Engineer', 'AI Engineer', 'Data Scientist'] },
    { match: 'operating systems', careers: ['Software Engineer', 'Cybersecurity', 'AI Engineer'] },
    { match: 'databases', careers: ['Software Engineer', 'Data Scientist', 'Web Developer'] },
    { match: 'data warehousing', careers: ['Data Scientist', 'Software Engineer'] },
    { match: 'artificial intelligence', careers: ['AI Engineer', 'Data Scientist', 'Software Engineer'] },
    { match: 'web application', careers: ['Web Developer', 'Software Engineer'] },
    { match: 'cloud computing', careers: ['Software Engineer', 'Cybersecurity'] },
    { match: 'software engineering', careers: ['Software Engineer', 'Web Developer'] },
    { match: 'software design', careers: ['Software Engineer', 'Web Developer'] },
    { match: 'software testing', careers: ['Software Engineer', 'Web Developer'] },
    { match: 'human computer', careers: ['Web Developer', 'Software Engineer'] },
    { match: 'programming', careers: ['Software Engineer', 'Web Developer'] },
    { match: 'compiler', careers: ['Software Engineer', 'AI Engineer'] },
    { match: 'digital systems', careers: ['Software Engineer', 'Cybersecurity'] },
    { match: 'computer systems', careers: ['Software Engineer', 'Cybersecurity'] },
    { match: 'data ethics', careers: ['Data Scientist', 'AI Engineer', 'Cybersecurity'] },
  ];

  try {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('course_career', 'courses', 'career_paths')
    `);
    const names = new Set(tables.rows.map((r) => r.table_name));
    if (!names.has('course_career') || !names.has('courses') || !names.has('career_paths')) {
      return;
    }

    const careersRes = await pool.query(`SELECT id, name FROM career_paths`);
    if (careersRes.rowCount === 0) return;

    const careerByName = Object.fromEntries(careersRes.rows.map((r) => [r.name, r.id]));
    const coursesRes = await pool.query(`SELECT id, name FROM courses`);
    let inserted = 0;

    for (const course of coursesRes.rows) {
      const nameLower = (course.name || '').toLowerCase();
      const matched = new Set();
      for (const rule of RULES) {
        if (nameLower.includes(rule.match.toLowerCase())) {
          rule.careers.forEach((c) => matched.add(c));
        }
      }
      for (const careerName of matched) {
        const careerId = careerByName[careerName];
        if (!careerId) continue;
        const result = await pool.query(
          `
          INSERT INTO course_career (course_id, career_id)
          SELECT $1, $2
          WHERE NOT EXISTS (
            SELECT 1 FROM course_career WHERE course_id = $1 AND career_id = $2
          )
          `,
          [course.id, careerId]
        );
        inserted += result.rowCount || 0;
      }
    }

    if (inserted > 0) {
      console.log(`[ensureCareerSchema] course_career seed: +${inserted} links`);
    }
  } catch (err) {
    console.warn('[ensureCareerSchema] course_career seed skipped:', err.message);
  }
}
