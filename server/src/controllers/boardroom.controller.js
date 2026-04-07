/**
 * boardroom.controller.js
 * Handles the 6-phase AI interview simulation system.
 * Extracted from ai.controller.js for single-responsibility and testability.
 */
import pool from "../config/db.js";
import { callAI } from "../utils/aiClient.js";
import { BOARDROOM_SYSTEM_PROMPT, SCORECARD_PROMPT, INTERVIEW_MODE_CONTEXTS } from "../utils/aiRules.js";
import { getNextPhase, updateInterviewSession, startInterviewSession } from "../services/interview.service.js";

export const startInterview = async (req, res) => {
    const userId = req.user.id;
    const { targetJob, conversationId, mode = 'STANDARD' } = req.body;

    if (!targetJob || !conversationId) {
        return res.status(400).json({ message: "Target job and conversation ID required" });
    }

    try {
        await startInterviewSession(userId, conversationId, targetJob, mode);
        await pool.query("DELETE FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview'", [userId]);

        const modeContext = INTERVIEW_MODE_CONTEXTS[mode] || INTERVIEW_MODE_CONTEXTS.STANDARD;
        const systemPrompt = BOARDROOM_SYSTEM_PROMPT
            .replace('{target_job}', targetJob)
            .replace('{context}', `${modeContext}\n\nFirst contact. High-Stakes Simulation.`)
            .replace('{history}', "Simulation Initialized.");

        const aiData = await callAI(
            { system: systemPrompt, user: `Orchestrator: The candidate has selected ${targetJob}. Mode: ${mode}. Direct Panel Command: Build a professional boardroom atmosphere, set the stage, explain the protocol, and build initial rapport before opening the floor for the INTRO phase. Do not jump straight to "Tell me about yourself". Keep your reply concise — under 80 words.` },
            true, 512
        );

        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'assistant', $2, 'interview')",
            [userId, aiData.reply]
        );

        res.json({ reply: aiData.reply, phase: 'INTRO', suggested_questions: aiData.suggested_questions || [] });
    } catch (err) {
        console.error("Failed to start interview", err);
        res.status(500).json({ message: `Initialization failed: ${err.message}`, error: err.message });
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
            "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview' ORDER BY created_at ASC LIMIT 12",
            [userId]
        );
        const historyText = historyRes.rows
            .map(h => {
                const speaker = h.role === 'user' ? 'Candidate' : 'Panel';
                const text = h.message.length > 400 ? h.message.slice(0, 400) + '...' : h.message;
                return `${speaker}: ${text}`;
            })
            .join("\n");

        const systemPrompt = BOARDROOM_SYSTEM_PROMPT
            .replace('{target_job}', targetJob || 'Software Engineer')
            .replace('{context}', currentPhase)
            .replace('{history}', historyText);

        const aiData = await callAI(
            { system: systemPrompt, user: `Candidate Output: ${message}` },
            true, 700
        );

        const nextPhase = aiData?.phase || getNextPhase(currentPhase);

        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'user', $2, 'interview')",
            [userId, message]
        );
        await pool.query(
            "INSERT INTO chat_messages (user_id, role, message, chat_type) VALUES ($1, 'assistant', $2, 'interview')",
            [userId, aiData.reply]
        );

        await updateInterviewSession(userId, conversationId, aiData.phase || nextPhase, {
            analytics: aiData.internal_analytics,
            last_reply: aiData.reply
        });

        let scorecard = null;
        if (aiData.phase === 'CLOSING' || nextPhase === 'CLOSING') {
            const fullHistoryRes = await pool.query(
                "SELECT role, message FROM chat_messages WHERE user_id = $1 AND chat_type = 'interview' ORDER BY created_at ASC",
                [userId]
            );
            const transcriptText = fullHistoryRes.rows
                .map(h => {
                    const text = h.message.length > 400 ? h.message.slice(0, 400) + '...' : h.message;
                    return `${h.role}: ${text}`;
                })
                .join("\n");

            const evaluationPrompt = SCORECARD_PROMPT.replace('{target_job}', targetJob || 'Software Engineer');
            scorecard = await callAI(
                { system: evaluationPrompt, user: `Interview Transcript:\n${transcriptText}` },
                true, 1024
            );

            await pool.query(
                "UPDATE interview_sessions SET is_completed = true, scorecard = $1 WHERE id = $2",
                [JSON.stringify(scorecard), conversationId]
            );
        }

        res.json({
            reply: aiData.reply,
            phase: aiData.phase || nextPhase,
            suggested_questions: aiData.suggested_questions || [],
            scorecard,
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
             FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
            [userId]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        console.error("Interview history error:", err);
        res.status(500).json({ message: "Failed to load interview history" });
    }
};
