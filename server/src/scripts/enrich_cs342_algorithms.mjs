/**
 * Enrich CS 342 Algorithms & Complexity topics with lesson markdown.
 * Source of truth: server/src/scripts/cs342/topics.mjs
 *
 * Usage: node src/scripts/enrich_cs342_algorithms.mjs  (from server/)
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { topics } from "./cs342/topics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const FALLBACK_COURSE_ID = 175;

function len(s) {
  return s ? s.length : 0;
}

async function resolveCourseId() {
  const res = await pool.query(
    `SELECT id, name FROM courses
     WHERE name ILIKE '%CS 342%' OR name ILIKE '%Algorithms & Complexity%'
     ORDER BY CASE WHEN name ILIKE '%CS 342%' THEN 0 ELSE 1 END
     LIMIT 1`
  );
  if (res.rows.length > 0) {
    return { id: res.rows[0].id, name: res.rows[0].name };
  }
  console.warn(
    `  No CS 342 / Algorithms & Complexity course found; falling back to course_id=${FALLBACK_COURSE_ID}`
  );
  return { id: FALLBACK_COURSE_ID, name: `(fallback id ${FALLBACK_COURSE_ID})` };
}

async function enrich() {
  const results = [];

  try {
    const course = await resolveCourseId();
    const courseId = course.id;
    console.log(`Enriching CS 342 topics (course: ${course.name}, id=${courseId})...`);
    console.log(`  ${topics.length} lessons from cs342/topics.mjs`);

    for (const t of topics) {
      const match = t.titleMatch || t.title;
      const res = await pool.query(
        `UPDATE topics SET
          title = $1,
          content_easy_markdown = $2,
          content_deep_markdown = $3,
          content_markdown = $4,
          learning_objectives = $5,
          first_principles = $6,
          importance_level = COALESCE($7, importance_level),
          breadcrumb_path = COALESCE($8, breadcrumb_path)
        WHERE course_id = $9
          AND (title ILIKE $10 OR title ILIKE $11)
        RETURNING id, title`,
        [
          t.title,
          t.content_easy_markdown,
          t.content_deep_markdown,
          t.content_easy_markdown,
          JSON.stringify(t.learning_objectives),
          JSON.stringify(t.first_principles),
          t.importance_level || null,
          t.breadcrumb_path || null,
          courseId,
          match,
          t.title,
        ]
      );

      if (res.rowCount === 0) {
        const ins = await pool.query(
          `INSERT INTO topics (
            title, course_id, importance_level, breadcrumb_path,
            first_principles, learning_objectives,
            content_easy_markdown, content_deep_markdown, content_markdown
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING id, title`,
          [
            t.title,
            courseId,
            t.importance_level,
            t.breadcrumb_path,
            JSON.stringify(t.first_principles),
            JSON.stringify(t.learning_objectives),
            t.content_easy_markdown,
            t.content_deep_markdown,
            t.content_easy_markdown,
          ]
        );
        const row = ins.rows[0];
        const easy = len(t.content_easy_markdown);
        const deep = len(t.content_deep_markdown);
        console.log(`  INSERT ${row.title}`);
        console.log(`      easy=${easy}  deep=${deep}`);
        results.push({ title: row.title, updated: true, inserted: true, easy, deep });
        continue;
      }

      const row = res.rows[0];
      const easy = len(t.content_easy_markdown);
      const deep = len(t.content_deep_markdown);
      console.log(`  OK  ${row.title}`);
      console.log(`      easy=${easy}  deep=${deep}`);
      results.push({ title: row.title, updated: true, inserted: false, easy, deep });
    }

    console.log("\n=== Summary (status | title | easy | deep) ===");
    for (const r of results) {
      const status = r.inserted ? "INSERT" : r.updated ? "OK" : "MISS";
      console.log(`${status}\t${r.title}\teasy=${r.easy}\tdeep=${r.deep}`);
    }
    const inserted = results.filter((r) => r.inserted).length;
    const updated = results.filter((r) => r.updated && !r.inserted).length;
    console.log(`\nDone. Updated ${updated}, inserted ${inserted}, total ${topics.length}.`);
  } catch (err) {
    console.error("Enrich failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  enrich();
}

export { enrich, resolveCourseId };
