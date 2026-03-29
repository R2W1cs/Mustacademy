/**
 * seed_y1s1_all.js — Master runner for Year 1 Semester 1
 *
 * Seeds all 6 courses in Y1S1 with full rich topic content.
 * Run: node server/src/scripts/seed_y1s1_all.js
 *
 * Courses seeded:
 *   MATH 111 — 20 topics
 *   CS 121   — 22 topics
 *   CS 161   — 38 topics (re-seeded with full content)
 *   CSE 123  — 19 topics
 *   ENG 101  — 12 topics
 *   ISS 166  — 10 topics
 *   ─────────────────────
 *   Total    — 121 topics
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const scripts = [
  { file: "seed_y1s1_math111.js",    label: "MATH 111: Math I",                        expected: 20 },
  { file: "seed_y1s1_cs121.js",      label: "CS 121: Programming I",                   expected: 22 },
  { file: "seed_y1s1_cs161_full.js", label: "CS 161: Intro to Computer Systems",        expected: 38 },
  { file: "seed_y1s1_cse123.js",     label: "CSE 123: Intro to Digital Systems",        expected: 19 },
  { file: "seed_y1s1_eng101.js",     label: "ENG 101: Academic English",                expected: 12 },
  { file: "seed_y1s1_iss166.js",     label: "ISS 166: Freshman Seminar",                expected: 10 },
];

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║        YEAR 1 SEMESTER 1 — FULL CONTENT SEED        ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

let totalSeeded = 0;
let failed = [];

for (const { file, label, expected } of scripts) {
  const filePath = path.join(__dirname, file);
  console.log(`\n📚 ${label}`);
  console.log(`   Running ${file}...`);

  try {
    execSync(`node --experimental-vm-modules "${filePath}"`, {
      stdio: "inherit",
      env: { ...process.env }
    });
    totalSeeded += expected;
  } catch (err) {
    console.error(`\n❌ Failed: ${file}`);
    console.error(`   ${err.message}`);
    failed.push(label);
  }
}

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║                    SEED SUMMARY                     ║");
console.log("╚══════════════════════════════════════════════════════╝");
console.log(`\n✅ Scripts attempted : ${scripts.length}`);
console.log(`✅ Scripts succeeded : ${scripts.length - failed.length}`);

if (failed.length > 0) {
  console.log(`❌ Scripts failed   : ${failed.length}`);
  failed.forEach(f => console.log(`   • ${f}`));
} else {
  console.log(`\n🎓 Year 1 Semester 1 fully seeded!`);
  console.log(`   ${totalSeeded} topics across ${scripts.length} courses.`);
}
