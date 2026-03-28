import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_uY4h7djiasIp@ep-misty-queen-ag8488es.c-2.eu-central-1.aws.neon.tech/cs_roadmap?sslmode=require'
});

async function insertFirstEpisode() {
  try {
    // 1. Shift existing episodes
    console.log("Updating existing episodes...");
    await pool.query("UPDATE masterclass_episodes SET part_number = part_number + 1 WHERE part_number >= 1");

    // 2. Insert the new first episode
    console.log("Inserting new first episode...");
    const title = "Chapter 1: The Foundation — Origins & Logic";
    const summary = "The official start of our Computer Science Masterclass Series. This first chapter dives into the core logic and historical context that built the digital world.";
    const video_url = "https://0qiy0ja4vcjxeybw.public.blob.vercel-storage.com/chapter1_part1.mp4"; // External Vercel Blob Storage
    const chapter_number = 1;
    const part_number = 1;
    const segments = JSON.stringify([]); // Empty segments for video-based episode

    await pool.query(
      "INSERT INTO masterclass_episodes (title, summary, video_url, chapter_number, part_number, segments, published_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
      [title, summary, video_url, chapter_number, part_number, segments]
    );

    console.log("Successfully integrated Chapter 1, Episode 1.");
  } catch (err) {
    console.error("Integration failed:", err);
  } finally {
    await pool.end();
  }
}

insertFirstEpisode();
