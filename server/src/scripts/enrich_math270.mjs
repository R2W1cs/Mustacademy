/**
 * Enrich MATH 270 Probability & Statistics topics.
 * Source of truth: server/src/scripts/math270/unit*.mjs
 *
 * Usage (from server/): node src/scripts/enrich_math270.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { topics as unit1 } from "./math270/unit1_descriptive.mjs";
import { topics as unit2 } from "./math270/unit2_probability.mjs";
import { topics as unit3 } from "./math270/unit3_random_variables.mjs";
import { topics as unit4 } from "./math270/unit4_distributions.mjs";
import { topics as unit5 } from "./math270/unit5_joint_limits.mjs";
import { topics as unit6 } from "./math270/unit6_sampling.mjs";
import { topics as unit7 } from "./math270/unit7_hypothesis.mjs";
import { topics as unit8 } from "./math270/unit8_regression.mjs";
import { topics as unit9 } from "./math270/unit9_additional.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const topics = [
  ...unit1,
  ...unit2,
  ...unit3,
  ...unit4,
  ...unit5,
  ...unit6,
  ...unit7,
  ...unit8,
  ...unit9,
];

async function resolveCourseId() {
  const res = await pool.query(
    `SELECT id, name FROM courses
     WHERE name ILIKE '%MATH 270%' OR name ILIKE '%Probability%statistic%'
     ORDER BY CASE WHEN name ILIKE '%MATH 270%' THEN 0 ELSE 1 END
     LIMIT 1`
  );
  return res.rows[0] || null;
}

async function enrich() {
  console.log(`Enriching MATH 270 (${topics.length} lessons)...`);
  const course = await resolveCourseId();
  if (!course) {
    throw new Error("MATH 270 / Probability & statistics course not found. Run seed_curriculum first.");
  }
  console.log(`  Course: ${course.name} (id=${course.id})`);

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
        course.id,
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
          course.id,
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
      console.log(`  + ${t.title}`);
    } else {
      updated += 1;
      console.log(`  ~ ${t.title}`);
    }
  }

  console.log(`\nMATH 270 enrich done — updated ${updated}, inserted ${inserted}.`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  enrich()
    .catch((err) => {
      console.error("MATH 270 enrich failed:", err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
