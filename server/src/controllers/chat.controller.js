import pool from "../config/db.js";
import { emitToRoom, emitToUser } from "../lib/io.js";

// Get all available rooms
export const getRooms = async (req, res) => {
    const { courseId, topicId } = req.query;
    try {
        const result = await pool.query(`
            SELECT r.*, 
                COUNT(DISTINCT cm.user_id) as member_count,
                COUNT(DISTINCT CASE WHEN cm.is_voice_active = TRUE THEN cm.user_id END) as voice_count
            FROM chat_rooms r
            LEFT JOIN chat_members cm ON r.id = cm.room_id
            WHERE ($1::integer IS NULL OR r.course_id = $1)
            AND ($2::integer IS NULL OR r.topic_id = $2)
            GROUP BY r.id
            ORDER BY r.type DESC, r.created_at ASC
        `, [courseId || null, topicId || null]);
        res.json(result.rows);
    } catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({ message: "Failed to fetch rooms" });
    }
};

// Create a new room
export const createRoom = async (req, res) => {
    const { name, type, password, courseId, topicId } = req.body; // type: 'public', 'private', 'dm'
    const adminId = req.user.id;

    try {
        const result = await pool.query(
            "INSERT INTO chat_rooms (name, type, password, admin_id, course_id, topic_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, type || 'public', password || null, adminId, courseId || null, topicId || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Failed to create room" });
    }
};

// Join a room (update presence)
export const joinRoom = async (req, res) => {
    const { roomId } = req.params;
    const { password } = req.body;
    const userId = req.user.id;

    try {
        const roomResult = await pool.query("SELECT * FROM chat_rooms WHERE id = $1", [roomId]);
        const room = roomResult.rows[0];

        if (room && room.type === 'private' && room.password !== password) {
            return res.status(403).json({ message: "Incorrect password for this private sector." });
        }

        // Add to new room
        await pool.query(
            "INSERT INTO chat_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT (room_id, user_id) DO UPDATE SET joined_at = CURRENT_TIMESTAMP",
            [roomId, userId]
        );
        res.json({ message: "Joined room" });
    } catch (error) {
        console.error("Join room error:", error);
        res.status(500).json({ message: "Failed to join room" });
    }
};

// Start or Get DM Room
export const startDirectMessage = async (req, res) => {
    const { peerId } = req.body;
    const userId = req.user.id;

    try {
        const u1 = Math.min(userId, peerId);
        const u2 = Math.max(userId, peerId);
        const dmName = `DM-${u1}-${u2}`;

        let roomResult = await pool.query("SELECT * FROM chat_rooms WHERE name = $1 AND type = 'dm'", [dmName]);
        let room = roomResult.rows[0];

        if (!room) {
            const newRoom = await pool.query(
                "INSERT INTO chat_rooms (name, type, admin_id) VALUES ($1, 'dm', $2) RETURNING *",
                [dmName, userId]
            );
            room = newRoom.rows[0];

            // Add both users to the DM room
            await pool.query("INSERT INTO chat_members (room_id, user_id) VALUES ($1, $2), ($1, $3) ON CONFLICT DO NOTHING", [room.id, userId, peerId]);
        }

        res.json(room);
    } catch (error) {
        console.error("Start DM error:", error);
        res.status(500).json({ message: "Failed to start direct message" });
    }
};

// Get messages for a room
export const getRoomMessages = async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await pool.query(`
            SELECT m.*, u.username as sender_name, u.avatar_url as sender_avatar
            FROM synaptic_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.room_id = $1
            ORDER BY m.created_at ASC
            LIMIT 100
        `, [roomId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    const { roomId } = req.params;
    const { text, attachmentUrl, attachmentType } = req.body;
    const senderId = req.user.id;

    try {
        const result = await pool.query(
            "INSERT INTO synaptic_messages (room_id, sender_id, text, attachment_url, attachment_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [parseInt(roomId), senderId, text || '', attachmentUrl, attachmentType]
        );

        const fullMsg = await pool.query(`
            SELECT m.*, u.username as sender_name, u.avatar_url as sender_avatar
            FROM synaptic_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = $1
        `, [result.rows[0].id]);

        const messageData = fullMsg.rows[0];

        // Emit to socket room
        emitToRoom(roomId, "new_message", messageData);

        res.status(201).json(messageData);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// Toggle Voice Status
export const toggleVoice = async (req, res) => {
    const { roomId } = req.params;
    const { isVoiceActive } = req.body;
    const userId = req.user.id;

    try {
        await pool.query(
            "UPDATE chat_members SET is_voice_active = $1 WHERE room_id = $2 AND user_id = $3",
            [isVoiceActive, roomId, userId]
        );

        emitToRoom(roomId, "voice_update", { userId, isVoiceActive });
        res.json({ message: "Voice status updated" });
    } catch (error) {
        console.error("Voice toggle error:", error);
        res.status(500).json({ message: "Failed to update voice status" });
    }
};

// Get members in a room
export const getRoomMembers = async (req, res) => {
    const { roomId } = req.params;
    try {
        const result = await pool.query(`
            SELECT u.id, u.username, u.avatar_url, cm.is_voice_active
            FROM chat_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.room_id = $1
            ORDER BY cm.is_voice_active DESC, u.username ASC
        `, [roomId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Get members error:", error);
        res.status(500).json({ message: "Failed to fetch members" });
    }
};

// Invite a user to a room
export const inviteUser = async (req, res) => {
    const { roomId } = req.params;
    const { targetUserId } = req.body;
    const senderId = req.user.id;

    try {
        const senderRes = await pool.query("SELECT username FROM users WHERE id = $1", [senderId]);
        const senderName = senderRes.rows[0].username;

        const roomRes = await pool.query("SELECT name FROM chat_rooms WHERE id = $1", [roomId]);
        const roomName = roomRes.rows[0].name;

        emitToUser(targetUserId, "receive_invite", {
            roomId,
            roomName,
            senderId,
            senderName,
            message: `${senderName} invited you to join ${roomName}`
        });

        res.json({ message: "Invitation sent" });
    } catch (error) {
        console.error("Invite error:", error);
        res.status(500).json({ message: "Failed to send invitation" });
    }
};
