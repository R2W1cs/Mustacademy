/**
 * masterclass.worker.js
 * BullMQ worker that processes 12-chapter masterclass generation in the background.
 * Each job is a sequential loop of AI calls; retry-safe via job progress tracking.
 */
import { Worker } from "bullmq";
import { redisOpts } from "../config/redis.js";
import pool from "../config/db.js";
import { callAI } from "../utils/aiClient.js";
import { MASTERCLASS_EPISODE_PROMPT } from "../utils/aiRules.js";

export const MASTERCLASS_QUEUE_NAME = "masterclass";

const processMasterclass = async (job) => {
    const { title, theme, partNumber, userId } = job.data;
    console.log(`[MasterclassWorker] Job ${job.id} — "${title}" (${12} chapters)`);

    const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const userName = userRes.rows[0]?.name?.split(" ")[0] || "Student";

    const totalChapters = 12;
    let allSegments = [];
    let previousContext = "The intro hook: Challenge the status quo of modern education and the mindset of the 1%.";

    for (let i = 1; i <= totalChapters; i++) {
        const prompt = MASTERCLASS_EPISODE_PROMPT
            .replace(/{title}/g, title)
            .replace(/{theme}/g, theme)
            .replace(/{chapter_index}/g, i)
            .replace(/{total_chapters}/g, totalChapters)
            .replace(/{previous_context}/g, previousContext)
            .replace(/{USER_NAME}/g, userName);

        const aiData = await callAI(prompt, true, 3072);

        if (aiData && Array.isArray(aiData.segments) && aiData.segments.length > 0) {
            const sanitized = aiData.segments.map(seg => ({
                ...seg,
                text: seg.text.replace(/{USER_NAME}/g, userName),
            }));
            allSegments = [...allSegments, ...sanitized];
            previousContext = aiData.next_chapter_hook || `Chapter ${i + 1} transition.`;
        } else {
            console.warn(`[MasterclassWorker] Chapter ${i} returned empty/invalid data — skipping.`);
        }

        // Report progress so the queue dashboard can track it
        await job.updateProgress(Math.round((i / totalChapters) * 100));
    }

    await pool.query(
        "INSERT INTO masterclass_episodes (title, summary, segments, part_number) VALUES ($1, $2, $3, $4)",
        [title, `Full 1-Hour Mastery: ${theme}`, JSON.stringify(allSegments), partNumber]
    );

    console.log(`[MasterclassWorker] Job ${job.id} complete — ${allSegments.length} segments saved.`);
    return { title, segmentCount: allSegments.length };
};

export const startMasterclassWorker = () => {
    if (!redisOpts) return null;

    const worker = new Worker(MASTERCLASS_QUEUE_NAME, processMasterclass, {
        connection: redisOpts,
        concurrency: 1, // Masterclass jobs are 12-call loops; keep concurrency low
        limiter: { max: 1, duration: 1000 }, // One job per second max
    });

    worker.on("completed", (job, result) => {
        console.log(`[MasterclassWorker] ✓ ${job.id} — "${result.title}" (${result.segmentCount} segments)`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[MasterclassWorker] ✗ ${job?.id} — ${err.message}`);
    });
    worker.on("progress", (job, progress) => {
        console.log(`[MasterclassWorker] ${job.id} — ${progress}% complete`);
    });

    console.log("[MasterclassWorker] Started (concurrency: 1)");
    return worker;
};
