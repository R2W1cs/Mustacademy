import pool from "../config/db.js";
import { getIo, emitToUser } from "../lib/io.js";

// Ensure schema supports peer videos with reactions and feedback
const ensureSchema = async () => {
    try {
        // Main videos table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS peer_videos (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                course_id INTEGER REFERENCES courses(id),
                title TEXT NOT NULL,
                video_url TEXT NOT NULL,
                description TEXT,
                uploader_note TEXT,
                likes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration: Add uploader_note if missing
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='peer_videos' AND column_name='uploader_note') THEN
                    ALTER TABLE peer_videos ADD COLUMN uploader_note TEXT;
                END IF;
            END $$;
        `);

        // Migration: Add rating to video_feedback if missing
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='video_feedback' AND column_name='rating') THEN
                    ALTER TABLE video_feedback ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
                END IF;
            END $$;
        `);

        // Migration: Add is_public boolean if missing
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='peer_videos' AND column_name='is_public') THEN
                    ALTER TABLE peer_videos ADD COLUMN is_public BOOLEAN DEFAULT true;
                END IF;
            END $$;
        `);

        // Video reactions table (one reaction per user per video)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS video_reactions (
                id SERIAL PRIMARY KEY,
                video_id INTEGER REFERENCES peer_videos(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(video_id, user_id)
            );
        `);

        // Video feedback table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS video_feedback (
                id SERIAL PRIMARY KEY,
                video_id INTEGER REFERENCES peer_videos(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                feedback_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                related_id INTEGER,
                read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (err) {
        console.error("Schema migration warning:", err.message);
    }
};

export const getCourseVideos = async (req, res) => {
    await ensureSchema();
    const { courseId } = req.params;
    const userId = req.user.id;
    console.log(`[DEBUG] getCourseVideos called by User ID: ${userId} for Course ID: ${courseId}`);

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

        if (result.rows.length > 0) {
            console.log(`[DEBUG] Video 0: ID=${result.rows[0].id}, Title=${result.rows[0].title}, OwnerID=${result.rows[0].user_id}, is_uploader=${result.rows[0].is_uploader}`);
        }

        res.json(result.rows);
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
    await ensureSchema();
    const userId = req.user.id;
    const { courseId, title, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "No neural transmission (file) detected." });
    }

    // Normalize path for URL (windows backslashes to forward slashes)
    const videoUrl = `/uploads/videos/${file.filename}`;

    try {
        const result = await pool.query(`
            INSERT INTO peer_videos (user_id, course_id, title, video_url, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, courseId, title, videoUrl, description]);

        // Award +10 ASC
        await pool.query(
            "INSERT INTO user_contributions (user_id, action_type, points) VALUES ($1, 'VIDEO_UPLOAD', 10)",
            [userId]
        );
        await pool.query(
            "UPDATE user_stats SET contribution_score = contribution_score + 10 WHERE user_id = $1",
            [userId]
        );

        // Notify all colleagues (everyone except uploader)
        const colleagues = await pool.query("SELECT id FROM users WHERE id != $1", [userId]);
        const uploader = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
        const uploaderName = uploader.rows[0].name;

        const broadcastPromises = colleagues.rows.map(async (colleague) => {
            const msg = `${uploaderName} established a new knowledge uplink: "${title}"`;
            await pool.query(
                "INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, 'NEW_VIDEO', $2, $3)",
                [colleague.id, msg, result.rows[0].id]
            );
            // Real-time emit
            emitToUser(colleague.id, "notification_received", {
                type: 'NEW_VIDEO',
                message: msg,
                related_id: result.rows[0].id,
                created_at: new Date()
            });
        });

        await Promise.all(broadcastPromises);

        res.status(201).json({ message: "Transmission received. +10 ASC awarded.", video: result.rows[0] });
    } catch (err) {
        console.error("Video upload database error:", err);
        res.status(500).json({ message: `Transmission upload failed: ${err.message}` });
    }
};

export const likeVideo = async (req, res) => {
    await ensureSchema();
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
            // Create notification for video owner
            const liker = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
            const msg = `${liker.rows[0].name} endorsed your transmission "${videoOwner.rows[0].title}"`;
            await pool.query(
                "INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, 'VIDEO_LIKE', $2, $3)",
                [videoOwner.rows[0].user_id, msg, videoId]
            );
            // Real-time emit
            emitToUser(videoOwner.rows[0].user_id, "notification_received", {
                type: 'VIDEO_LIKE',
                message: msg,
                related_id: videoId,
                created_at: new Date()
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
    await ensureSchema();
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
            // Create notification for video owner
            const feedbacker = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
            const msg = `${feedbacker.rows[0].name} provided scholarly feedback on "${videoOwnerCheck.rows[0].title}"`;
            await pool.query(
                "INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, 'VIDEO_FEEDBACK', $2, $3)",
                [videoOwnerCheck.rows[0].user_id, msg, videoId]
            );
            // Real-time emit
            emitToUser(videoOwnerCheck.rows[0].user_id, "notification_received", {
                type: 'VIDEO_FEEDBACK',
                message: msg,
                related_id: videoId,
                created_at: new Date()
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

import fs from 'fs';
import path from 'path';

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

        // Attempt to delete physical file
        if (video.video_url) {
            try {
                // video_url is something like '/uploads/videos/filename.mp4'
                const filePath = path.join(path.resolve(), video.video_url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fsErr) {
                console.error("Failed to delete physical video file:", fsErr);
            }
        }

        res.json({ message: "Transmission successfully deleted." });
    } catch (err) {
        console.error("Failed to delete video:", err);
        res.status(500).json({ message: "An error occurred while deleting the transmission." });
    }
};

