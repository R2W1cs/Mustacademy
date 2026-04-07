/**
 * synthesis.worker.js
 * BullMQ worker that processes topic synthesis jobs in the background.
 * Runs parallel easy+deep AI calls and persists results to the DB.
 */
import { Worker } from "bullmq";
import { redisOpts } from "../config/redis.js";
import pool from "../config/db.js";
import { callAI } from "../utils/aiClient.js";
import {
    PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT,
    PROFESSOR_THEORY_DEEP_PROMPT, PROFESSOR_PROGRAMMING_DEEP_PROMPT,
} from "../utils/aiRules.js";

export const SYNTHESIS_QUEUE_NAME = "synthesis";

const processSynthesis = async (job) => {
    const { topicId, topicTitle, courseName, instructions } = job.data;
    console.log(`[SynthesisWorker] Processing job ${job.id} — ${topicTitle}`);

    const isProgramming = /java|python|c\+\+|js|javascript|web|react|node|programming|frontend|backend/i.test(courseName);
    let easyPrompt, deepPrompt;

    if (isProgramming) {
        const language = courseName.match(/java|python|c\+\+|js|javascript|web|react|node/i)?.[0] || "Code";
        easyPrompt = PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT
            .replace("{topic}", topicTitle)
            .replace("{language}", language)
            .replace("{level}", "Intermediate")
            .replace("{custom_instructions}", instructions);
        deepPrompt = PROFESSOR_PROGRAMMING_DEEP_PROMPT
            .replace("{topic}", topicTitle)
            .replace("{language}", language)
            .replace("{custom_instructions}", instructions);
    } else {
        easyPrompt = PROFESSOR_THEORY_SYNTHESIS_PROMPT
            .replace("{topic}", topicTitle)
            .replace("{course}", courseName)
            .replace("{level}", "Intermediate")
            .replace("{custom_instructions}", instructions);
        deepPrompt = PROFESSOR_THEORY_DEEP_PROMPT
            .replace("{topic}", topicTitle)
            .replace("{course}", courseName)
            .replace("{custom_instructions}", instructions);
    }

    const [easyResult, deepResult] = await Promise.allSettled([
        callAI({ system: easyPrompt, user: `Generate content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
        callAI({ system: deepPrompt, user: `Generate deep content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
    ]);

    if (easyResult.status !== "fulfilled" || !easyResult.value || easyResult.value.error) {
        const msg = easyResult.reason?.message || easyResult.value?.error || "Unknown error";
        throw new Error(`Easy synthesis failed: ${msg}`);
    }

    const aiData = easyResult.value;
    const deepData = (deepResult.status === "fulfilled" && deepResult.value && !deepResult.value.error)
        ? deepResult.value
        : { content_deep_markdown: null };

    const easyContent = aiData.content_easy_markdown || aiData.content_markdown;
    const deepContent = deepData.content_deep_markdown;

    await pool.query(`
        UPDATE topics
        SET
            breadcrumb_path = $1, difficulty = $2, estimated_time = $3,
            learning_objectives = $4, historical_context = $5, first_principles = $6,
            structural_breakdown = $7, deep_dive = $8, applied_practice = $9,
            failure_analysis = $10, production_standard = $11, scholarly_references = $12,
            staff_engineer_note = $13, content_markdown = $14, content_easy_markdown = $15,
            content_deep_markdown = $16, updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
    `, [
        aiData.breadcrumb_path,
        aiData.difficulty,
        aiData.estimated_time,
        JSON.stringify(aiData.learning_objectives),
        aiData.historical_context,
        aiData.first_principles,
        aiData.structural_breakdown,
        JSON.stringify(aiData.deep_dive),
        JSON.stringify(aiData.applied_practice),
        aiData.failure_analysis,
        JSON.stringify(aiData.production_standard),
        JSON.stringify(aiData.scholarly_references),
        aiData.staff_engineer_note,
        easyContent,
        easyContent,
        deepContent,
        topicId,
    ]);

    console.log(`[SynthesisWorker] Job ${job.id} complete — ${topicTitle}`);
    return { topicId, topicTitle, deepSaved: !!deepContent };
};

export const startSynthesisWorker = () => {
    if (!redisOpts) return null;

    const worker = new Worker(SYNTHESIS_QUEUE_NAME, processSynthesis, {
        connection: redisOpts,
        concurrency: 2, // Two synthesis jobs can run simultaneously
    });

    worker.on("completed", (job, result) => {
        console.log(`[SynthesisWorker] ✓ ${job.id} — ${result.topicTitle}`);
    });
    worker.on("failed", (job, err) => {
        console.error(`[SynthesisWorker] ✗ ${job?.id} — ${err.message}`);
    });

    console.log("[SynthesisWorker] Started (concurrency: 2)");
    return worker;
};
