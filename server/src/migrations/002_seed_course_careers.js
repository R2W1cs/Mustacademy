/**
 * LEGACY data seed — prefer `npm run seed:course-careers` (uses ensureCourseCareerSeed).
 * Do not treat this as a schema migration.
 */
import pool from "../config/db.js";

/** Matches course.name (case-insensitive substring) → career_paths.name */
const COURSE_CAREER_RULES = [
  { match: "computer networks", careers: ["Software Engineer", "Cybersecurity", "Web Developer"] },
  { match: "CS 411", careers: ["Software Engineer", "Cybersecurity", "Web Developer"] },
  { match: "data structures", careers: ["Software Engineer", "AI Engineer", "Data Scientist"] },
  { match: "algorithms", careers: ["Software Engineer", "AI Engineer", "Data Scientist"] },
  { match: "operating systems", careers: ["Software Engineer", "Cybersecurity", "AI Engineer"] },
  { match: "databases", careers: ["Software Engineer", "Data Scientist", "Web Developer"] },
  { match: "data warehousing", careers: ["Data Scientist", "Software Engineer"] },
  { match: "artificial intelligence", careers: ["AI Engineer", "Data Scientist", "Software Engineer"] },
  { match: "web application", careers: ["Web Developer", "Software Engineer"] },
  { match: "cloud computing", careers: ["Software Engineer", "Cybersecurity"] },
  { match: "software engineering", careers: ["Software Engineer", "Web Developer"] },
  { match: "software design", careers: ["Software Engineer", "Web Developer"] },
  { match: "software testing", careers: ["Software Engineer", "Web Developer"] },
  { match: "human computer", careers: ["Web Developer", "Software Engineer"] },
  { match: "programming", careers: ["Software Engineer", "Web Developer"] },
  { match: "compiler", careers: ["Software Engineer", "AI Engineer"] },
  { match: "digital systems", careers: ["Software Engineer", "Cybersecurity"] },
  { match: "computer systems", careers: ["Software Engineer", "Cybersecurity"] },
  { match: "data ethics", careers: ["Data Scientist", "AI Engineer", "Cybersecurity"] },
];

async function ensureUniqueConstraint() {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_career_pkey'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'course_career_course_id_career_id_key'
      ) THEN
        BEGIN
          ALTER TABLE course_career
            ADD CONSTRAINT course_career_course_id_career_id_key UNIQUE (course_id, career_id);
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'course_career unique constraint skipped: %', SQLERRM;
        END;
      END IF;
    END $$;
  `);
}

async function seed() {
  await ensureUniqueConstraint();

  const careersRes = await pool.query(`SELECT id, name FROM career_paths`);
  const careerByName = Object.fromEntries(careersRes.rows.map((r) => [r.name, r.id]));

  const coursesRes = await pool.query(`SELECT id, name FROM courses`);
  let inserted = 0;

  for (const course of coursesRes.rows) {
    const nameLower = course.name.toLowerCase();
    const matchedCareers = new Set();

    for (const rule of COURSE_CAREER_RULES) {
      if (nameLower.includes(rule.match.toLowerCase())) {
        rule.careers.forEach((c) => matchedCareers.add(c));
      }
    }

    for (const careerName of matchedCareers) {
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

  console.log(`[seed_course_careers] Inserted ${inserted} course↔career links`);
  await pool.end();
}

seed().catch(async (err) => {
  console.error("[seed_course_careers] Failed:", err);
  await pool.end();
  process.exit(1);
});
