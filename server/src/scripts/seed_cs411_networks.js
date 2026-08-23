/**
 * Seed CS 411: Computer Networks topics.
 *
 * Rich lesson content lives in enrich_cs411_networks.mjs (source of truth).
 * This seed imports that data so INSERT and UPDATE stay aligned.
 *
 * Usage (from server/): node src/scripts/seed_cs411_networks.js
 * Enrich existing rows: node src/scripts/enrich_cs411_networks.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { topics } from "./enrich_cs411_networks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  console.log("Seeding CS 411: Computer Networks (visual-first lessons)...");
  console.log("  (content from enrich_cs411_networks.mjs)");
  try {
    const courseRes = await pool.query(
      `SELECT id, name FROM courses
       WHERE name ILIKE '%CS 411%' OR name ILIKE '%Computer Networks%'
       ORDER BY CASE WHEN name ILIKE '%CS 411%' THEN 0 ELSE 1 END
       LIMIT 1`
    );
    if (courseRes.rows.length === 0) {
      throw new Error("Computer Networks / CS 411 course not found. Run seed_courses / seed_curriculum first.");
    }
    const { id: courseId, name } = courseRes.rows[0];
    console.log(`  Course: ${name} (id=${courseId})`);

    await pool.query("DELETE FROM topics WHERE course_id = $1", [courseId]);

    for (const t of topics) {
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
          t.content_easy_markdown
        ]
      );
      console.log(`  OK ${t.title} (easy=${t.content_easy_markdown.length}, deep=${t.content_deep_markdown.length})`);
    }
    console.log(`\nCS 411 done -- ${topics.length} topics seeded.`);
  } catch (err) {
    console.error("CS 411 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
