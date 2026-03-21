import pool from "../config/db.js";

import { incrementStreak } from "../services/streak.service.js";
import {
    PROFESSOR_THEORY_SYNTHESIS_PROMPT, PROFESSOR_PROGRAMMING_SYNTHESIS_PROMPT,
    PROFESSOR_THEORY_DEEP_PROMPT, PROFESSOR_PROGRAMMING_DEEP_PROMPT,
    FILLER_PROMPT, PROFESSOR_LECTURE_PROMPT, ELITE_PLAN_PROMPT,
    BOARDROOM_SYSTEM_PROMPT, SCORECARD_PROMPT, RIGOROUS_QUIZ_PROMPT,
    PROFESSOR_IQ_160_PROMPT, MASTERCLASS_EPISODE_PROMPT, ULTIMATE_PODCAST_PROMPT
} from "../utils/aiRules.js";
import { getNextPhase, updateInterviewSession, startInterviewSession } from "../services/interview.service.js";
import { callOllama, callGroq, callAI, repairJson, streamAI, groq } from "../utils/aiClient.js";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// In-memory cache for frequently requested TTS segments
const ttsCache = new Map();

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
    const { message, conversationId } = req.body;
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

        try {
            const historyRes = await pool.query(
                "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'mentor' ORDER BY created_at DESC LIMIT 10",
                [userId]
            );
            history = historyRes.rows.reverse();

            const topicRes = await pool.query(
                "SELECT title, content FROM topics WHERE $1 ILIKE '%' || title || '%' AND content IS NOT NULL LIMIT 1",
                [message]
            );

            if (topicRes.rows.length > 0) {
                context = `Context for ${topicRes.rows[0].title}: ${topicRes.rows[0].content}`;
                detectedTopic = topicRes.rows[0].title;

                // Count consecutive questions on this topic
                const recentMessages = history.filter(h => h.role === 'user').slice(-5);
                questionCount = recentMessages.filter(h =>
                    h.message.toLowerCase().includes(detectedTopic.toLowerCase())
                ).length;

                // Force exercise after 5 questions on same topic
                if (questionCount >= 4) { // 4 previous + this one = 5 total
                    shouldForceExercise = true;
                    console.log(`[AI] Auto-Exercise Trigger: ${questionCount + 1} questions on ${detectedTopic}`);
                }
            }
        } catch (dbErr) {
            console.warn("AI DB Context Error (Recoverable):", dbErr.message);
        }

        // 2. Determine Complexity & Prepare Prompt
        const isComplex = message.length > 50 || /explain|how|why|deep dive|protocol|architecture|design/i.test(message);
        const dynamicInstruction = isComplex
            ? "\n\n--- INSTRUCTION: Use the FULL Professor's Method for this specific topic to give the student the most elite, high-level perspective. Keep it extremely technical, research-backed, and direct. Dr. Nova, what do you think? \n\nDr. Nova: Well..."
            : "\n\n--- INSTRUCTION: Provide a CONCISE, brilliant response. Skip the 9-point lecture structure. ---";

        const systemPrompt = PROFESSOR_IQ_160_PROMPT
            .replace('{context}', context || "No specific topic context found.")
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
            reply: "⚠️ [SYSTEM OFFLINE] " + getMockResponse('mentor'),
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

        // Header for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 2. Prepare Prompt (Simple version for streaming)
        const isComplex = message.length > 50 || /explain|how|why|deep dive|protocol|architecture|design/i.test(message);
        const dynamicInstruction = isComplex
            ? "\n--- INSTRUCTION: Use the FULL Professor's Method for this deep query. ---"
            : "\n--- INSTRUCTION: Provide a CONCISE, brilliant response. Skip the 9-point lecture structure. ---";

        let systemPrompt = PROFESSOR_IQ_160_PROMPT
            .replace('{context}', "Streaming session active.")
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
    const { targetJob, conversationId } = req.body;

    if (!targetJob || !conversationId) {
        return res.status(400).json({ message: "Target job and conversation ID required" });
    }

    try {
        await startInterviewSession(userId, conversationId, targetJob);

        // Clear previous interview history for this user
        await pool.query("DELETE FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview'", [userId]);

        const systemPrompt = BOARDROOM_SYSTEM_PROMPT
            .replace('{target_job}', targetJob)
            .replace('{context}', "First contact. High-Stakes Simulation.")
            .replace('{history}', "Simulation Initialized.");

        const aiData = await callAI(systemPrompt + `\n\nOrchestrator: The candidate has selected ${targetJob}. \n\nDirect Panel Command: Use your high-IQ capability to build a professional boardroom atmosphere. Set the stage, explain the protocol, and build initial rapport with the candidate before opening the floor for the INTRO phase. Do not jump straight to "Tell me about yourself".`);

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

            await pool.query("UPDATE interview_sessions SET is_completed = true WHERE id = $1", [conversationId]);
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
        res.json({
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
        });
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
                        { speaker: "expert", text: `Build something with it. Read the source code of real implementations. And remember — understanding the WHY behind a concept is always more valuable than memorizing the WHAT.` }
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
    const { topicTitle, question } = req.body;
    if (!topicTitle || !question) return res.status(400).json({ message: 'Topic title and question required' });

    console.log(`[askPodcastQuestion] Answering question about "${topicTitle}": ${question}`);

    const prompt = `You are "Dr. Aria" (Host) and "Prof. Nova" (Expert) co-hosting a podcast about "${topicTitle}".
A student just asked this question during the live recording: "${question}"
Answer the question directly, continuing your engaging, highly technical podcast persona.
You can have both hosts chime in, but return just the plain text of your answer (e.g. "Dr. Aria: Great question! Prof. Nova, what do you think? \\n\\nProf. Nova: Well...").
Keep it under 3 paragraphs.`;

    try {
        const aiData = await callAI(prompt, false);
        res.json({
            success: true,
            // The AI might return JSON if callAI treats everything as JSON parsing by default. 
            // In aiClient.js, callAI(prompt) expects JSON. Let's make sure askPodcastQuestion also asks for JSON to be safe since callAI might force it:
            answer: aiData.reply || typeof aiData === 'string' ? aiData : JSON.stringify(aiData)
        });
    } catch (err) {
        console.error('[askPodcastQuestion] Error:', err.message);
        res.status(500).json({ message: 'Podcast Q&A Failure', error: err.message });
    }
};

export const generatePodcastSpeech = async (req, res) => {
    const text = req.body.text || req.query.text;
    const speaker = req.body.speaker || req.query.speaker;
    
    if (!text) return res.status(400).json({ message: 'Text required' });

    // Use cache if same text and speaker
    const cacheKey = `${speaker}:${text}`;
    if (ttsCache.has(cacheKey)) {
        const cached = ttsCache.get(cacheKey);
        res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': cached.length });
        return res.send(cached);
    }

    const voiceName = speaker === "host" ? "en-US-AvaNeural" : "en-US-BrianNeural";
    const fallbackVoice = speaker === "host" ? "en-US-SoniaNeural" : "en-US-ChristopherNeural";
    console.log(`[Neural-TTS] Synthesizing with ${voiceName} for speaker="${speaker}"...`);

    try {
        const { Communicate } = await import('edge-tts-universal');
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Neural-Voice', voiceName);
        // We don't set Content-Length because we're streaming

        const communicate = new Communicate(text, { voice: voiceName });
        const buffers = [];
        
        for await (const chunk of communicate.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
                const buffer = Buffer.from(chunk.data);
                buffers.push(buffer);
                res.write(buffer); // Stream chunk to client immediately
            }
        }

        res.end();

        // Cache the full buffer for future requests
        if (ttsCache.size < 500) {
            const fullBuffer = Buffer.concat(buffers);
            if (fullBuffer.length > 500) {
                ttsCache.set(cacheKey, fullBuffer);
            }
        }

        console.log(`[Neural-TTS] SUCCESS: Streamed ${voiceName} for speaker="${speaker}".`);

    } catch (err) {
        console.error(`[Neural-TTS] FAIL: ${err.message}`);
        // If we haven't sent any data yet, we can send an error response
        if (!res.headersSent) {
            res.status(503).json({ message: 'High-fidelity synthesis failed', error: err.message });
        } else {
            // If we already started streaming, we just end the connection
            res.end();
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

export const getMasterclassEpisodes = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, title, summary, part_number, published_at FROM masterclass_episodes ORDER BY part_number DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching episodes" });
    }
};

export const getMasterclassEpisode = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM masterclass_episodes WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Episode not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching episode" });
    }
};

