import pool from "../config/db.js";
import { storeVideo, removeStoredVideo } from "../services/objectStorage.service.js";
import { resolveMediaFields } from "../utils/mediaUrl.js";
import {
    notifyColleaguesOfNewVideo,
    notifyVideoOwner,
} from "../services/videoNotification.service.js";

export const getCourseVideos = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT 
                v.*, 
                u.name as author_name, 
                u.avatar_url,
                (SELECT COUNT(*) FROM video_reactions WHERE video_id = v.id) as likes,
                EXISTS(SELECT 1 FROM video_reactions WHERE video_id = v.id AND user_id = $2) as user_liked,
                (v.user_id = $2) as is_uploader
            FROM peer_videos v
            JOIN users u ON v.user_id = u.id
            WHERE v.course_id = $1 AND (v.is_public = true OR v.user_id = $2)
            ORDER BY (SELECT COUNT(*) FROM video_reactions WHERE video_id = v.id) DESC, v.created_at DESC
        `, [courseId, userId]);

        res.json(result.rows.map((row) => resolveMediaFields(row)));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Video retrieval malfunction." });
    }
};

export const toggleVisibility = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        const videoRes = await pool.query("SELECT is_public FROM peer_videos WHERE id = $1 AND user_id = $2", [videoId, userId]);
        if (videoRes.rows.length === 0) {
            return res.status(403).json({ message: "Not authorized to change visibility." });
        }

        const newStatus = !videoRes.rows[0].is_public;
        await pool.query("UPDATE peer_videos SET is_public = $1 WHERE id = $2", [newStatus, videoId]);

        res.json({
            message: newStatus ? "Transmission is now visible to peers." : "Transmission is now hidden from peers.",
            is_public: newStatus
        });
    } catch (err) {
        console.error("Toggle visibility error:", err);
        res.status(500).json({ message: "Failed to update visibility." });
    }
};

export const uploadVideo = async (req, res) => {
    const userId = req.user.id;
    const { courseId, title, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "No neural transmission (file) detected." });
    }

    let stored;
    try {
        stored = await storeVideo(file);
    } catch (storageErr) {
        console.error("Video storage error:", storageErr);
        return res.status(500).json({ message: "Failed to store video file." });
    }

    try {
        const result = await pool.query(`
            INSERT INTO peer_videos (user_id, course_id, title, video_url, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, courseId, title, stored.url, description]);

        // Award +10 ASC
        await pool.query(
            "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'VIDEO_UPLOAD', 10)",
            [userId]
        );
        await pool.query(
            "UPDATE user_stats SET contribution_score = contribution_score + 10 WHERE user_id = $1",
            [userId]
        );

        const uploader = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
        await notifyColleaguesOfNewVideo({
            uploaderId: userId,
            uploaderName: uploader.rows[0].name,
            title,
            videoId: result.rows[0].id,
        });

        res.status(201).json({
            message: "Transmission received. +10 ASC awarded.",
            video: resolveMediaFields(result.rows[0]),
        });
    } catch (err) {
        console.error("Video upload database error:", err);
        res.status(500).json({ message: `Transmission upload failed: ${err.message}` });
    }
};

export const likeVideo = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user already liked this video
        const existing = await pool.query(
            "SELECT id FROM video_reactions WHERE video_id = $1 AND user_id = $2",
            [videoId, userId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "You have already endorsed this transmission." });
        }

        // Add reaction
        await pool.query(
            "INSERT INTO video_reactions (video_id, user_id) VALUES ($1, $2)",
            [videoId, userId]
        );

        // Get video owner for notification
        const videoOwner = await pool.query(
            "SELECT user_id, title FROM peer_videos WHERE id = $1",
            [videoId]
        );

        if (videoOwner.rows.length > 0 && videoOwner.rows[0].user_id !== userId) {
            const liker = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
            const msg = `${liker.rows[0].name} endorsed your transmission "${videoOwner.rows[0].title}"`;
            await notifyVideoOwner({
                ownerId: videoOwner.rows[0].user_id,
                type: 'VIDEO_LIKE',
                message: msg,
                relatedId: videoId,
            });
        }

        // Get updated like count
        const count = await pool.query(
            "SELECT COUNT(*) as likes FROM video_reactions WHERE video_id = $1",
            [videoId]
        );

        res.json({
            message: "Transmission endorsed.",
            likes: parseInt(count.rows[0].likes),
            userLiked: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Endorsement failed." });
    }
};

export const submitFeedback = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { feedback, rating } = req.body;

    if (!feedback || feedback.trim().length === 0) {
        return res.status(400).json({ message: "Feedback content required." });
    }

    // Validate rating (ignore if null/undefined)
    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Quality rating must be between 1 and 5 stars." });
    }

    try {
        // Check if user is the video owner for "Notes" functionality
        const videoOwnerCheck = await pool.query("SELECT user_id, title FROM peer_videos WHERE id = $1", [videoId]);
        const isOwner = videoOwnerCheck.rows.length > 0 && Number(videoOwnerCheck.rows[0].user_id) === Number(userId);

        if (isOwner) {
            // Update uploader note instead of adding feedback
            await pool.query(
                "UPDATE peer_videos SET uploader_note = $1 WHERE id = $2",
                [feedback, videoId]
            );
            return res.json({ message: "Note attached to transmission.", type: "NOTE_UPDATE" });
        }

        // Save normal feedback
        await pool.query(
            "INSERT INTO video_feedback (video_id, user_id, feedback_text, rating) VALUES ($1, $2, $3, $4)",
            [videoId, userId, feedback, rating || null]
        );

        if (videoOwnerCheck.rows.length > 0) {
            const feedbacker = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
            const msg = `${feedbacker.rows[0].name} provided scholarly feedback on "${videoOwnerCheck.rows[0].title}"`;
            await notifyVideoOwner({
                ownerId: videoOwnerCheck.rows[0].user_id,
                type: 'VIDEO_FEEDBACK',
                message: msg,
                relatedId: videoId,
            });
        }

        res.json({ message: "Feedback transmitted successfully." });
    } catch (err) {
        console.error("Feedback submission error:", err);
        res.status(500).json({ message: `Feedback transmission failed: ${err.message}` });
    }
};
export const getVideoFeedback = async (req, res) => {
    const { videoId } = req.params;
    try {
        const result = await pool.query(`
            SELECT f.*, u.name as reviewer_name, u.avatar_url 
            FROM video_feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.video_id = $1
            ORDER BY f.created_at DESC
        `, [videoId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve feedback loop data." });
    }
};

export const deleteVideo = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        // Only allow the uploader to delete the video
        const videoRes = await pool.query("SELECT * FROM peer_videos WHERE id = $1 AND user_id = $2", [videoId, userId]);

        if (videoRes.rows.length === 0) {
            return res.status(403).json({ message: "You are not authorized to delete this transmission." });
        }

        const video = videoRes.rows[0];

        // Delete from database
        await pool.query("DELETE FROM peer_videos WHERE id = $1", [videoId]);

        if (video.video_url) {
            try {
                await removeStoredVideo(video.video_url);
            } catch (fsErr) {
                console.error("Failed to delete stored video file:", fsErr);
            }
        }

        res.json({ message: "Transmission successfully deleted." });
    } catch (err) {
        console.error("Failed to delete video:", err);
        res.status(500).json({ message: "An error occurred while deleting the transmission." });
    }
};

