/**
 * mentor.controller.js
 * Handles all AI mentor chat functionality.
 * Extracted from ai.controller.js to enforce single-responsibility.
 */
import pool from "../config/db.js";
import { cacheGet, cacheSet, cacheKey } from "../utils/aiCache.js";
import { incrementStreak } from "../services/streak.service.js";
import { callAI, streamAI } from "../utils/aiClient.js";
import { buildMentorPrompt, retrieveKBContext } from "../utils/ragEngine.js";
import { FILLER_PROMPT } from "../utils/aiRules.js";

export const chatWithMentor = async (req, res) => {
    const { message, conversationId, topicId } = req.body;
    const userId = req.user.id;

    try {
        if (!message) return res.status(400).json({ message: "Message required" });

        let history = [];
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
                    "SELECT title FROM topics WHERE id = $1",
                    [topicId]
                );
                if (topicRes.rows.length > 0) {
                    detectedTopic = topicRes.rows[0].title;

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
                            "\nCRITICAL: The student has uploaded these resources. Reference them by name.";
                    }
                }
            } else {
                const topicRes = await pool.query(
                    "SELECT title FROM topics WHERE $1 ILIKE '%' || title || '%' AND content_markdown IS NOT NULL LIMIT 1",
                    [message]
                );
                if (topicRes.rows.length > 0) {
                    detectedTopic = topicRes.rows[0].title;
                }
            }

            if (detectedTopic) {
                const recentMessages = history.filter(h => h.role === 'user').slice(-5);
                questionCount = recentMessages.filter(h =>
                    h.message.toLowerCase().includes(detectedTopic.toLowerCase())
                ).length;
                if (questionCount >= 4) shouldForceExercise = true;
            }
        } catch (dbErr) {
            console.warn("AI DB Context Error (Recoverable):", dbErr.message);
        }

        const ragKBContext = retrieveKBContext(message, detectedTopic);

        const forceExerciseInstruction = shouldForceExercise
            ? "\n\nCRITICAL: The student has asked many questions. You MUST assign a mission using the 'mission' field."
            : "";

        const systemPrompt = buildMentorPrompt({
            query: message,
            topicTitle: detectedTopic,
            preloadedKBContent: ragKBContext,
            history,
            scholarlyContext: scholarlyContext || null,
            streamMode: false,
        }) + forceExerciseInstruction;

        const aiData = await callAI(
            { system: systemPrompt, user: `Student: ${message}` },
            true, 2048
        );

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
                console.warn("Goal Creation Error (Recoverable):", goalErr.message);
            }
        }

        res.json({ ...aiData, goal });
    } catch (err) {
        console.error("Mentor Chat Error:", err);
        res.status(500).json({ message: "The Professor is temporarily unavailable.", error: err.message });
    }
};

export const chatWithMentorStream = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    try {
        if (!message) return res.status(400).json({ message: "Message required" });

        try {
            await pool.query(
                "INSERT INTO chat_messages (user_id, chat_type, role, message, conversation_id) VALUES ($1, 'mentor', 'user', $2, $3)",
                [userId, message, conversationId]
            );
        } catch (dbErr) {
            console.warn("[Stream AI] User Message Save Error:", dbErr.message);
        }

        // Fetch recent history for context
        let historyText = "";
        try {
            const historyRes = await pool.query(
                "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'mentor' ORDER BY created_at DESC LIMIT 6",
                [userId]
            );
            if (historyRes.rows.length > 0) {
                historyText = historyRes.rows.reverse()
                    .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.message.slice(0, 300)}`)
                    .join('\n');
            }
        } catch (dbErr) {
            console.warn("[Stream AI] History fetch error:", dbErr.message);
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const systemPrompt = [
            `You are a helpful AI tutor for computer science students. Answer questions clearly and directly.`,
            `Guidelines:`,
            `- Be concise but complete. Match response length to the question complexity.`,
            `- Use markdown: code blocks with language tags, bold for key terms, bullet lists when listing things.`,
            `- For code questions, provide working examples with comments.`,
            `- For concept questions, give a clear explanation then a real-world analogy if it helps.`,
            `- Do NOT use a professor persona, lecture format, or add unnecessary preamble.`,
            `- Just answer the question like a knowledgeable friend would.`,
            historyText ? `\nConversation history:\n${historyText}` : '',
        ].filter(Boolean).join('\n');

        const stream = await streamAI(
            { system: systemPrompt, user: message },
            "llama-3.3-70b-versatile", 2048
        );

        let fullContent = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullContent += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

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
        const result = await pool.query(`
            SELECT DISTINCT ON (conversation_id)
                conversation_id,
                message as title,
                created_at
            FROM chat_messages
            WHERE user_id = $1 AND chat_type = 'mentor' AND conversation_id IS NOT NULL AND role = 'user'
            ORDER BY conversation_id, created_at ASC
        `, [userId]);
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

export const generateFiller = async (req, res) => {
    try {
        const aiData = await callAI(FILLER_PROMPT, true, 64);
        res.json({ reply: aiData.reply || "Thinking..." });
    } catch (err) {
        res.json({ reply: "Interesting..." });
    }
};
