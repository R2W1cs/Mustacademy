import pool from "../config/db.js";

/**
 * Seeds Chapter 1 as five individual parts in masterclass_episodes.
 * 
 * Place your video files in:  server/tts-service/docum/
 *   chapter1_part1.mp4  → Part I   — The Mechanical Mind
 *   chapter1_part2.mp4  → Part II  — Turing's Vision
 *   chapter1_part3.mp4  → Part III — The First Computers
 *   chapter1_part4.mp4  → Part IV  — Binary World
 *   chapter1_part5.mp4  → Part V   — Dawn of the Algorithm
 *
 * If a file doesn't exist yet, the video_url is stored as null
 * and can be updated later via /api/ai/masterclass/episode/:id.
 */

const CHAPTER_1_PARTS = [
  {
    title: "Chapter I, Part 1 — The Mechanical Mind",
    summary: "The pre-digital era: mechanical calculators, Babbage's Difference Engine, and the conceptual seeds of modern computation.",
    chapter_number: 1,
    part_number: 1,
    video_file: "chapter1_part1.mp4",
  },
  {
    title: "Chapter I, Part 2 — Turing's Vision",
    summary: "Alan Turing's theoretical framework for universal computation and the Turing Machine that redefined what 'computing' means.",
    chapter_number: 1,
    part_number: 2,
    video_file: "chapter1_part2.mp4",
  },
  {
    title: "Chapter I, Part 3 — The First Computers",
    summary: "From ENIAC to UNIVAC — room-sized machines, vacuum tubes, and the birth of programmable hardware.",
    chapter_number: 1,
    part_number: 3,
    video_file: "chapter1_part3.mp4",
  },
  {
    title: "Chapter I, Part 4 — Binary World",
    summary: "Boolean algebra, logic gates, and how everything in computing reduces to a single bit: 0 or 1.",
    chapter_number: 1,
    part_number: 4,
    video_file: "chapter1_part4.mp4",
  },
  {
    title: "Chapter I, Part 5 — Dawn of the Algorithm",
    summary: "The first algorithms, Assembly language, and how humans learned to instruct machines — closing the gap between idea and silicon.",
    chapter_number: 1,
    part_number: 5,
    video_file: "chapter1_part5.mp4",
  },
];

async function seed() {
  try {
    // Clear old chapter 1 entries
    await pool.query("DELETE FROM masterclass_episodes WHERE chapter_number = 1");
    console.log("[Seed] Cleared existing Chapter 1 entries.");

    for (const ep of CHAPTER_1_PARTS) {
      const videoUrl = ep.part_number === 1
        ? "https://0qiy0ja4vcjxeybw.public.blob.vercel-storage.com/chapter1_part1.mp4"
        : `/tts-docum/${ep.video_file}`;
      
      await pool.query(
        `INSERT INTO masterclass_episodes 
          (title, summary, segments, part_number, chapter_number, video_url, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [ep.title, ep.summary, JSON.stringify([]), ep.part_number, ep.chapter_number, videoUrl]
      );
      console.log(`[Seed] ✓ Inserted: ${ep.title}`);
    }

    console.log("\n[Seed] Done! Chapter 1 now has 5 parts.");
    console.log("Place your video files in:  server/tts-service/docum/");
    console.log("  chapter1_part1.mp4  →  The Mechanical Mind");
    console.log("  chapter1_part2.mp4  →  Turing's Vision");
    console.log("  chapter1_part3.mp4  →  The First Computers");
    console.log("  chapter1_part4.mp4  →  Binary World");
    console.log("  chapter1_part5.mp4  →  Dawn of the Algorithm");
  } catch (err) {
    console.error("[Seed] Error:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
