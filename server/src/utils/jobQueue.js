/**
 * jobQueue.js
 * Unified job queue API for long-running AI tasks.
 *
 * When REDIS_URL is set: uses BullMQ (persistent, retryable, observable).
 * When REDIS_URL is absent: uses in-process async fallback (dev/no-Redis).
 *
 * Callers always receive a jobId string; BullMQ job IDs or UUID for fallback.
 */
import { randomUUID } from "crypto";
import { redisAvailable, redisOpts } from "../config/redis.js";

// ---------------------------------------------------------------------------
// BullMQ queues (only instantiated when Redis is available)
// ---------------------------------------------------------------------------
let synthesisQueue = null;
let masterclassQueue = null;

if (redisAvailable) {
    const { Queue } = await import("bullmq");
    const { SYNTHESIS_QUEUE_NAME } = await import("../workers/synthesis.worker.js");
    const { MASTERCLASS_QUEUE_NAME } = await import("../workers/masterclass.worker.js");

    synthesisQueue = new Queue(SYNTHESIS_QUEUE_NAME, {
        connection: redisOpts,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        },
    });

    masterclassQueue = new Queue(MASTERCLASS_QUEUE_NAME, {
        connection: redisOpts,
        defaultJobOptions: {
            attempts: 2,
            backoff: { type: "fixed", delay: 10000 },
            removeOnComplete: { count: 50 },
            removeOnFail: { count: 25 },
        },
    });

    console.log("[JobQueue] BullMQ queues ready (synthesis, masterclass)");
}

// ---------------------------------------------------------------------------
// In-process fallback registry (used when Redis unavailable)
// ---------------------------------------------------------------------------
const fallbackRegistry = new Map();

const setFallbackJob = (id, status, meta = {}) =>
    fallbackRegistry.set(id, { id, status, updatedAt: Date.now(), ...meta });

export const getJobStatus = async (jobId) => {
    if (synthesisQueue) {
        // Try synthesis queue first, then masterclass
        let job = await synthesisQueue.getJob(jobId).catch(() => null);
        if (!job) job = await masterclassQueue.getJob(jobId).catch(() => null);
        if (!job) return { id: jobId, status: "UNKNOWN" };
        const state = await job.getState();
        return { id: jobId, status: state.toUpperCase(), progress: job.progress };
    }
    return fallbackRegistry.get(jobId) ?? { id: jobId, status: "UNKNOWN" };
};

// ---------------------------------------------------------------------------
// In-process synthesis fallback
// ---------------------------------------------------------------------------
const runSynthesisInProcess = async ({ topicId, topicTitle, courseName, instructions }) => {
    const { default: pool } = await import("../config/db.js");
    const { callAI } = await import("./aiClient.js");
    const {
        PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT,
        PROFESSOR_THEORY_DEEP_PROMPT, PROFESSOR_PROGRAMMING_DEEP_PROMPT,
    } = await import("./aiRules.js");

    const isProgramming = /java|python|c\+\+|js|javascript|web|react|node|programming|frontend|backend/i.test(courseName);
    let easyPrompt, deepPrompt;

    if (isProgramming) {
        const language = courseName.match(/java|python|c\+\+|js|javascript|web|react|node/i)?.[0] || "Code";
        easyPrompt = PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT
            .replace("{topic}", topicTitle).replace("{language}", language)
            .replace("{level}", "Intermediate").replace("{custom_instructions}", instructions);
        deepPrompt = PROFESSOR_PROGRAMMING_DEEP_PROMPT
            .replace("{topic}", topicTitle).replace("{language}", language)
            .replace("{custom_instructions}", instructions);
    } else {
        easyPrompt = PROFESSOR_THEORY_SYNTHESIS_PROMPT
            .replace("{topic}", topicTitle).replace("{course}", courseName)
            .replace("{level}", "Intermediate").replace("{custom_instructions}", instructions);
        deepPrompt = PROFESSOR_THEORY_DEEP_PROMPT
            .replace("{topic}", topicTitle).replace("{course}", courseName)
            .replace("{custom_instructions}", instructions);
    }

    const [easyResult, deepResult] = await Promise.allSettled([
        callAI({ system: easyPrompt, user: `Generate content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
        callAI({ system: deepPrompt, user: `Generate deep content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
    ]);

    if (easyResult.status !== "fulfilled" || !easyResult.value || easyResult.value.error) {
        throw new Error(easyResult.reason?.message || "Easy synthesis failed");
    }

    const aiData = easyResult.value;
    const deepData = (deepResult.status === "fulfilled" && deepResult.value && !deepResult.value.error)
        ? deepResult.value : { content_deep_markdown: null };
    const easyContent = aiData.content_easy_markdown || aiData.content_markdown;

    await pool.query(`
        UPDATE topics SET
            breadcrumb_path=$1, difficulty=$2, estimated_time=$3, learning_objectives=$4,
            historical_context=$5, first_principles=$6, structural_breakdown=$7, deep_dive=$8,
            applied_practice=$9, failure_analysis=$10, production_standard=$11,
            scholarly_references=$12, staff_engineer_note=$13, content_markdown=$14,
            content_easy_markdown=$15, content_deep_markdown=$16, updated_at=CURRENT_TIMESTAMP
        WHERE id=$17
    `, [
        aiData.breadcrumb_path, aiData.difficulty, aiData.estimated_time,
        JSON.stringify(aiData.learning_objectives), aiData.historical_context,
        aiData.first_principles, aiData.structural_breakdown,
        JSON.stringify(aiData.deep_dive), JSON.stringify(aiData.applied_practice),
        aiData.failure_analysis, JSON.stringify(aiData.production_standard),
        JSON.stringify(aiData.scholarly_references), aiData.staff_engineer_note,
        easyContent, easyContent, deepData.content_deep_markdown, topicId,
    ]);
};

// ---------------------------------------------------------------------------
// In-process masterclass fallback
// ---------------------------------------------------------------------------
const runMasterclassInProcess = async ({ title, theme, partNumber, userId }) => {
    const { default: pool } = await import("../config/db.js");
    const { callAI } = await import("./aiClient.js");
    const { MASTERCLASS_EPISODE_PROMPT } = await import("./aiRules.js");

    const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const userName = userRes.rows[0]?.name?.split(" ")[0] || "Student";

    const totalChapters = 12;
    let allSegments = [];
    let previousContext = "The intro hook: Challenge the status quo of modern education.";

    for (let i = 1; i <= totalChapters; i++) {
        const prompt = MASTERCLASS_EPISODE_PROMPT
            .replace(/{title}/g, title).replace(/{theme}/g, theme)
            .replace(/{chapter_index}/g, i).replace(/{total_chapters}/g, totalChapters)
            .replace(/{previous_context}/g, previousContext).replace(/{USER_NAME}/g, userName);

        const aiData = await callAI(prompt, true, 3072);
        if (aiData?.segments?.length > 0) {
            allSegments = [...allSegments, ...aiData.segments.map(s => ({
                ...s, text: s.text.replace(/{USER_NAME}/g, userName),
            }))];
            previousContext = aiData.next_chapter_hook || `Chapter ${i + 1} transition.`;
        }
    }

    await pool.query(
        "INSERT INTO masterclass_episodes (title, summary, segments, part_number) VALUES ($1, $2, $3, $4)",
        [title, `Full 1-Hour Mastery: ${theme}`, JSON.stringify(allSegments), partNumber]
    );
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const enqueueSynthesisJob = async (data) => {
    if (synthesisQueue) {
        const job = await synthesisQueue.add("synthesize-topic", data, { jobId: randomUUID() });
        console.log(`[JobQueue] Synthesis job ${job.id} enqueued for: ${data.topicTitle}`);
        return job.id;
    }

    // In-process fallback
    const jobId = randomUUID();
    setFallbackJob(jobId, "PROCESSING", { topicId: data.topicId, topicTitle: data.topicTitle });
    (async () => {
        try {
            await runSynthesisInProcess(data);
            setFallbackJob(jobId, "DONE");
            console.log(`[JobQueue:Fallback] Synthesis done — ${data.topicTitle}`);
        } catch (err) {
            setFallbackJob(jobId, "FAILED", { error: err.message });
            console.error(`[JobQueue:Fallback] Synthesis failed — ${err.message}`);
        }
    })();
    return jobId;
};

export const enqueueMasterclassJob = async (data) => {
    if (masterclassQueue) {
        const job = await masterclassQueue.add("generate-masterclass", data, {
            jobId: randomUUID(),
            timeout: 20 * 60 * 1000, // 20-minute hard timeout for 12-chapter loop
        });
        console.log(`[JobQueue] Masterclass job ${job.id} enqueued: "${data.title}"`);
        return job.id;
    }

    // In-process fallback
    const jobId = randomUUID();
    setFallbackJob(jobId, "PROCESSING", { title: data.title });
    (async () => {
        try {
            await runMasterclassInProcess(data);
            setFallbackJob(jobId, "DONE");
            console.log(`[JobQueue:Fallback] Masterclass done — "${data.title}"`);
        } catch (err) {
            setFallbackJob(jobId, "FAILED", { error: err.message });
            console.error(`[JobQueue:Fallback] Masterclass failed — ${err.message}`);
        }
    })();
    return jobId;
};
