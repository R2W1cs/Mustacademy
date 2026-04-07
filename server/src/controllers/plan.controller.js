/**
 * plan.controller.js
 * Handles goals, missions, quizzes, and daily study plans.
 * Extracted from ai.controller.js for single-responsibility and testability.
 */
import pool from "../config/db.js";
import { cacheGet, cacheSet, cacheKey } from "../utils/aiCache.js";
import { incrementStreak } from "../services/streak.service.js";
import { callAI, callFastAI } from "../utils/aiClient.js";
import { RIGOROUS_QUIZ_PROMPT, ELITE_PLAN_PROMPT } from "../utils/aiRules.js";

// ---------------------------------------------------------------------------
// Goals & Work Submission
// ---------------------------------------------------------------------------

export const submitWork = async (req, res) => {
    const userId = req.user.id;
    const { goalId, submissionText } = req.body;
    if (!goalId || !submissionText) return res.status(400).json({ message: "Goal ID and submission text are required" });

    try {
        const goalResult = await pool.query(
            "SELECT description FROM daily_goals WHERE id = $1 AND user_id = $2",
            [goalId, userId]
        );
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
        const aiData = await callFastAI(prompt, true, 512);

        const result = await pool.query(
            `INSERT INTO goal_submissions (goal_id, user_id, submission_text, ai_grade, ai_feedback)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [goalId, userId, submissionText, aiData.grade, aiData.feedback]
        );
        await pool.query("UPDATE daily_goals SET is_completed = true WHERE id = $1", [goalId]);

        let newStreak = null;
        if (aiData.grade >= 60) {
            newStreak = await incrementStreak(userId);
        }

        res.json({ ...result.rows[0], newStreak });
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
        await pool.query(
            "UPDATE daily_goals SET is_completed = true WHERE id = $1 AND user_id = $2",
            [goalId, userId]
        );
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

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

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

export const generateQuiz = async (req, res) => {
    const userId = req.user.id;
    const { topic } = req.body;

    try {
        const ck = cacheKey('quiz', topic);
        const cached = cacheGet(ck);
        if (cached) return res.json(cached);

        await incrementStreak(userId).catch(e => console.warn("Streak increment failed:", e.message));

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
OBJECTIVES: ${JSON.stringify(topicData.learning_objectives).slice(0, 500)}
STRUCTURE: ${(topicData.structural_breakdown || '').slice(0, 300)}
FAILURE VECTORS: ${(topicData.failure_analysis || '').slice(0, 300)}
`;
        }

        const prompt = RIGOROUS_QUIZ_PROMPT
            .replace(/{topic}/g, topic || "Computer Science Mastery")
            .replace(/{context}/g, contextText);

        const aiData = await callFastAI(prompt, true, 1024);

        if (!aiData || !Array.isArray(aiData.questions)) {
            console.warn("[generateQuiz] Invalid format from AI. Serving fallback.");
            return res.json(getFallbackQuiz());
        }

        aiData.questions = aiData.questions.filter(q => Array.isArray(q.options) && q.options.length > 0);
        if (aiData.questions.length === 0) {
            console.warn("[generateQuiz] All questions lacked options. Serving fallback.");
            return res.json(getFallbackQuiz());
        }

        cacheSet(ck, aiData, 15 * 60 * 1000);
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

export const submitQuiz = async (req, res) => {
    const userId = req.user.id;
    try {
        const newStreak = await incrementStreak(userId).catch(e => {
            console.warn("Streak increment failed:", e.message);
            return null;
        });
        res.json({ success: true, newStreak });
    } catch (err) {
        res.status(500).json({ message: "Quiz submission failed", error: err.message });
    }
};

// ---------------------------------------------------------------------------
// Daily Plan
// ---------------------------------------------------------------------------

export const generateDailyPlan = async (req, res) => {
    const userId = req.user.id;
    const { hours, technique } = req.body;

    try {
        const today = new Date().toISOString().split('T')[0];
        const existingPlan = await pool.query(
            "SELECT * FROM daily_plans WHERE user_id::text = $1::text AND date = $2",
            [userId, today]
        );
        if (existingPlan.rows.length > 0) return res.json(existingPlan.rows[0]);

        let performanceContext = "No recent performance data.";
        let pendingMissions = "No pending missions.";
        let currentTopic = "Computer Science Fundamentals";
        let semesterTopics = "N/A";
        let userYear = 1;
        let userSemester = 1;

        try {
            const userRes = await pool.query("SELECT year, semester FROM users WHERE id = $1", [userId]);
            userYear = userRes.rows[0]?.year || 1;
            userSemester = userRes.rows[0]?.semester || 1;

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
                    if (acc[row.course_name].length < 5) acc[row.course_name].push(row.topic_title);
                    return acc;
                }, {});
                semesterTopics = Object.entries(grouped)
                    .map(([course, topics]) => `[${course}]: ${topics.join(", ")}`)
                    .join("\n");
            }

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

            const missionsRes = await pool.query(`
                SELECT description, deadline FROM daily_goals
                WHERE user_id::text = $1::text AND is_completed = false
                ORDER BY deadline ASC LIMIT 3
            `, [userId]);
            if (missionsRes.rows.length > 0) {
                pendingMissions = missionsRes.rows
                    .map(r => `- ${r.description} (Due: ${new Date(r.deadline).toLocaleDateString()})`)
                    .join("\n");
            }

            const progressRes = await pool.query(`
                SELECT t.title FROM user_topic_progress p
                JOIN topics t ON p.topic_id = t.id
                WHERE p.user_id::text = $1::text
                ORDER BY p.updated_at DESC LIMIT 1
            `, [userId]);
            if (progressRes.rows.length > 0) currentTopic = progressRes.rows[0].title;
        } catch (ctxErr) {
            console.warn("[generateDailyPlan] Rich context error:", ctxErr.message);
        }

        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const currentDate = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        const systemPrompt = ELITE_PLAN_PROMPT
            .replace('{semesterContext}', `Year ${userYear}, Semester ${userSemester} (Current Focus)`)
            .replace('{currentTime}', currentTime)
            .replace('{currentDate}', currentDate)
            .replace('{currentTopic}', currentTopic)
            .replace('{semesterTopics}', semesterTopics)
            .replace('{performanceContext}', performanceContext)
            .replace('{pendingMissions}', pendingMissions)
            .replace('{hours}', hours || 4)
            .replace('{technique}', technique || 'pomodoro');

        let schedule = null;
        try {
            const aiData = await callAI(systemPrompt, true, 2048);
            schedule = aiData.schedule;
        } catch (aiError) {
            console.warn("[generateDailyPlan] AI error. Using fallback schedule.", aiError.message);
        }

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
