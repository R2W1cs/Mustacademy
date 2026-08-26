/**
 * Seed MATH 270: Probability & Statistics topics (full replace).
 *
 * Usage (from server/): node src/scripts/seed_math270.js
 * Soft update existing: node src/scripts/enrich_math270.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { topics } from "./enrich_math270.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seed() {
  console.log("Seeding MATH 270: Probability & Statistics...");
  console.log(`  (${topics.length} lessons from math270/unit*.mjs)`);
  try {
    const courseRes = await pool.query(
      `SELECT id, name FROM courses
       WHERE name ILIKE '%MATH 270%' OR name ILIKE '%Probability%statistic%'
       ORDER BY CASE WHEN name ILIKE '%MATH 270%' THEN 0 ELSE 1 END
       LIMIT 1`
    );
    if (courseRes.rows.length === 0) {
      throw new Error(
        "MATH 270 / Probability & statistics course not found. Run seed_curriculum first."
      );
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
          t.content_easy_markdown,
        ]
      );
      console.log(
        `  OK ${t.title} (easy=${t.content_easy_markdown.length}, deep=${t.content_deep_markdown.length})`
      );
    }
    console.log(`\nMATH 270 done — ${topics.length} topics seeded.`);
  } catch (err) {
    console.error("MATH 270 seeding failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

seed();
