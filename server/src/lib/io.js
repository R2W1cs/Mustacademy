import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import MultiplayerGameManager from "./MultiplayerGameManager.js";
import pool from "../config/db.js";
import logger from "../utils/logger.js";

let io;
let gameManager;

export const initIo = (server) => {
    const allowedOrigins = [
        "https://mustacademy.vercel.app",
        "https://mustacademy-frontend.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
    ];

    if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST", "OPTIONS"],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Sync-ID', 'x-sync-id']
        }
    });

    gameManager = new MultiplayerGameManager(io);

    io.on("connection", (socket) => {
        logger.info(`[SOCKET] User connected: ${socket.id}`);

        socket.on("authenticate", (data) => {
            const token = typeof data === 'object' ? data.token : null;
            const userName = (typeof data === 'object' ? data.userName : null) || "Scholar";

            if (!token) {
                socket.emit("auth_error", { message: "No token provided" });
                return;
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = String(decoded.id);
                socket.data.userId = userId;
                socket.data.userName = userName;

                socket.join(`user_${userId}`);
                gameManager.setOnline(userId, socket.id, userName);

                const users = Array.from(gameManager.onlineUsers.entries()).map(([id, u]) => ({ id, name: u.userName }));
                socket.emit("online_users_update", users);

                logger.info(`[SOCKET] User ${userId} (${userName}) authenticated.`);
            } catch {
                socket.emit("auth_error", { message: "Invalid token" });
            }
        });

        // --- MULTIPLAYER QUIZ EVENTS ---

        socket.on("create_quiz_room", async ({ userId, userName, topic, forceNew }) => {
            try {
                const room = await gameManager.findOrCreateRoom(userId, userName, topic, forceNew);
                socket.join(`room_${room.id}`);

                // Notify if others were already in there (matchmaking scenario)
                io.to(`room_${room.id}`).emit("player_joined", room.players);

                socket.emit("room_created", room);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("join_quiz_room", ({ roomId, userId, userName }) => {
            try {
                const room = gameManager.joinRoom(roomId?.trim(), userId, userName);
                // USE room.id (normalized) instead of raw roomId
                socket.join(`room_${room.id}`);
                io.to(`room_${room.id}`).emit("player_joined", room.players);
                socket.emit("joined_successfully", room);
            } catch (err) {
                socket.emit("join_failed", err.message);
            }
        });

        socket.on("toggle_ready", ({ roomId, userId }) => {
            gameManager.toggleReady(roomId, userId);
        });

        socket.on("start_quiz", ({ roomId, userId, config }) => {
            try {
                gameManager.startGame(roomId, userId, config || {});
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("match_chat", ({ roomId, text }) => {
            const userName = socket.data.userName || 'Scholar';
            if (!roomId || !text?.trim()) return;
            io.to(`room_${roomId}`).emit("match_chat", {
                userName,
                text: text.trim(),
                ts: Date.now()
            });
        });

        socket.on("submit_quiz_answer", ({ roomId, userId, answerIndex }) => {
            gameManager.submitAnswer(roomId, userId, answerIndex);
        });

        socket.on("update_room_topic", async ({ roomId, topic, userId }) => {
            try {
                const updatedRoom = await gameManager.updateRoomTopic(roomId, topic, userId);
                io.to(`room_${roomId}`).emit("room_updated", updatedRoom);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("get_online_users", () => {
            gameManager.broadcastOnlineUsers();
        });

        socket.on("send_invitation", ({ targetUserId, senderName, roomId, topic }) => {
            logger.info(`[SOCKET] Invitation from ${senderName} to ${targetUserId} for room ${roomId}`);
            emitToUser(targetUserId, "receive_invitation", {
                senderName,
                roomId,
                topic
            });
        });

        // --- SQUAD CHAT EVENTS ---

        socket.on("join_squad_room", ({ projectId }) => {
            if (!projectId || !socket.data.userId) return;
            socket.join(`squad_${projectId}`);
            socket.to(`squad_${projectId}`).emit("squad_user_joined", {
                userId: socket.data.userId,
                userName: socket.data.userName
            });
        });

        socket.on("squad_message", async ({ projectId, text }) => {
            const userId = socket.data.userId;
            const userName = socket.data.userName || 'Scholar';
            if (!userId || !projectId || !text?.trim()) return;
            const msg = { userId, userName, text: text.trim(), ts: Date.now() };
            io.to(`squad_${projectId}`).emit("squad_message", msg);
            try {
                await pool.query(
                    'INSERT INTO squad_messages (project_id, user_id, user_name, text) VALUES ($1, $2, $3, $4)',
                    [projectId, userId, userName, text.trim()]
                );
            } catch (err) {
                logger.error('[SOCKET] Failed to persist squad message:', { err: err.message });
            }
        });

        socket.on("leave_squad_room", ({ projectId }) => {
            if (!projectId) return;
            socket.leave(`squad_${projectId}`);
        });

        socket.on("disconnect", () => {
            gameManager.removeOnline(socket.id);
            logger.info(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export const emitToRoom = (roomId, event, data) => {
    if (io) {
        io.to(`room_${roomId}`).emit(event, data);
    }
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};
