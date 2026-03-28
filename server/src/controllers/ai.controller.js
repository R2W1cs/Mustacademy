import pool from "../config/db.js";
import { cacheGet, cacheSet, cacheKey } from "../utils/aiCache.js";

import { incrementStreak } from "../services/streak.service.js";
import {
    PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT,
    PROFESSOR_THEORY_DEEP_PROMPT, PROFESSOR_PROGRAMMING_DEEP_PROMPT,
    FILLER_PROMPT, PROFESSOR_LECTURE_PROMPT, ELITE_PLAN_PROMPT,
    BOARDROOM_SYSTEM_PROMPT, SCORECARD_PROMPT, INTERVIEW_MODE_CONTEXTS, RIGOROUS_QUIZ_PROMPT,
    PROFESSOR_IQ_160_PROMPT, MASTERCLASS_EPISODE_PROMPT, ULTIMATE_PODCAST_PROMPT
} from "../utils/aiRules.js";
import { getNextPhase, updateInterviewSession, startInterviewSession } from "../services/interview.service.js";
import { callOllama, callGroq, callAI, repairJson, streamAI, groq } from "../utils/aiClient.js";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { Communicate } from 'edge-tts-universal';
import path from 'path';
import fs from 'fs';

// In-memory cache for frequently requested TTS segments
const ttsCache = new Map();

// --- KNOWLEDGE BASE HELPER ---
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'src', 'knowledge_base');

const getKnowledgeBaseContent = (topicTitle) => {
    if (!topicTitle) return null;
    try {
        // Precise filename matching
        const fileName = `${topicTitle}.md`;
        const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);
        
        if (fs.existsSync(filePath)) {
            console.log(`[Knowledge Base] Hit: ${topicTitle}`);
            return fs.readFileSync(filePath, 'utf8');
        }
        
        // Fuzzy matching (if title contains special chars or is subset)
        const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);
        const match = files.find(f => f.toLowerCase().includes(topicTitle.toLowerCase()) || topicTitle.toLowerCase().includes(f.toLowerCase().replace('.md', '')));
        
        if (match) {
            console.log(`[Knowledge Base] Fuzzy Hit: ${match} for ${topicTitle}`);
            return fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, match), 'utf8');
        }
    } catch (err) {
        console.warn("[Knowledge Base] Error reading directory:", err.message);
    }
    return null;
};

// --- MOCK FALLBACK SYSTEM ---
// Integrated via aiClient.js

const sanitizeMermaid = (mermaidCode) => {
    if (!mermaidCode) return null;
    let code = mermaidCode.trim();

    // 1. Remove markdown fences if AI included them
    code = code.replace(/```(?:mermaid)?/g, '').trim();

    // 2. Fix unquoted labels containing parentheses: ID(Label with (parens)) -> ID["Label with (parens)"]
    // This is a common AI mistake
    code = code.replace(/(\w+)\(([^)]*\([^)]*\)[^)]*)\)/g, '$1["$2"]');

    // 3. Ensure any ID(Label) with spaces is ID["Label"]
    code = code.replace(/(\w+)\(([^)]+\s+[^)]+)\)/g, '$1["$2"]');

    return code;
};

// callOllama now handled by shared aiClient utility

// --- ROBUST CONTROLLER LOGIC ---

export const chatWithMentor = async (req, res) => {
    const { message, conversationId, topicId } = req.body;
    const userId = req.user.id;

    // Failsafe Wrapper
    try {
        if (!message) return res.status(400).json({ message: "Message required" });

        // 1. Attempt to get History & Context (Allowed to fail silently)
        let history = [];
        let context = "";
        let detectedTopic = null;
        let questionCount = 0;
        let shouldForceExercise = false;
        let scholarlyContext = "";

        try {
            const historyRes = await pool.query(
                "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'mentor' ORDER BY created_at DESC LIMIT 10",
                [userId]
            );
            history = historyRes.rows.reverse();

            if (topicId) {
                const topicRes = await pool.query(
                    "SELECT title, content_markdown as content FROM topics WHERE id = $1",
                    [topicId]
                );
                if (topicRes.rows.length > 0) {
                    context = `Context for ${topicRes.rows[0].title}: ${topicRes.rows[0].content}`;
                    detectedTopic = topicRes.rows[0].title;

                    // User-uploaded vault resources for this topic
                    const resourcesRes = await pool.query(
                        `SELECT title, file_type, extracted_text FROM topic_resources
                         WHERE topic_id = $1 AND user_id = $2 AND extracted_text IS NOT NULL
                         ORDER BY created_at DESC LIMIT 5`,
                        [topicId, userId]
                    );
                    if (resourcesRes.rows.length > 0) {
                        scholarlyContext = "\n\n--- STUDENT VAULT RESOURCES ---\n" +
                            resourcesRes.rows.map(r =>
                                `[${r.file_type.toUpperCase()}] ${r.title}:\n${r.extracted_text.slice(0, 4000)}`
                            ).join("\n\n---\n\n") +
                            "\n--- END VAULT RESOURCES ---\n" +
                            "\nCRITICAL: The student has uploaded these resources. Use them as authoritative context. When answering, reference these materials by name.";
                    }
                }
            } else {
                const topicRes = await pool.query(
                    "SELECT title, content_markdown as content FROM topics WHERE $1 ILIKE '%' || title || '%' AND content_markdown IS NOT NULL LIMIT 1",
                    [message]
                );
                if (topicRes.rows.length > 0) {
                    context = `Context for ${topicRes.rows[0].title}: ${topicRes.rows[0].content}`;
                    detectedTopic = topicRes.rows[0].title;
                }
            }

            if (detectedTopic) {
                const recentMessages = history.filter(h => h.role === 'user').slice(-5);
                questionCount = recentMessages.filter(h =>
                    h.message.toLowerCase().includes(detectedTopic.toLowerCase())
                ).length;

                if (questionCount >= 4) {
                    shouldForceExercise = true;
                }
            }
        } catch (dbErr) {
            console.warn("AI DB Context Error (Recoverable):", dbErr.message);
        }

        // 1.5. Check High-Fidelity Knowledge Base
        const kbContent = getKnowledgeBaseContent(detectedTopic);
        if (kbContent) {
            context = `--- HIGH-FIDELITY ARCHITECTURAL KNOWLEDGE BASE ---\n${kbContent}\n--- END KNOWLEDGE BASE ---`;
            console.log(`[Dr. Nova] Using premium KB context for ${detectedTopic}`);
        }

        // 2. Determine Complexity & Prepare Prompt
        const isComplex = message.length > 30 || /explain|how|why|deep dive|protocol|architecture|design|breakdown|curriculum|technical|system|masterclass/i.test(message);
        let dynamicInstruction = isComplex
            ? "\n\n--- MANDATORY INSTRUCTION: The 'reply' field MUST contain the FULL lesson text (800+ words minimum). It MUST include ALL THREE: ① An algo-viz block — the opening fence MUST be written as three backticks followed by algo-viz (NOT json, NOT javascript, NOT mermaid — the tag must be algo-viz). JSON inside: {\"type\":\"bfs\",\"nodes\":[...],\"edges\":[...],\"steps\":[{\"highlight_nodes\":[],\"visited\":[],\"queue\":[],\"description\":\"\"}]}. ② Complete runnable JavaScript code (30+ lines) with console.log() output AND __step__(label, state) calls. ③ A markdown complexity table. Write directly in reply field. ---"
            : "\n\n--- INSTRUCTION: Provide a concise but technically precise response in the reply field. ---";

        if (kbContent) {
            dynamicInstruction += "\n\nCRITICAL: A verified High-Fidelity Knowledge Base entry has been provided in the context. You MUST base your explanation ON THIS CONTENT. Use the terms, diagrams, and axioms defined in the KB. Specifically, you MUST perform a line-by-line technical autopsy of any code provided and walk through the iteration simulation step-by-step. Do not deviate from the technical truth provided.";
        }

        const historyText = history.map(h => `${h.role === 'user' ? 'Student' : 'Dr. Nova'}: ${h.message}`).join("\n");
        const forceExerciseInstruction = shouldForceExercise 
            ? "\n\nCRITICAL: The student has asked many questions on this. You MUST assign a mission now using the 'mission' field in your JSON response."
            : "";

        const systemPrompt = PROFESSOR_IQ_160_PROMPT
            .replace('{context}', (context + scholarlyContext) || "No specific topic context found.")
            .replace('{history}', historyText || "No previous history.")
            + dynamicInstruction
            + (forceExerciseInstruction || '');

        // 3. Call AI (Will return Mock if fails)
        const aiData = await callAI(systemPrompt + `\n\nStudent: ${message}`);

        // 4. Attempt to Save History (Allowed to fail silently)
        try {
            await pool.query(
                "INSERT INTO chat_messages (user_id, chat_type, role, message, conversation_id) VALUES ($1, 'mentor', 'user', $2, $3)",
                [userId, message, conversationId]
            );
            await pool.query(
                "INSERT INTO chat_messages (user_id, chat_type, role, message, conversation_id) VALUES ($1, 'mentor', 'assistant', $2, $3)",
                [userId, aiData.reply, conversationId]
            );
        } catch (dbSaveErr) {
            console.warn("AI DB Save Error (Recoverable):", dbSaveErr.message);
        }

        // 5. Handle Mission Creation (Allowed to fail silently)
        let goal = null;
        if (aiData.mission) {
            try {
                const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
                const goalRes = await pool.query(
                    "INSERT INTO daily_goals (user_id, description, deadline) VALUES ($1, $2, $3) RETURNING *",
                    [userId, aiData.mission, deadline]
                );
                goal = goalRes.rows[0];
            } catch (goalErr) {
                console.warn("AI Goal Save Error (Recoverable):", goalErr.message);
            }
        }

        res.json({
            reply: aiData.reply,
            goal: goal,
            suggested_questions: aiData.suggested_questions || []
        });

    } catch (criticalErr) {
        console.error("CRITICAL AI CONTROLLER ERROR:", criticalErr);
        // Absolute final fallback if even the try block logic crashes
        res.json({
            reply: "âš ï¸ [SYSTEM OFFLINE] " + getMockResponse('mentor'),
            goal: null
        });
    }
};

export const chatWithMentorStream = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    try {
        if (!message) return res.status(400).json({ message: "Message required" });

        // 1. Save User History immediately (to allow instant UI refresh)
        try {
            await pool.query(
                "INSERT INTO chat_messages (user_id, chat_type, role, message, conversation_id) VALUES ($1, 'mentor', 'user', $2, $3)",
                [userId, message, conversationId]
            );
        } catch (dbErr) {
            console.warn("[Stream AI] User Message Save Error:", dbErr.message);
        }

        // 1.5. Check High-Fidelity Knowledge Base & Context
        let context = "";
        let detectedTopic = null;
        try {
            const topicRes = await pool.query(
                "SELECT title FROM topics WHERE $1 ILIKE '%' || title || '%' AND (content_markdown IS NOT NULL OR content IS NOT NULL) LIMIT 1",
                [message]
            );
            if (topicRes.rows.length > 0) {
                detectedTopic = topicRes.rows[0].title;
            }
        } catch (dbErr) {
            console.warn("[Stream AI] Topic Detection Error:", dbErr.message);
        }

        const kbContent = getKnowledgeBaseContent(detectedTopic);
        if (kbContent) {
            context = `--- HIGH-FIDELITY ARCHITECTURAL KNOWLEDGE BASE ---\n${kbContent}\n--- END KNOWLEDGE BASE ---`;
            console.log(`[Stream AI] Using premium KB context for ${detectedTopic}`);
        }

        // Header for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 2. Prepare Prompt (Simple version for streaming)
        const isComplex = message.length > 50 || /explain|how|why|deep dive|protocol|architecture|design/i.test(message);
        let dynamicInstruction = isComplex
            ? "\n--- INSTRUCTION: Use the FULL Professor's Method for this deep query. ---"
            : "\n--- INSTRUCTION: Provide a CONCISE, brilliant response. Skip the 9-point lecture structure. ---";

        if (kbContent) {
            dynamicInstruction += "\n\nCRITICAL: A verified High-Fidelity Knowledge Base entry has been provided in the context. You MUST base your explanation ON THIS CONTENT. Use the terms, diagrams, and axioms defined in the KB. Specifically, you MUST perform a line-by-line technical autopsy of any code provided and walk through the iteration simulation step-by-step. Do not deviate from the technical truth provided.";
        }

        let systemPrompt = PROFESSOR_IQ_160_PROMPT
            .replace('{context}', (context || "Streaming session active."))
            .replace('{history}', "Real-time protocol engaged.")
            + dynamicInstruction;

        // For streaming, we MUST strip out the JSON requirement otherwise the UI gets raw JSON brackets
        const jsonCutoff = systemPrompt.indexOf("Return ONLY VALID JSON");
        if (jsonCutoff !== -1) {
            systemPrompt = systemPrompt.substring(0, jsonCutoff);
        }

        systemPrompt += "\n\nCRITICAL OVERRIDE FOR THIS SESSION: You are streaming directly to a chat UI. Do NOT output any JSON brackets, fields like 'reply', or surrounding formatting. Output ONLY your direct spoken reply in raw markdown (bolding, lists, code blocks allowed).";

        // 3. Start Stream
        const stream = await streamAI(systemPrompt + `\n\nStudent: ${message}`);

        let fullContent = "";

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullContent += content;
                // SSE format: data: {content} \n\n
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        // 4. Save Assistant History after stream ends
        try {
            await pool.query(
                "INSERT INTO chat_messages (user_id, chat_type, role, message, conversation_id) VALUES ($1, 'mentor', 'assistant', $2, $3)",
                [userId, fullContent, conversationId]
            );
        } catch (dbErr) {
            console.warn("[Stream AI] Assistant Message Save Error:", dbErr.message);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (err) {
        console.error("[Stream AI] Controller Error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
};

export const getChatHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            "SELECT role, message, created_at, conversation_id FROM chat_messages WHERE user_id = $1 AND chat_type = 'mentor' ORDER BY created_at ASC LIMIT 100",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.warn("Failed to fetch mentor history", err);
        res.json([]);
    }
};

export const getChatSessions = async (req, res) => {
    const userId = req.user.id;
    try {
        // Get unique conversation IDs with their FIRST user message as the "title/concept"
        const result = await pool.query(`
            SELECT DISTINCT ON (conversation_id)
                conversation_id,
                message as title,
                created_at
            FROM chat_messages
            WHERE user_id = $1 AND chat_type = 'mentor' AND conversation_id IS NOT NULL AND role = 'user'
            ORDER BY conversation_id, created_at ASC
        `, [userId]);

        // Sort sessions by most recent
        const sessions = result.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(sessions);
    } catch (err) {
        console.warn("Failed to fetch chat sessions", err);
        res.json([]);
    }
};

export const getSessionMessages = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;
    try {
        const result = await pool.query(
            "SELECT role, message, created_at FROM chat_messages WHERE user_id = $1 AND conversation_id = $2 ORDER BY created_at ASC",
            [userId, conversationId]
        );
        res.json(result.rows);
    } catch (err) {
        console.warn("Failed to fetch session messages", err);
        res.json([]);
    }
};




export const submitWork = async (req, res) => {
    const userId = req.user.id;
    const { goalId, submissionText } = req.body;
    if (!goalId || !submissionText) return res.status(400).json({ message: "Goal ID and submission text are required" });
    try {
        const goalResult = await pool.query("SELECT description FROM daily_goals WHERE id = $1 AND user_id = $2", [goalId, userId]);
        if (goalResult.rows.length === 0) return res.status(404).json({ message: "Goal not found" });
        const goalDescription = goalResult.rows[0].description;
        const prompt = `You are a strict and critical AI Grader.
Goal: "${goalDescription}"
Student's Work: "${submissionText}"
Instructions:
1. Criteria: Accuracy, Depth, and Clarity.
2. If work is nonsensical/empty -> Grade 0.
3. If partial -> Grade fairly (0-100).
4. Feedback: Be direct. Max 2 sentences.

Return ONLY VALID JSON (RFC8259):
- Use DOUBLE QUOTES for all keys.
Example:
{
    "grade": 85,
    "feedback": "Excellent use of recursion, but consider edge cases."
}`;
        const aiData = await callAI(prompt);



        const result = await pool.query(
            `INSERT INTO goal_submissions (goal_id, user_id, submission_text, ai_grade, ai_feedback)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [goalId, userId, submissionText, aiData.grade, aiData.feedback]
        );
        await pool.query("UPDATE daily_goals SET is_completed = true WHERE id = $1", [goalId]);

        // --- STREAK SYSTEM (Strict Mode: Mission Goal based) ---
        let newStreak = null;
        if (aiData.grade >= 60) {
            newStreak = await incrementStreak(userId);
        }

        res.json({
            ...result.rows[0],
            newStreak

        });
    } catch (err) {
        res.status(500).json({ message: "AI Grading failed", error: err.message });
    }
};

export const getGoals = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT g.*, s.ai_grade, s.ai_feedback, s.submitted_at, s.submission_text
             FROM daily_goals g
             LEFT JOIN goal_submissions s ON g.id = s.goal_id
             WHERE g.user_id = $1
             ORDER BY g.is_completed ASC, g.created_at DESC LIMIT 10`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch goals" });
    }
};

export const completeGoal = async (req, res) => {
    const userId = req.user.id;
    const { goalId } = req.body;
    try {
        await pool.query("UPDATE daily_goals SET is_completed = true WHERE id = $1 AND user_id = $2", [goalId, userId]);
        res.json({ message: "Goal completed!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to complete goal" });
    }
};

export const createMission = async (req, res) => {
    const userId = req.user.id;
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: "Mission description required" });

    try {
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const result = await pool.query(
            "INSERT INTO daily_goals (user_id, description, deadline) VALUES ($1, $2, $3) RETURNING *",
            [userId, description, deadline]
        );
        res.json({ success: true, mission: result.rows[0] });
    } catch (err) {
        console.error("Create Mission Error:", err);
        res.status(500).json({ message: "Failed to assign mission" });
    }
};

export const generateQuiz = async (req, res) => {
    const userId = req.user.id;
    const { topic } = req.body;

    try {
        // Cache check — quizzes for same topic reuse within 15 min
        const ck = cacheKey('quiz', topic);
        const cached = cacheGet(ck);
        if (cached) {
            console.log(`[generateQuiz] Cache hit for "${topic}"`);
            return res.json(cached);
        }

        // --- STREAK SYSTEM ---
        await incrementStreak(userId).catch(e => console.warn("Streak increment failed:", e.message));
        // 1. Fetch Deep Context for Grounding
        const topicRes = await pool.query(
            `SELECT first_principles, learning_objectives, structural_breakdown, failure_analysis
             FROM topics WHERE title = $1 LIMIT 1`,
            [topic]
        );
        const topicData = topicRes.rows[0];

        let contextText = "No specific technical context found. Use internal CS knowledge.";
        if (topicData) {
            contextText = `
AXIOMS: ${topicData.first_principles}
OBJECTIVES: ${JSON.stringify(topicData.learning_objectives)}
STRUCTURE: ${topicData.structural_breakdown}
FAILURE VECTORS: ${topicData.failure_analysis}
`;
        }

        // 2. Prepare Rigorous Prompt
        const prompt = RIGOROUS_QUIZ_PROMPT
            .replace(/{topic}/g, topic || "Computer Science Mastery")
            .replace(/{context}/g, contextText);

        const aiData = await callAI(prompt);

        // 3. Validate AI Response and Harden
        if (!aiData || !Array.isArray(aiData.questions)) {
            console.warn("[AI] Invalid Quiz Format. Serving Fallback.");
            return res.json(getFallbackQuiz());
        }

        // Deep Filter: Ensure every question has options
        aiData.questions = aiData.questions.filter(q => Array.isArray(q.options) && q.options.length > 0);

        if (aiData.questions.length === 0) {
            console.warn("[AI] All synthesized questions lacked options. Serving Fallback.");
            return res.json(getFallbackQuiz());
        }

        cacheSet(ck, aiData, 15 * 60 * 1000); // 15 min TTL
        res.json(aiData);
    } catch (err) {
        console.error("Quiz Error", err);
        res.json({
            title: "System Recovery Quiz",
            questions: [
                { id: 1, text: "The AI service is currently unavailable. What should you do?", options: ["Panic", "Retry Later", "Write Assembly", "Sleep"], correctIndex: 1, explanation: "Systems sometimes need a moment." }
            ]
        });
    }
};

const getFallbackQuiz = () => ({
    title: "Emergency Backup Protocol: CS Fundamentals",
    questions: [
        {
            id: 1,
            text: "What is the time complexity of binary search on a sorted array?",
            options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            correctIndex: 1,
            explanation: "Binary search divides the search space in half with each step."
        },
        {
            id: 2,
            text: "Which data structure uses LIFO (Last In, First Out) ordering?",
            options: ["Queue", "Linked List", "Stack", "Tree"],
            correctIndex: 2,
            explanation: "A Stack pushes and pops from the top, following LIFO."
        }
    ]
});

export const submitQuiz = async (req, res) => {
    const userId = req.user.id;
    const { score, total, topic } = req.body; // score is percentage or raw count? Let's assume percentage 0-100

    try {
        // --- STREAK SYSTEM ---
        const newStreak = await incrementStreak(userId).catch(e => {
            console.warn("Streak increment failed:", e.message);
            return null;
        });

        res.json({
            success: true,
            newStreak

        });

    } catch (err) {
        res.status(500).json({ message: "Quiz submission failed", error: err.message });
    }
};

export const generateDailyPlan = async (req, res) => {
    const userId = req.user.id;
    const { hours, technique } = req.body; // hours: number, technique: 'pomodoro', 'deep', 'flow'

    try {
        console.log(`[DailyPlan] Generating for userId: ${userId} (${typeof userId})`);

        // 1. Check existing plan for today
        const today = new Date().toISOString().split('T')[0];
        const existingPlan = await pool.query(
            "SELECT * FROM daily_plans WHERE user_id::text = $1::text AND date = $2",
            [userId, today]
        );

        if (existingPlan.rows.length > 0) {
            return res.json(existingPlan.rows[0]);
        }

        // 2. Get User Context (Semester, Performance & Missions)
        let performanceContext = "No recent performance data.";
        let pendingMissions = "No pending missions.";
        let currentTopic = "Computer Science Fundamentals";
        let semesterTopics = "N/A";
        let userYear = 1;
        let userSemester = 1;

        try {
            // Get user's academic profile for context
            const userRes = await pool.query("SELECT year, semester FROM users WHERE id = $1", [userId]);
            userYear = userRes.rows[0]?.year || 1;
            userSemester = userRes.rows[0]?.semester || 1;

            // Get all topics for the current year/semester to guide the AI
            const topicsRes = await pool.query(`
                SELECT c.name as course_name, t.title as topic_title
                FROM topics t
                JOIN courses c ON t.course_id = c.id
                JOIN semesters s ON c.semester_id = s.id
                WHERE s.year_number = $1 AND s.semester_number = $2
                ORDER BY c.name, t.title
            `, [userYear, userSemester]);

            if (topicsRes.rows.length > 0) {
                const grouped = topicsRes.rows.reduce((acc, row) => {
                    if (!acc[row.course_name]) acc[row.course_name] = [];
                    if (acc[row.course_name].length < 5) { // Limit topics per course
                        acc[row.course_name].push(row.topic_title);
                    }
                    return acc;
                }, {});

                semesterTopics = Object.entries(grouped)
                    .map(([course, topics]) => `[${course}]: ${topics.join(", ")}`)
                    .join("\n");
            }

            // Fetch recent grades (< 80% prioritized)
            const gradesRes = await pool.query(`
                SELECT s.ai_grade, s.ai_feedback, g.description as mission
                FROM goal_submissions s
                JOIN daily_goals g ON s.goal_id = g.id
                WHERE s.user_id::text = $1::text
                ORDER BY s.submitted_at DESC LIMIT 5
            `, [userId]);

            if (gradesRes.rows.length > 0) {
                performanceContext = gradesRes.rows
                    .map(r => `Mission: "${r.mission}" | Grade: ${r.ai_grade}% | Feedback: ${r.ai_feedback}`)
                    .join("\n");
            }

            // Fetch pending missions
            const missionsRes = await pool.query(`
                SELECT description, deadline
                FROM daily_goals
                WHERE user_id::text = $1::text AND is_completed = false
                ORDER BY deadline ASC LIMIT 3
            `, [userId]);

            if (missionsRes.rows.length > 0) {
                pendingMissions = missionsRes.rows
                    .map(r => `- ${r.description} (Due: ${new Date(r.deadline).toLocaleDateString()})`)
                    .join("\n");
            }

            // Fetch current topic
            const progressRes = await pool.query(`
                SELECT t.title
                FROM user_topic_progress p
                JOIN topics t ON p.topic_id = t.id
                WHERE p.user_id::text = $1::text
                ORDER BY p.updated_at DESC LIMIT 1
            `, [userId]);

            if (progressRes.rows.length > 0) {
                currentTopic = progressRes.rows[0].title;
            }
        } catch (ctxErr) {
            console.warn("[DailyPlan] Rich Context Error:", ctxErr.message);
        }

        // 3. Construct Elite Prompt
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const currentDate = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const semesterContext = `Year ${userYear}, Semester ${userSemester} (Current Focus)`;

        const systemPrompt = ELITE_PLAN_PROMPT
            .replace('{semesterContext}', semesterContext)
            .replace('{currentTime}', currentTime)
            .replace('{currentDate}', currentDate)
            .replace('{currentTopic}', currentTopic)
            .replace('{semesterTopics}', semesterTopics)
            .replace('{performanceContext}', performanceContext)
            .replace('{pendingMissions}', pendingMissions)
            .replace('{hours}', hours || 4)
            .replace('{technique}', technique || 'pomodoro');

        // 4. Call AI (with fallback)
        let schedule = null;
        try {
            const aiData = await callAI(systemPrompt);
            schedule = aiData.schedule;
        } catch (aiError) {
            console.warn("[DailyPlan] AI Service Error. Using Fallback Schedule.", aiError.message);
        }

        // 5. Build Schedule (AI or Fallback)
        if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
            schedule = [
                { time: "09:00", action: "Review Phase 1 Foundations", duration: 25, type: "work", micro_reason: "Initial system sync.", non_negotiable: true },
                { time: "09:25", action: "Cognitive Reset", duration: 5, type: "break" }
            ];
        }

        const result = await pool.query(
            "INSERT INTO daily_plans (user_id, date, technique, schedule) VALUES ($1::text, $2, $3, $4) ON CONFLICT (user_id, date) DO UPDATE SET schedule = EXCLUDED.schedule RETURNING *",
            [userId, today, technique || 'pomodoro', JSON.stringify(schedule)]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Daily Plan Error:", err);
        res.status(500).json({ message: "Failed to generate plan.", error: err.message });
    }
};

export const completeSession = async (req, res) => {
    const userId = req.user.id;
    const { blockIndex } = req.body;
    const today = new Date().toISOString().split('T')[0];

    try {
        const planRes = await pool.query(
            "SELECT id, schedule FROM daily_plans WHERE user_id::text = $1::text AND date = $2",
            [userId, today]
        );

        if (planRes.rows.length === 0) return res.status(404).json({ message: "No plan found for today" });

        const plan = planRes.rows[0];
        const schedule = plan.schedule;

        if (schedule[blockIndex]) {
            schedule[blockIndex].completed_at = new Date().toISOString();
            schedule[blockIndex].status = 'completed';

            // Slight Adjustment Logic: If this was a 'work' block, maybe tighten the next break or session?
            // For now, we just mark it.
            if (schedule[blockIndex].type === 'work') {
                await incrementStreak(userId).catch(e => console.warn("Streak increment failed:", e.message));
            }
        }

        await pool.query(
            "UPDATE daily_plans SET schedule = $1 WHERE id = $2",
            [JSON.stringify(schedule), plan.id]
        );

        res.json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ message: "Failed to complete session", error: err.message });
    }
};

export const getDailyPlan = async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = await pool.query(
            "SELECT * FROM daily_plans WHERE user_id::text = $1::text AND date = $2",
            [userId, today]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch plan" });
    }
};

export const deleteDailyPlan = async (req, res) => {
    const userId = req.user.id;
    const { date } = req.params;

    try {
        await pool.query(
            "DELETE FROM daily_plans WHERE user_id::text = $1::text AND date = $2",
            [userId, date]
        );
        res.json({ message: "Plan deleted successfully" });
    } catch (err) {
        console.error("Delete Plan Error:", err);
        res.status(500).json({ message: "Failed to delete plan" });
    }
};

// --- INTERVIEW PREP SYSTEM ---

export const startInterview = async (req, res) => {
    const userId = req.user.id;
    const { targetJob, conversationId, mode = 'STANDARD' } = req.body;

    if (!targetJob || !conversationId) {
        return res.status(400).json({ message: "Target job and conversation ID required" });
    }

    try {
        await startInterviewSession(userId, conversationId, targetJob, mode);

        // Clear previous interview history for this user
        await pool.query("DELETE FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview'", [userId]);

        const modeContext = INTERVIEW_MODE_CONTEXTS[mode] || INTERVIEW_MODE_CONTEXTS.STANDARD;
        const systemPrompt = BOARDROOM_SYSTEM_PROMPT
            .replace('{target_job}', targetJob)
            .replace('{context}', `${modeContext}\n\nFirst contact. High-Stakes Simulation.`)
            .replace('{history}', "Simulation Initialized.");

        const aiData = await callAI(systemPrompt + `\n\nOrchestrator: The candidate has selected ${targetJob}. Mode: ${mode}. \n\nDirect Panel Command: Use your high-IQ capability to build a professional boardroom atmosphere. Set the stage, explain the protocol, and build initial rapport with the candidate before opening the floor for the INTRO phase. Do not jump straight to "Tell me about yourself".`);

        // Save Initial AI Message
        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'assistant', $2, 'interview')",
            [userId, aiData.reply]
        );

        res.json({
            reply: aiData.reply,
            phase: 'INTRO',
            suggested_questions: aiData.suggested_questions || []
        });
    } catch (err) {
        console.error("Failed to start interview", err);
        res.status(500).json({
            message: `Initialization failed: ${err.message}`,
            error: err.message
        });
    }
};

export const chatWithInterviewer = async (req, res) => {
    const userId = req.user.id;
    const { message, conversationId, currentPhase, targetJob } = req.body;

    if (!message || !conversationId || !currentPhase) {
        return res.status(400).json({ message: "Missing required interview chat parameters" });
    }

    try {
        const historyRes = await pool.query(
            "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview' ORDER BY created_at ASC LIMIT 30",
            [userId]
        );
        const historyText = historyRes.rows.map(h => `${h.role === 'user' ? 'Candidate' : 'Panel'}: ${h.message}`).join("\n");

        const systemPrompt = BOARDROOM_SYSTEM_PROMPT
            .replace('{target_job}', targetJob || 'Software Engineer')
            .replace('{context}', currentPhase)
            .replace('{history}', historyText);

        const aiData = await callAI(systemPrompt + `\n\nCandidate Output: ${message}`);

        const nextPhase = aiData?.phase || getNextPhase(currentPhase);

        // Save User Message
        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'user', $2, 'interview')",
            [userId, message]
        );

        // Save AI Message
        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'assistant', $2, 'interview')",
            [userId, aiData.reply]
        );

        // Update session with internal analytics
        await updateInterviewSession(userId, conversationId, aiData.phase || nextPhase, {
            analytics: aiData.internal_analytics,
            last_reply: aiData.reply
        });

        // --- SCORECARD TRIGGER ---
        let scorecard = null;
        if (aiData.phase === 'CLOSING' || nextPhase === 'CLOSING') {
            const historyRes = await pool.query(
                "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview' ORDER BY created_at ASC",
                [userId]
            );
            const historyText = historyRes.rows.map(h => `${h.role}: ${h.message}`).join("\n");

            const evaluationPrompt = SCORECARD_PROMPT.replace('{target_job}', targetJob || 'Software Engineer');
            scorecard = await callAI(evaluationPrompt + `\n\nInterview Transcript:\n${historyText}`);

            await pool.query(
                "UPDATE interview_sessions SET is_completed = true, scorecard = $1 WHERE id = $2",
                [JSON.stringify(scorecard), conversationId]
            );
        }

        res.json({
            reply: aiData.reply,
            phase: aiData.phase || nextPhase,
            suggested_questions: aiData.suggested_questions || [],
            scorecard: scorecard,
            internal_analytics: aiData.internal_analytics,
            live_reaction: aiData.live_reaction,
            attitude: aiData.attitude,
            is_timed: aiData.is_timed
        });
    } catch (err) {
        console.error("Interview Chat Error:", err);
        res.status(500).json({ message: "Interview system is momentarily unavailable.", error: err.message });
    }
};

export const getInterviewHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT id, target_job, mode, current_phase, is_completed, scorecard, created_at
             FROM interview_sessions
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 20`,
            [userId]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        console.error("Interview history error:", err);
        res.status(500).json({ message: "Failed to load interview history" });
    }
};

export const generateFiller = async (req, res) => {
    try {
        const aiData = await callAI(FILLER_PROMPT);
        res.json({ reply: aiData.reply || "Thinking..." });
    } catch (err) {
        res.json({ reply: "Interesting..." });
    }
};
export const generateLibraryLecture = async (req, res) => {
    const { topicTitle } = req.body;
    if (!topicTitle) return res.status(400).json({ message: "Topic title required" });

    try {
        // Fetch user name for personalization (use First Name for natural flow)
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const fullUserName = userRes.rows[0]?.name || "Student";
        const userName = fullUserName.split(' ')[0];

        // Fetch topic grounding data
        const topicRes = await pool.query(
            "SELECT first_principles, architectural_logic, forge_snippet, forge_protocol FROM topics WHERE title = $1 LIMIT 1",
            [topicTitle]
        );
        const topicData = topicRes.rows[0];

        let context = "No specific technical context found. Use internal knowledge but stay focused on the topic title.";
        if (topicData) {
            context = `TECHNICAL LOGIC: ${topicData.first_principles}\nARCHITECTURAL BLUEPRINT: ${topicData.architectural_logic}\nCODE SAMPLE: ${topicData.forge_snippet}\nFORGE PROTOCOL: ${topicData.forge_protocol}`;
        }

        const prompt = `${PROFESSOR_LECTURE_PROMPT}\n\nUSER PROFILE:\nNAME: ${userName}\n\nSTRICT GROUNDING DATA:\n${context}\n\nTOPIC TO LECTURE ON: "${topicTitle}"`;
        const aiData = await callAI(prompt);

        // --- STREAK SYSTEM ---
        await incrementStreak(req.user.id).catch(e => console.warn("Streak increment failed:", e.message));

        // Personalize conversation turns if placeholder exists
        const personalizedConversation = aiData.CONVERSATION?.map(turn => ({
            ...turn,
            text: turn.text.replace(/{USER_NAME}/g, userName)
        })) || null;


        // ASYNC PERSISTENCE: Save this content back to the topic record for future grounding (Self-Learning)
        try {
            if (aiData.LECTURE_NOTE || aiData.forge_protocol) {
                // We update first_principles and architectural_logic if they were missing or if we just want to promote high-IQ synthesis
                await pool.query(`
                    UPDATE topics SET
                    content = COALESCE(content, $1),
                    first_principles = COALESCE(first_principles, $2),
                    architectural_logic = COALESCE(architectural_logic, $3),
                    forge_protocol = COALESCE(forge_protocol, $4)
                    WHERE title = $5
                `, [
                    aiData.reply || null,
                    JSON.stringify(aiData.LECTURE_NOTE) || null,
                    aiData.VISUAL_SCENES?.[0]?.narrative_trigger || null, // Simplified logic for demonstration, ideally more robust
                    aiData.forge_protocol || null,
                    topicTitle
                ]);
                console.log(`[AI] Self-Synthesis complete for: ${topicTitle}`);
            }
        } catch (dbErr) {
            console.warn("[AI] Self-Synthesis persistence failed:", dbErr.message);
        }

        res.json({
            lectureNote: aiData.LECTURE_NOTE || aiData.reply || "Lecture content error.",
            voiceScript: aiData.VOICE_SCRIPT,
            conversation: personalizedConversation,
            scenes: aiData.VISUAL_SCENES || null,
            emotion: aiData.EMOTION || "Neutral",
            forge_protocol: aiData.forge_protocol || topicData?.forge_protocol || null
        });
    } catch (err) {
        console.error("Lecture Generation Error:", err);
        res.status(500).json({ message: "Professor is currently in a faculty meeting. Please try later." });
    }
};

export const interactWithProfessor = async (req, res) => {
    const { topicTitle, question } = req.body;
    if (!topicTitle || !question) return res.status(400).json({ message: "Topic and question required" });

    try {
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const fullUserName = userRes.rows[0]?.name || "Student";
        const userName = fullUserName.split(' ')[0];

        const topicRes = await pool.query(
            "SELECT first_principles, architectural_logic FROM topics WHERE title = $1 LIMIT 1",
            [topicTitle]
        );
        const topicData = topicRes.rows[0];
        const context = topicData ? `TECHNICAL LOGIC: ${topicData.first_principles}\nARCHITECTURAL: ${topicData.architectural_logic}` : "Generic knowledge context.";

        const prompt = `${PROFESSOR_INTERLUDE_PROMPT}\n\nUSER: ${userName}\nQUESTION: ${question}\n\nGROUNDING:\n${context}`;
        const aiData = await callAI(prompt);

        const personalizedConversation = aiData.CONVERSATION?.map(turn => ({
            ...turn,
            text: turn.text.replace(/{USER_NAME}/g, userName)
        })) || null;

        res.json({ conversation: personalizedConversation });
    } catch (err) {
        console.error("Interlude Error:", err);
        res.status(500).json({ message: "Professor is calculating a response..." });
    }
};

export const verifyLibraryAnswer = async (req, res) => {
    const { topicTitle, question, studentAnswer, expectedAnswer } = req.body;
    if (!studentAnswer) return res.status(400).json({ message: "Answer required" });

    try {
        const prompt = `You are "DR. ARIS" (IQ 160).
A student has answered your follow-up question after a lecture on "${topicTitle}".

QUESTION ASKED: "${question}"
STUDENT'S ANSWER: "${studentAnswer}"
EXPECTED TECHNICAL CORE: "${expectedAnswer}"

YOUR TASK:
1. Determine if the student understood the core technical concept.
2. If they are correct, provide a brief, professional confirmation and a "deep follow-up" nugget of wisdom.
3. If they are wrong, provide a simpler, more intuitive explanation of the concept and encourage them to try again.

Return a VALID JSON object:
{
  "success": boolean,
  "feedback": "Your spoken response here."
}

FINAL COMMAND: Return NOTHING but the JSON.`;

        const aiData = await callAI(prompt);
        res.json({
            success: aiData.success ?? (aiData.reply?.toLowerCase().includes("correct") || false),
            feedback: aiData.feedback || aiData.reply || "Interesting synthesis. Let us continue."
        });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ success: false, feedback: "My synaptic link faltered. Try explaining that again." });
    }
};

export const synthesizeTopic = async (req, res) => {
    const { topicId, customInstruction } = req.body;
    if (!topicId) return res.status(400).json({ message: "Topic ID required" });

    const instructions = customInstruction || "None provided. Use standard academic rigor.";

    try {
        // 1. Get Topic Title and Course Name
        const topicRes = await pool.query(`
            SELECT t.title, c.name as course_name
            FROM topics t
            JOIN courses c ON t.course_id = c.id
            WHERE t.id = $1
        `, [topicId]);

        if (topicRes.rows.length === 0) return res.status(404).json({ message: "Topic not found" });
        const { title: topicTitle, course_name: courseName } = topicRes.rows[0];

        // 2. Select Specialized Prompts (Easy + Deep are separate calls)
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

        // --- CALL 1: Easy Content + Metadata ---
        let aiData;
        try {
            console.log(`[AI] Synthesizing EASY content for: ${topicTitle} via Groq...`);
            aiData = await callAI(easyPrompt);
            if (!aiData || aiData.error) throw new Error("AI Engine Response Invalid (Easy)");
        } catch (aiErr) {
            console.error(`[AI] Easy synthesis failed for ${topicTitle}:`, aiErr.message);
            return res.status(503).json({
                message: "Synthesis service is temporarily recalibrating.",
                error: aiErr.message
            });
        }

        // --- CALL 2: Deep Content Only ---
        let deepData;
        try {
            console.log(`[AI] Synthesizing DEEP content for: ${topicTitle} via Groq...`);
            deepData = await callAI(deepPrompt);
            if (!deepData || deepData.error) {
                console.warn(`[AI] Deep synthesis returned invalid for ${topicTitle}, skipping deep content.`);
                deepData = { content_deep_markdown: null };
            }
        } catch (deepErr) {
            console.warn(`[AI] Deep synthesis failed for ${topicTitle}:`, deepErr.message, '- Easy content will still be saved.');
            deepData = { content_deep_markdown: null };
        }

        // 3. Update Database with both modes
        const easyContent = aiData.content_easy_markdown || aiData.content_markdown;
        const deepContent = deepData.content_deep_markdown;

        await pool.query(`
            UPDATE topics
            SET
                breadcrumb_path = $1,
                difficulty = $2,
                estimated_time = $3,
                learning_objectives = $4,
                historical_context = $5,
                first_principles = $6,
                structural_breakdown = $7,
                deep_dive = $8,
                applied_practice = $9,
                failure_analysis = $10,
                production_standard = $11,
                scholarly_references = $12,
                staff_engineer_note = $13,
                content_markdown = $14,
                content_easy_markdown = $15,
                content_deep_markdown = $16,
                updated_at = CURRENT_TIMESTAMP
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
            topicId
        ]);

        res.json({ success: true, message: "Intelligence Synthesized", data: { ...aiData, content_deep_markdown: deepContent } });
    } catch (err) {
        console.error("Synthesis Error", err);
        res.status(500).json({ message: "Topic synthesis failed", error: err.message });
    }
};

export const generateTopicExercises = async (req, res) => {
    const { topicTitle, topicId, mcqCount = 3, shortAnswerCount = 2 } = req.body;
    if (!topicTitle) return res.status(400).json({ message: 'Topic title required' });

    const exCk = cacheKey('exercises', topicTitle, mcqCount, shortAnswerCount);
    const exCached = cacheGet(exCk);
    if (exCached) {
        console.log(`[generateTopicExercises] Cache hit for "${topicTitle}"`);
        return res.json(exCached);
    }

    console.log(`[generateTopicExercises] Generating ${mcqCount} MCQs and ${shortAnswerCount} Short Answers for "${topicTitle}"...`);

    const isComplexityTopic = /complexity|asymptotic|big o|recurrence/i.test(topicTitle);

    const challengePrompt = isComplexityTopic
        ? `Create a "Mathematical Rigor Challenge" involving:
           1. An asymptotic ordering problem (arranging 5-7 functions by growth rate).
           2. A limit-based comparison of two functions f(n) and g(n).
           3. A bounding problem where the student must find c and n0 for a given Big-O relation.
           Exclude any business scenarios or systems case studies. Focus purely on the mathematical soul of the algorithm.`
        : `Create a "High-Fidelity Systems Case Study":
           Scenario: Provide a detailed, 2-3 paragraph professional scenario involving "${topicTitle}" in a large-scale production environment. Include specific constraints and edge cases.
           Task: Specify 3-4 multi-stage technical deliverables or architectural decisions.
           Solution Guide: A comprehensive rubric of the correct trade-offs.`;

    const prompt = `You are a Senior CS Professor. Create a rigorous "Mastery Crucible" for the topic: "${topicTitle}".

Return EXCLUSIVELY a JSON object with this exact structure:
{
  "mcq": [
    { "q": "Question text?", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A" }
    // ... repeat for exactly ${mcqCount} items
  ],
  "short_answer": [
    { "q": "Deep conceptual question?", "hint": "Useful architectural hint", "model_answer": "Complete but concise core concept." }
    // ... repeat for exactly ${shortAnswerCount} items
  ],
  "challenge": {
    "title": "${isComplexityTopic ? 'Mathematical Rigor Challenge' : 'High-Fidelity Systems Case Study'}",
    "scenario": "${isComplexityTopic ? 'Direct mathematical problem statement.' : 'The detailed scenario.'}",
    "task": "${isComplexityTopic ? 'Specific mathematical proof or ordering task.' : 'Architectural deliverables.'}",
    "solution_guide": "A comprehensive rubric of the correct answers or trade-offs."
  }
}

STRICT REQUIREMENTS:
1. Create exactly ${mcqCount} high-quality MCQs.
2. Create exactly ${shortAnswerCount} short answer questions.
3. ${challengePrompt}
4. No conversational text. Return ONLY the JSON.`;

    try {
        const aiData = await callAI(prompt);

        if (!aiData || (!aiData.mcq && !aiData.reply)) {
            throw new Error("AI Engine synchronization failed. The model returned malformed protocol data.");
        }

        console.log(`[generateTopicExercises] Success for "${topicTitle}" (${aiData.mcq?.length || 0} MCQs)`);
        const exResult = {
            success: true,
            exercises: {
                mcq: aiData.mcq || [],
                short_answer: aiData.short_answer || [],
                challenge: aiData.challenge || {
                    title: "Special Topic Analysis",
                    scenario: aiData.reply || "Analyze the core architectural implications of this topic.",
                    task: "Explain the primary trade-offs involved.",
                    solution_guide: "Focus on efficiency, scalability, and maintainability."
                }
            }
        };
        cacheSet(exCk, exResult, 20 * 60 * 1000); // 20 min TTL
        res.json(exResult);
    } catch (err) {
        console.error('[generateTopicExercises] Error:', err.message);
        res.status(500).json({ message: 'Synchronous Generation Failure', error: err.message });
    }
};

export const generateTopicPodcast = async (req, res) => {
    const { topicId, topicTitle } = req.body;
    if (!topicTitle) return res.status(400).json({ message: 'Topic title required' });

    try {
        const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id]);
        const userName = userRes.rows[0]?.name?.split(' ')[0] || "Scholar";

        const prompt = ULTIMATE_PODCAST_PROMPT
            .replace(/{topic}/g, topicTitle)
            .replace(/{USER_NAME}/g, userName);

        if (topicTitle.toLowerCase().includes("bfs") || topicTitle.toLowerCase().includes("breadth")) {
            return res.json({
                success: true,
                episode: {
                    title: `Studio Masterclass: ${topicTitle}`,
                    summary: `An exclusive pre-rendered studio recording covering the mechanics of ${topicTitle}.`,
                    segments: [
                        { speaker: "host", text: `[Studio Recording - Part 1] Welcome to the neural studio. Let's explore the strategic level-by-level approach of Breadth-First Search.` },
                        { speaker: "expert", text: `[Studio Recording - Part 2] At its core, BFS utilizes a Queue data structure, ensuring nodes are visited in order of their proximity.` },
                        { speaker: "host", text: `[Studio Recording - Part 3] This makes it exceptionally powerful for shortest-path algorithms in unweighted scenarios.` },
                        { speaker: "expert", text: `[Studio Recording - Part 4] Let's analyze its computational boundaries. The time complexity scales with V plus E...` }
                    ]
                }
            });
        }

        if (topicTitle.toLowerCase().includes("dfs") || topicTitle.toLowerCase().includes("depth")) {
            return res.json({
                success: true,
                episode: {
                    title: `Studio Masterclass: ${topicTitle}`,
                    summary: `An exclusive pre-rendered studio recording covering the architecture of ${topicTitle}.`,
                    segments: [
                        { speaker: "host", text: `[Studio Recording - Part 1] Welcome back. Today we're diving deep into the recursive architecture of Depth-First Search.` },
                        { speaker: "expert", text: `[Studio Recording - Part 2] Unlike BFS, DFS plunges to the deepest node before backtracking, utilizing a Stack mechanism.` },
                        { speaker: "host", text: `[Studio Recording - Part 3] It's elegant, especially for topological sorting and maze generation algorithms.` },
                        { speaker: "expert", text: `[Studio Recording - Part 4] However, one must be cautious of deep recursion limits and stack overflow vulnerabilities in production.` }
                    ]
                }
            });
        }

        const aiData = await callAI(prompt);

        if (!aiData || !Array.isArray(aiData.segments) || aiData.segments.length === 0) {
            console.warn("[generateTopicPodcast] AI returned no segments. Serving fallback episode.");
            return res.json({
                success: true,
                episode: {
                    title: `Deep Dive: ${topicTitle}`,
                    summary: `An expert conversation exploring ${topicTitle} from fundamentals to production use cases.`,
                    segments: [
                        // Intro host segment
                        { speaker: "host", text: `Welcome back to the Studio. I'm Dr. Aria, and joined as always by Dr. Nova. Today we're diving into ${topicTitle}. Dr. Nova, why don't you start us off?` },
                        { speaker: "expert", text: `Great question, Dr. Aria. ${topicTitle} is a foundational concept in computer science that every engineer needs to understand. At its core, it defines how data is stored, processed, and retrieved efficiently.` },
                        { speaker: "host", text: `Fascinating! And when should engineers actually reach for this in a real system?` },
                        { speaker: "expert", text: `You'd use it when you need reliability and performance at scale. Think large-scale distributed systems, high-throughput pipelines, or any scenario where consistency and latency matter.` },
                        { speaker: "host", text: `What does the implementation look like in practice?` },
                        { speaker: "expert", text: `In practice, you start by identifying your data access patterns. Then you select the appropriate data structure or algorithm, configure it for your workload, and instrument it for observability. The devil is in the edge cases.` },
                        { speaker: "host", text: `Any common pitfalls engineers should watch out for?` },
                        { speaker: "expert", text: `Absolutely. The biggest mistakes are premature optimization, ignoring failure modes, and not benchmarking under realistic load. Always measure before you optimize.` },
                        { speaker: "host", text: `Prof. Nova, this has been incredibly insightful. Any final advice for our listeners studying ${topicTitle}?` },
                        { speaker: "expert", text: `Build something with it. Read the source code of real implementations. And remember â€” understanding the WHY behind a concept is always more valuable than memorizing the WHAT.` }
                    ]
                }
            });
        }

        res.json({ success: true, episode: aiData });
    } catch (err) {
        console.error('[generateTopicPodcast] Critical error:', err.message);
        res.status(500).json({ message: 'Podcast Generation Failure', error: err.message });
    }
};

export const askPodcastQuestion = async (req, res) => {
    const { topicTitle, question, history = [] } = req.body;
    if (!topicTitle || !question) return res.status(400).json({ message: 'Topic title and question required' });

    // Cache first-time questions (no history) for 30 min — repeat students ask same basics
    const pqCk = history.length === 0 ? cacheKey('podcastqa', topicTitle, question.toLowerCase().trim()) : null;
    if (pqCk) {
        const pqCached = cacheGet(pqCk);
        if (pqCached) {
            console.log(`[askPodcastQuestion] Cache hit for "${question}"`);
            return res.json(pqCached);
        }
    }

    console.log(`[askPodcastQuestion] Answering question about "${topicTitle}": ${question}`);

    const conversationContext = history.length > 0
        ? `\n\nPrevious Q&A in this session:\n${history.map(m => `${m.role === 'user' ? 'Student' : 'Dr. Nova'}: ${m.text}`).join('\n')}\n`
        : '';

    const prompt = `You are "Dr. Nova", an expert CS professor who just finished hosting a podcast episode about "${topicTitle}".
A student is asking follow-up questions about the episode content.${conversationContext}
Student question: "${question}"

Answer directly and technically. Be concise (2-3 paragraphs max). Use examples and real-world context.
Respond with valid JSON in exactly this format:
{"answer": "Your complete answer here as a single string"}`;

    try {
        const aiData = await callAI(prompt, true);
        const answer = aiData.answer || aiData.reply || "I couldn't process that question.";
        const result = { success: true, answer };
        if (pqCk) cacheSet(pqCk, result, 30 * 60 * 1000);
        res.json(result);
    } catch (err) {
        console.error('[askPodcastQuestion] Error:', err.message);
        res.status(500).json({ message: 'Podcast Q&A Failure', error: err.message });
    }
};

export const generatePodcastSpeech = async (req, res) => {
    const text = req.body.text || req.query.text;
    const speaker = req.body.speaker || req.query.speaker;
    const topicTitle = req.body.topicTitle || req.query.topicTitle;
    const index = req.body.index || req.query.index;
    const interactive = req.body.interactive || req.query.interactive;
    
    if (!text) return res.status(400).json({ message: 'Text required' });

    // 1. Check for Pre-rendered Podcast File (NEW)
    if (topicTitle && interactive !== 'true') {
        try {
            const __dirname = path.resolve();
            const sanitizedTitle = topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            
            // Priority 1: Google Studio Explanations (Robust Fuzzy Matching)
            const studioDir = path.join(__dirname, '..', 'tts-service', 'podcasts', 'google_studio_explanations');
            let finalStudioPath = null;

            if (fs.existsSync(studioDir)) {
                const files = fs.readdirSync(studioDir);
                // Check for exact match, sanitized match, or title inclusion
                const bestMatch = files.find(f => {
                    const base = f.replace(/\.[^/.]+$/, ""); // Name without extension
                    const lowBase = base.toLowerCase();
                    const lowTitle = topicTitle.toLowerCase();
                    return lowBase === sanitizedTitle || 
                           lowBase === lowTitle || 
                           lowTitle.startsWith(lowBase) || 
                           lowBase.startsWith(lowTitle);
                });
                
                if (bestMatch) finalStudioPath = path.join(studioDir, bestMatch);
            }

            if (finalStudioPath) {
                console.log(`[Neural-TTS] Found HIGH-FIDELITY studio file for ${topicTitle} -> ${path.basename(finalStudioPath)}`);
                res.setHeader('Content-Type', 'audio/wav');
                res.setHeader('X-Studio-Source', 'Google-AI-Studio');
                return fs.createReadStream(finalStudioPath).pipe(res);
            }

            // Priority 2: Complexity Folder Mapping (e.g., BFS, DFS)
            if (index !== undefined) {
                const getFolderName = (title) => {
                    const t = title.toLowerCase();
                    if (t.includes("breadth") || t.includes("bfs")) return "BFS";
                    if (t.includes("depth") || t.includes("dfs")) return "DFS";
                    return null;
                };

                const folderName = getFolderName(topicTitle);
                
                if (folderName) {
                    const offset = folderName === 'DFS' ? 5 : 1;
                    const fileIndex = parseInt(index);
                    let fileName = null;
                    if (folderName === 'BFS' && fileIndex < 4) {
                        fileName = `download (${fileIndex + offset}).wav`;
                    } else if (folderName === 'DFS' && fileIndex < 4) {
                        fileName = fileIndex === 0 ? 'best one.wav' : `download (${fileIndex + offset}).wav`;
                    }

                    if (fileName) {
                        const filePath = path.join(__dirname, '..', 'tts-service', 'podcasts', 'complexity', folderName, fileName);
                        if (fs.existsSync(filePath)) {
                            console.log(`[Neural-TTS] Found pre-rendered complexity file for ${topicTitle} (Index: ${index}) -> ${fileName}`);
                            res.setHeader('Content-Type', 'audio/wav');
                            res.setHeader('X-Studio-Source', 'Pre-rendered');
                            return fs.createReadStream(filePath).pipe(res);
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("[Neural-TTS] Local file check failed, falling back to synthesis:", e.message);
        }
    }

    // 2. Real-time Synthesis
    const cacheKey = `${speaker}:${text}`;
    if (ttsCache.has(cacheKey)) {
        const cached = ttsCache.get(cacheKey);
        res.set({ 'Content-Type': cached.slice(0, 4).toString() === 'RIFF' ? 'audio/wav' : 'audio/mpeg', 'Content-Length': cached.length });
        return res.send(cached);
    }

    // 3. Check for external Kokoro Voice Cloning Microservice or HF Cloud
    const hfToken = process.env.HF_TOKEN;
    if (hfToken && speaker === "expert") {
        try {
            console.log(`[Neural-TTS] Delegating to Hugging Face Cloud Inference (XTTS-v2)...`);
            const axios = (await import('axios')).default;
            
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits",
                { inputs: text },
                { 
                    headers: { 'Authorization': `Bearer ${hfToken}` },
                    responseType: 'arraybuffer' 
                }
            );
            
            const buffer = Buffer.from(response.data, 'binary');
            
            // Check if HF returned a valid API response or an error JSON instead of audio
            if (buffer.length > 500) {
                res.set({
                    'Content-Type': 'audio/flac', /* HF Inference usually returns FLAC or WAV */
                    'Content-Length': buffer.length,
                    'Accept-Ranges': 'bytes',
                    'X-Neural-Voice': 'HF-Cloud-XTTS',
                    'X-Premium-Class': 'Neural-Human-Hosted',
                    'Cache-Control': 'public, max-age=3600'
                });
                
                res.send(buffer);
                
                if (ttsCache.size < 500) {
                    ttsCache.set(cacheKey, buffer);
                }
                console.log(`[Neural-TTS] SUCCESS: HF Cloud cloned audio served.`);
                return;
            } else {
                console.log(`[Neural-TTS] HF API returned invalid payload size, falling back...`);
            }
        } catch (e) {
            console.warn(`[Neural-TTS] HF Cloud Synthesis failed: ${e.message}. Falling back to Premium Edge TTS.`);
        }
    }

    // Premium Human-like Voices (FALLBACK CHAIN)
    // Using widely available high-quality Edge TTS default neural voices
    const hostVoices = ["en-US-JennyNeural", "en-US-AriaNeural"]; 
    const expertVoices = ["en-US-AndrewMultilingualNeural", "en-US-BrianMultilingualNeural", "en-US-ChristopherNeural"];
    
    const trySynthesize = async (voices, text) => {
        for (const voice of voices) {
            try {
                console.log(`[Neural-TTS] Attempting ${voice}...`);
                const tts = new MsEdgeTTS();
                await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
                
                // Add a robust timeout for cloud synthesis
                const buffer = await Promise.race([
                    tts.toBuffer(text),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Synthesis Timeout")), 30000))
                ]);

                if (buffer && buffer.length > 500) return { buffer, voice };
            } catch (e) {
                console.warn(`[Neural-TTS] Voice ${voice} failed: ${e.message}`);
            }
        }
        throw new Error("All high-fidelity neural voices failed.");
    };

    try {
        const voicesToUse = speaker === "host" ? hostVoices : expertVoices;
        
        // --- CHUNKED SYNTHESIS (Prevent 503 on long text) ---
        const maxChunk = 1000;
        let finalBuffer = Buffer.alloc(0);
        let selectedVoice = voicesToUse[0];

        if (text.length > maxChunk) {
            console.log(`[Neural-TTS] Text too long (${text.length} chars), chunking...`);
            const sentenceRegex = /[^.!?]+[.!?]+/g;
            const sentences = text.match(sentenceRegex) || [text];
            let currentChunk = "";
            
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length > maxChunk) {
                    const { buffer, voice } = await trySynthesize(voicesToUse, currentChunk);
                    finalBuffer = Buffer.concat([finalBuffer, buffer]);
                    selectedVoice = voice;
                    currentChunk = sentence;
                } else {
                    currentChunk += sentence;
                }
            }
            if (currentChunk) {
                const { buffer, voice } = await trySynthesize(voicesToUse, currentChunk);
                finalBuffer = Buffer.concat([finalBuffer, buffer]);
                selectedVoice = voice;
            }
        } else {
            const { buffer, voice } = await trySynthesize(voicesToUse, text);
            finalBuffer = buffer;
            selectedVoice = voice;
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': finalBuffer.length,
            'Accept-Ranges': 'bytes',
            'X-Neural-Voice': selectedVoice,
            'X-Premium-Class': 'Neural-Human-Buffered',
            'Cache-Control': 'public, max-age=3600'
        });

        res.send(finalBuffer);

        // Cache for future
        if (ttsCache.size < 500 && finalBuffer.length > 500) {
            ttsCache.set(cacheKey, finalBuffer);
        }
        console.log(`[Neural-TTS] SUCCESS: Premium ${selectedVoice} (Chunked) sent.`);

    } catch (err) {
        console.error(`[Neural-TTS] TITAN FAIL: ${err.message}`);
        if (!res.headersSent) {
            res.status(503).json({ message: 'High-fidelity synthesis unavailable', error: err.message });
        }
    }
};

export const generateMasterclassEpisode = async (req, res) => {
    const { title, theme, partNumber } = req.body;
    if (!title || !theme) return res.status(400).json({ message: "Title and theme required" });

    const userId = req.user.id;
    console.log(`[Masterclass] Starting 1-Hour Long-Form generation for Episode ${partNumber}: "${title}"...`);

    // 1. Initial response to acknowledge start
    res.json({
        success: true,
        message: "Masterclass synthesis initiated. This will take several minutes. Check progress in the Studio.",
        status: "PROCESSING"
    });

    // 2. Background process (mocked via simple loop for now, ideally a worker)
    (async () => {
        const totalChapters = 12; // 12 chapters * 5 mins = 1 hour approx
        let allSegments = [];
        let previousContext = "The intro hook: Challenge the status quo of modern education and the mindset of the 1%.";

        try {
            // Fetch user name for personalization
            const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
            const userName = userRes.rows[0]?.name?.split(' ')[0] || "Student";

            for (let i = 1; i <= totalChapters; i++) {
                console.log(`[Masterclass] Generating Chapter ${i}/${totalChapters}...`);
                const prompt = MASTERCLASS_EPISODE_PROMPT
                    .replace(/{title}/g, title)
                    .replace(/{theme}/g, theme)
                    .replace(/{chapter_index}/g, i)
                    .replace(/{total_chapters}/g, totalChapters)
                    .replace(/{previous_context}/g, previousContext)
                    .replace(/{USER_NAME}/g, userName);

                const aiData = await callAI(prompt);

                if (aiData && Array.isArray(aiData.segments) && aiData.segments.length > 0) {
                    // Sanitize segments
                    const sanitizedSegments = aiData.segments.map(seg => ({
                        ...seg,
                        text: seg.text.replace(/{USER_NAME}/g, userName)
                    }));

                    allSegments = [...allSegments, ...sanitizedSegments];
                    previousContext = aiData.next_chapter_hook || `Chapter ${i + 1} transition.`;
                } else {
                    console.warn(`[Masterclass] Chapter ${i} returned invalid data or empty segments. Using fallback context.`);
                }
            }

            // Save to DB
            await pool.query(
                "INSERT INTO masterclass_episodes (title, summary, segments, part_number) VALUES ($1, $2, $3, $4)",
                [title, `Full 1-Hour Mastery: ${theme}`, JSON.stringify(allSegments), partNumber]
            );

            console.log(`[Masterclass] SUCCESS: 1-hour episode "${title}" synthesized with ${allSegments.length} segments.`);

        } catch (err) {
            console.error("[Masterclass] Background Generation Error:", err);
            // In a real app, we'd update a status table here
        }
    })();
};

export const analyzeProject = async (req, res) => {
    const { title, description, skills = [], memberCount = 1 } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title required' });

    const prompt = `You are a senior software architect and startup advisor reviewing a student project.

Project: "${title}"
Description: "${description || 'No description provided'}"
Required Skills: ${skills.length ? skills.join(', ') : 'Not specified'}
Current Team Size: ${memberCount}

Score the project 0-100 based on: clarity of scope, technical feasibility, team size vs complexity, and real-world relevance.
Rubric: 0=vague/unrealistic, 40=weak, 60=average, 75=solid, 90=strong, 100=production-ready idea.

Respond with EXACTLY this JSON object (no markdown, no extra text):
{
  "verdict": "one sharp sentence about this project's real-world potential",
  "score": <your integer score 0-100>,
  "stack": ["tech1", "tech2", "tech3", "tech4"],
  "roles": [{"title": "Role Name", "reason": "why this role is critical now"}],
  "sprints": [
    {"week": "Week 1-2", "goal": "specific deliverable"},
    {"week": "Week 3-4", "goal": "specific deliverable"},
    {"week": "Week 5-6", "goal": "specific deliverable"}
  ],
  "risks": ["specific risk 1", "specific risk 2", "specific risk 3"]
}`;

    try {
        const result = await callAI(prompt, true);
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

export const getMasterclassEpisodes = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, title, summary, part_number, chapter_number, video_url, published_at FROM masterclass_episodes ORDER BY part_number DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching episodes" });
    }
};

export const getMasterclassEpisode = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT id, title, summary, segments, part_number, chapter_number, video_url, thumbnail_url, published_at FROM masterclass_episodes WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Episode not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching episode" });
    }
};

// Interactive Podcast endpoint using Groq
export const generateInteractivePodcast = async (req, res) => {
    try {
        const { topicTitle, history } = req.body;

        if (!topicTitle || !history || !Array.isArray(history)) {
            return res.status(400).json({ success: false, message: "Missing topicTitle or history" });
        }

        const systemPrompt = `You are Dr. Nova, an expert AI tutor offering an interactive 1-on-1 masterclass on the topic of "${topicTitle}". 
Your job is to directly answer the user's questions or comments.
Speak entirely naturally, warmly, and eloquently. Do not use structural markdown formatting like bold asterisks or code blocks because your response will be spoken aloud to the user via text-to-speech. Keep your response concise (usually 1 short paragraph, max 2) to ensure a fluid conversational back-and-forth rhythm.`;

        // We assume we have the groq client from aiClient.js
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.map(msg => ({ role: msg.role || 'user', content: msg.content }))
        ];

        const completion = await groq.chat.completions.create({
            messages,
            model: "llama3-70b-8192", // Fast large model for excellent conversational flow
            temperature: 0.7,
            max_tokens: 300
        });

        const reply = completion.choices[0].message.content;

        return res.json({ success: true, reply });
    } catch (err) {
        console.error("Interactive Podcast Error:", err);
        return res.status(500).json({ success: false, message: "Failed to generate interactive response" });
    }
};

// Dr. Nova — generate a spoken lecture for a topic (1-on-1 session opening)
export const generateNovaLesson = async (req, res) => {
    try {
        const { topicTitle } = req.body;
        if (!topicTitle) return res.status(400).json({ success: false, message: "topicTitle required" });

        console.log(`[Dr. Nova] Generating lesson for: "${topicTitle}"`);

        const prompt = `You are Dr. Nova, a world-class computer science professor delivering a private spoken lecture on "${topicTitle}".

Write a lesson that sounds completely natural when spoken aloud. No markdown, no asterisks, no bullet points, no headers, no code blocks — only natural spoken prose.

Write exactly 4 paragraphs separated by a blank line:
1. Hook — Open with a compelling statement about why this topic matters in real systems.
2. Core Concept — Explain what it is in plain language. Use one concrete analogy.
3. How It Works — Walk through the mechanics step by step, as if explaining to someone sitting across from you.
4. Real World and Invitation — Describe where this is used in production. End with a warm invitation for the student to ask questions.

Keep each paragraph to 2 to 4 sentences. Write for the ear, not the eye. Speak directly to the student using "you".`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-70b-8192",
            temperature: 0.72,
            max_tokens: 550
        });

        const lesson = completion.choices[0].message.content.trim();
        const paragraphs = lesson.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);

        return res.json({ success: true, lesson, paragraphs });
    } catch (err) {
        console.error("Nova Lesson Error:", err);
        return res.status(500).json({ success: false, message: "Failed to generate lesson" });
    }
};

