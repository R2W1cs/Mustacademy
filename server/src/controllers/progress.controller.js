import pool from "../config/db.js";
import { emitToRoom } from "../lib/io.js";

// Ensure schema supports quiz scores (Self-Healing Migration)
const ensureSchema = async () => {
    try {
        await pool.query(`
      ALTER TABLE user_topic_progress 
      ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0;
    `);
    } catch (err) {
        console.error("Schema migration warning:", err.message);
    }
};

export const checkTopicAccess = async (req, res) => {
    await ensureSchema();

    const userId = req.user.id;
    const { topicId } = req.params;

    if (!topicId || topicId === 'undefined' || isNaN(Number(topicId))) {
        return res.status(400).json({ message: 'Invalid topic ID' });
    }

    try {
        // 1. Get Course ID for this topic
        const topicRes = await pool.query("SELECT course_id, id FROM topics WHERE id = $1", [topicId]);
        if (topicRes.rows.length === 0) return res.status(404).json({ message: "Topic node not found." });

        const { course_id } = topicRes.rows[0];

        // 2. Get all topics for this course ordered by ID
        const allTopicsRes = await pool.query("SELECT id FROM topics WHERE course_id = $1 ORDER BY id ASC", [course_id]);
        const allTopics = allTopicsRes.rows;

        // 3. Find index
        const currentIndex = allTopics.findIndex(t => t.id === parseInt(topicId));

        // If first topic, always accessible
        if (currentIndex <= 0) {
            return res.json({ locked: false, message: "Foundation protocol active." });
        }

        // 4. Check previous topic status
        const prevTopicId = allTopics[currentIndex - 1].id;
        const progressRes = await pool.query(
            "SELECT quiz_score, completed FROM user_topic_progress WHERE user_id = $1 AND topic_id = $2",
            [userId, prevTopicId]
        );

        const prevScore = progressRes.rows[0]?.quiz_score || 0;
        // const prevCompleted = progressRes.rows[0]?.completed || false; // Optional strictness

        if (prevScore >= 70) {
            res.json({ locked: false, message: "Clearance granted." });
        } else {
            res.json({
                locked: true,
                message: "Clearance denied. Previous module assessment < 70%.",
                reqScore: 70,
                yourPrevScore: prevScore,
                prevTopicId
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Access control malfunction." });
    }
};

export const submitQuizResult = async (req, res) => {
    await ensureSchema();

    const userId = req.user.id;
    const { topicId, score } = req.body;

    if (!topicId || topicId === 'undefined' || isNaN(Number(topicId))) {
        return res.status(400).json({ message: 'Invalid topic ID' });
    }

    try {
        // Upsert progress
        await pool.query(`
       INSERT INTO user_topic_progress (user_id, topic_id, quiz_score, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, topic_id)
       DO UPDATE SET quiz_score = GREATEST(user_topic_progress.quiz_score, $3), completed = true
     `, [userId, topicId, score, score >= 70]);

        // Award XP if > 70
        if (score >= 70) {
            await pool.query(
                "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'QUIZ_PASSED', 20)",
                [userId]
            );
            await pool.query(
                "UPDATE user_stats SET contribution_score = contribution_score + 20 WHERE user_id = $1",
                [userId]
            );
        }

        res.json({ message: "Assessment processed.", score });

        // Trigger real-time map update
        emitToRoom(userId, "KNOWLEDGE_MAP_UPDATE", { topicId, score });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Grading protocol failed." });
    }
};
