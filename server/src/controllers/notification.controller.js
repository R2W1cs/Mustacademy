import pool from "../config/db.js";

export const getMyNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Failed to fetch notifications:", err);
        res.status(500).json({ message: "Notification system offline." });
    }
};

export const markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    try {
        await pool.query(
            "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        res.json({ message: "Transmission acknowledged." });
    } catch (err) {
        console.error("Failed to mark notification as read:", err);
        res.status(500).json({ message: "Acknowledgment failed." });
    }
};

export const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await pool.query(
            "UPDATE notifications SET read = true WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "All transmissions acknowledged." });
    } catch (err) {
        console.error("Failed to mark all as read:", err);
        res.status(500).json({ message: "Mass acknowledgment failed." });
    }
};
