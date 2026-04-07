/**
 * synthesis.controller.js
 * Handles topic synthesis, exercises, and project analysis.
 * Extracted from ai.controller.js for single-responsibility and testability.
 */
import pool from "../config/db.js";
import { cacheGet, cacheSet, cacheKey } from "../utils/aiCache.js";
import { callAI, callFastAI } from "../utils/aiClient.js";
import {
    PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT,
    PROFESSOR_THEORY_DEEP_PROMPT, PROFESSOR_PROGRAMMING_DEEP_PROMPT,
} from "../utils/aiRules.js";

export const synthesizeTopic = async (req, res) => {
    const { topicId, customInstruction } = req.body;
    if (!topicId) return res.status(400).json({ message: "Topic ID required" });

    const instructions = customInstruction || "None provided. Use standard academic rigor.";

    try {
        const topicRes = await pool.query(`
            SELECT t.title, c.name as course_name
            FROM topics t JOIN courses c ON t.course_id = c.id WHERE t.id = $1
        `, [topicId]);

        if (topicRes.rows.length === 0) return res.status(404).json({ message: "Topic not found" });
        const { title: topicTitle, course_name: courseName } = topicRes.rows[0];

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

        console.log(`[AI] Synthesizing EASY + DEEP in parallel for: ${topicTitle}...`);
        const [easyResult, deepResult] = await Promise.allSettled([
            callAI({ system: easyPrompt, user: `Generate content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
            callAI({ system: deepPrompt, user: `Generate deep content for topic: ${topicTitle}, course: ${courseName}` }, true, 6144),
        ]);

        if (easyResult.status !== 'fulfilled' || !easyResult.value || easyResult.value.error) {
            const errMsg = easyResult.reason?.message || easyResult.value?.error || 'Unknown error';
            console.error(`[AI] Easy synthesis failed for ${topicTitle}:`, errMsg);
            return res.status(503).json({ message: "Synthesis service is temporarily recalibrating.", error: errMsg });
        }

        const aiData = easyResult.value;
        const deepData = (deepResult.status === 'fulfilled' && deepResult.value && !deepResult.value.error)
            ? deepResult.value
            : { content_deep_markdown: null };

        const easyContent = aiData.content_easy_markdown || aiData.content_markdown;
        const deepContent = deepData.content_deep_markdown;

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
            easyContent, easyContent, deepContent, topicId,
        ]);

        res.json({ success: true, message: "Intelligence Synthesized", data: { ...aiData, content_deep_markdown: deepContent } });
    } catch (err) {
        console.error("Synthesis Error", err);
        res.status(500).json({ message: "Topic synthesis failed", error: err.message });
    }
};

export const generateTopicExercises = async (req, res) => {
    const { topicTitle, mcqCount = 3, shortAnswerCount = 2 } = req.body;
    if (!topicTitle) return res.status(400).json({ message: 'Topic title required' });

    const exCk = cacheKey('exercises', topicTitle, mcqCount, shortAnswerCount);
    const exCached = cacheGet(exCk);
    if (exCached) return res.json(exCached);

    const isComplexityTopic = /complexity|asymptotic|big o|recurrence/i.test(topicTitle);

    const challengePrompt = isComplexityTopic
        ? `Create a "Mathematical Rigor Challenge" involving:
           1. An asymptotic ordering problem (arranging 5-7 functions by growth rate).
           2. A limit-based comparison of two functions f(n) and g(n).
           3. A bounding problem where the student must find c and n0 for a given Big-O relation.
           Focus purely on the mathematical soul of the algorithm.`
        : `Create a "High-Fidelity Systems Case Study":
           Scenario: A 2-3 paragraph professional scenario involving "${topicTitle}" at scale.
           Task: 3-4 multi-stage technical deliverables.
           Solution Guide: A rubric of the correct trade-offs.`;

    const prompt = `You are a Senior CS Professor. Create a rigorous "Mastery Crucible" for the topic: "${topicTitle}".

Return EXCLUSIVELY a JSON object:
{
  "mcq": [{ "q": "...", "options": ["A)..","B)..","C)..","D).."], "answer": "A" }],
  "short_answer": [{ "q": "...", "hint": "...", "model_answer": "..." }],
  "challenge": { "title": "...", "scenario": "...", "task": "...", "solution_guide": "..." }
}

Create exactly ${mcqCount} MCQs and ${shortAnswerCount} short answers.
${challengePrompt}
Return ONLY the JSON.`;

    try {
        const aiData = await callAI(prompt, true, 2048);
        if (!aiData || (!aiData.mcq && !aiData.reply)) {
            throw new Error("AI returned malformed data.");
        }
        const result = {
            success: true,
            exercises: {
                mcq: aiData.mcq || [],
                short_answer: aiData.short_answer || [],
                challenge: aiData.challenge || {
                    title: "Topic Analysis",
                    scenario: aiData.reply || "Analyze the architectural implications.",
                    task: "Explain the primary trade-offs.",
                    solution_guide: "Focus on efficiency and scalability."
                }
            }
        };
        cacheSet(exCk, result, 20 * 60 * 1000);
        res.json(result);
    } catch (err) {
        console.error('[generateTopicExercises] Error:', err.message);
        res.status(500).json({ message: 'Exercise generation failed', error: err.message });
    }
};

export const verifyLibraryAnswer = async (req, res) => {
    const { topicTitle, question, studentAnswer, expectedAnswer } = req.body;
    if (!studentAnswer) return res.status(400).json({ message: "Answer required" });

    try {
        const prompt = `You are "DR. ARIS" (IQ 160).
A student answered a follow-up question on "${topicTitle}".

QUESTION: "${question}"
STUDENT'S ANSWER: "${studentAnswer}"
EXPECTED TECHNICAL CORE: "${expectedAnswer}"

Determine if the student understood the core concept. Return ONLY valid JSON:
{ "success": boolean, "feedback": "Your spoken response here." }`;

        const aiData = await callFastAI(prompt, true, 256);
        res.json({
            success: aiData.success ?? (aiData.reply?.toLowerCase().includes("correct") || false),
            feedback: aiData.feedback || aiData.reply || "Interesting synthesis. Let us continue."
        });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ success: false, feedback: "My synaptic link faltered. Try explaining that again." });
    }
};

export const analyzeProject = async (req, res) => {
    const { title, description, skills = [], memberCount = 1 } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title required' });

    const prompt = `You are a senior software architect reviewing a student project.

Project: "${title}"
Description: "${description || 'No description'}"
Required Skills: ${skills.length ? skills.join(', ') : 'Not specified'}
Team Size: ${memberCount}

Score 0-100 based on: clarity, technical feasibility, team vs complexity, real-world relevance.

Respond ONLY with this JSON:
{
  "verdict": "one sharp sentence about this project's real-world potential",
  "score": <integer 0-100>,
  "stack": ["tech1", "tech2", "tech3", "tech4"],
  "roles": [{"title": "Role Name", "reason": "why critical now"}],
  "sprints": [{"week": "Week 1-2", "goal": "deliverable"}],
  "risks": ["risk1", "risk2", "risk3"]
}`;

    try {
        const result = await callFastAI(prompt, true, 512);
        res.json({
            verdict: result.verdict || 'Analysis complete.',
            score: typeof result.score === 'number' ? result.score : 70,
            stack: Array.isArray(result.stack) ? result.stack : [],
            roles: Array.isArray(result.roles) ? result.roles : [],
            sprints: Array.isArray(result.sprints) ? result.sprints : [],
            risks: Array.isArray(result.risks) ? result.risks : []
        });
    } catch (err) {
        console.error('[analyzeProject] Error:', err.message);
        res.status(500).json({ message: 'Analysis failed', error: err.message });
    }
};
