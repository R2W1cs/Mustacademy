import pool from "../config/db.js";

// --- THREADS ---

export const getThreads = async (req, res) => {
    const { courseId, topicId, search, cursor, limit = 10 } = req.query;

    try {
        let query = `
            SELECT 
                ft.*, 
                u.username, 
                u.avatar_url,
                t.title as topic_title,
                c.name as course_name,
                (SELECT COUNT(*) FROM forum_comments fc WHERE fc.thread_id = ft.id) as comment_count,
                (SELECT COUNT(*) FROM forum_upvotes fu WHERE fu.thread_id = ft.id) as upvote_count
            FROM forum_threads ft
            JOIN users u ON ft.user_id = u.id
            LEFT JOIN topics t ON ft.topic_id = t.id
            LEFT JOIN courses c ON t.course_id = c.id
            WHERE ft.status = 'active'
        `;

        const params = [];
        let paramIdx = 1;

        if (courseId) {
            query += ` AND c.id = $${paramIdx++}`;
            params.push(courseId);
        }
        if (topicId) {
            query += ` AND t.id = $${paramIdx++}`;
            params.push(topicId);
        }
        if (search) {
            query += ` AND (to_tsvector('english', ft.title || ' ' || ft.content) @@ plainto_tsquery('english', $${paramIdx++}))`;
            params.push(search);
        }
        if (cursor) {
            query += ` AND ft.created_at < $${paramIdx++}`;
            params.push(new Date(cursor));
        }

        query += ` ORDER BY ft.created_at DESC LIMIT $${paramIdx}`;
        params.push(parseInt(limit));

        const result = await pool.query(query, params);

        res.json({
            threads: result.rows,
            nextCursor: result.rows.length === parseInt(limit) ? result.rows[result.rows.length - 1].created_at : null
        });
    } catch (err) {
        console.error("Failed to fetch threads:", err);
        res.status(500).json({ message: "Network failure in the synaptic grid." });
    }
};

export const createThread = async (req, res) => {
    const userId = req.user.id;
    const { title, content, topicId, type = 'discussion' } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO forum_threads (title, content, user_id, topic_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, content, userId, topicId, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Failed to create thread:", err);
        res.status(500).json({ message: "Failed to broadcast thread pulse." });
    }
};

export const getThreadDetails = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;

    try {
        // 1. Get Thread Info
        const threadRes = await pool.query(`
            SELECT 
                ft.*, 
                u.username, 
                u.avatar_url,
                t.title as topic_title,
                (SELECT COUNT(*) FROM forum_upvotes fu WHERE fu.thread_id = ft.id) as upvote_count,
                EXISTS(SELECT 1 FROM forum_upvotes WHERE user_id = $1 AND thread_id = ft.id) as user_has_upvoted
            FROM forum_threads ft
            JOIN users u ON ft.user_id = u.id
            LEFT JOIN topics t ON ft.topic_id = t.id
            WHERE ft.id = $2
        `, [currentUserId, id]);

        if (threadRes.rows.length === 0) return res.status(404).json({ message: "Thread not found." });

        // 2. Get Comments (Nested structure handled in frontend or recursive SQL?)
        // Let's do a flat list for now and let the frontend build the tree
        const commentsRes = await pool.query(`
            SELECT 
                fc.*, 
                u.username, 
                u.avatar_url,
                (SELECT COUNT(*) FROM forum_upvotes fu WHERE fu.comment_id = fc.id) as upvote_count,
                EXISTS(SELECT 1 FROM forum_upvotes WHERE user_id = $1 AND comment_id = fc.id) as user_has_upvoted
            FROM forum_comments fc
            JOIN users u ON fc.user_id = u.id
            WHERE fc.thread_id = $2 AND fc.status = 'active'
            ORDER BY fc.created_at ASC
        `, [currentUserId, id]);

        res.json({
            thread: threadRes.rows[0],
            comments: commentsRes.rows
        });
    } catch (err) {
        console.error("Failed to fetch thread details:", err);
        res.status(500).json({ message: "Integrity error in the thread node." });
    }
};

// --- COMMENTS ---

export const createComment = async (req, res) => {
    const userId = req.user.id;
    const { threadId, content, parentCommentId } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO forum_comments (thread_id, user_id, content, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [threadId, userId, content, parentCommentId]
        );

        // Update thread last_activity_at
        await pool.query("UPDATE forum_threads SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1", [threadId]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Failed to post comment:", err);
        res.status(500).json({ message: "Failed to propagate comment pulse." });
    }
};

// --- UPVOTES ---

export const toggleUpvote = async (req, res) => {
    const userId = req.user.id;
    const { threadId, comment_id } = req.body; // comment_id can be null

    try {
        const checkRes = await pool.query(
            "SELECT id FROM forum_upvotes WHERE user_id = $1 AND (thread_id = $2 OR comment_id = $3)",
            [userId, threadId, comment_id]
        );

        if (checkRes.rows.length > 0) {
            await pool.query("DELETE FROM forum_upvotes WHERE id = $1", [checkRes.rows[0].id]);
            return res.json({ upvoted: false });
        } else {
            await pool.query(
                "INSERT INTO forum_upvotes (user_id, thread_id, comment_id) VALUES ($1, $2, $3)",
                [userId, threadId, comment_id]
            );
            return res.json({ upvoted: true });
        }
    } catch (err) {
        console.error("Upvote toggle failure:", err);
        res.status(500).json({ message: "Synaptic endorsement failed." });
    }
};
