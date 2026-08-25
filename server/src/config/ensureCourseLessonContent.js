/**
 * Idempotent lesson markdown sync for CS 342 + CS 321 (no Render shell required).
 */
import pool from './db.js';
import { topics as cs342Topics } from '../scripts/cs342/topics.mjs';
import { topics as cs321Topics } from '../scripts/cs321/topics.mjs';

async function resolveCourseId(patterns) {
  const res = await pool.query(
    `SELECT id, name FROM courses
     WHERE ${patterns.map((_, i) => `name ILIKE $${i + 1}`).join(' OR ')}
     LIMIT 1`,
    patterns
  );
  return res.rows[0] || null;
}

async function syncTopics(courseId, topics, label) {
  let updated = 0;
  let inserted = 0;

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
      RETURNING id`,
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
      await pool.query(
        `INSERT INTO topics (
          title, course_id, importance_level, breadcrumb_path,
          first_principles, learning_objectives,
          content_easy_markdown, content_deep_markdown, content_markdown
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
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
      inserted += 1;
    } else {
      updated += 1;
    }
  }

  console.log(`[Content] ${label}: updated ${updated}, inserted ${inserted} (${topics.length} lessons)`);
}

export async function ensureCourseLessonContent() {
  try {
    const cs342 = await resolveCourseId(['%CS 342%', '%Algorithms & Complexity%']);
    if (cs342) {
      await syncTopics(cs342.id, cs342Topics, `CS 342 (${cs342.name})`);
    }

    const cs321 = await resolveCourseId(['%CS 321%', '%Principles of Software Engineering%']);
    if (cs321) {
      await syncTopics(cs321.id, cs321Topics, `CS 321 (${cs321.name})`);
    }
  } catch (err) {
    console.warn('[Content] Lesson sync skipped:', err.message);
  }
}
