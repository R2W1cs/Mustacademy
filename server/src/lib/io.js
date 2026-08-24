import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import MultiplayerGameManager from "./MultiplayerGameManager.js";
import pool from "../config/db.js";
import logger from "../utils/logger.js";
import { ACCESS_COOKIE } from "../utils/authCookies.js";
function getAllowedOrigins() {
    if (process.env.NODE_ENV === 'production') {
        return process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];
    }
    const devOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ];
    if (process.env.FRONTEND_URL && !devOrigins.includes(process.env.FRONTEND_URL)) {
        devOrigins.push(process.env.FRONTEND_URL);
    }
    return devOrigins;
}

let io;
let gameManager;

export const initIo = (server) => {
    io = new Server(server, {
        // Under `/api` so the access cookie (historically path=/api) is also sent.
        path: '/api/socket.io',
        cors: {
            origin: getAllowedOrigins(),
            methods: ["GET", "POST", "OPTIONS"],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Sync-ID', 'x-sync-id']
        }
    });

    gameManager = new MultiplayerGameManager(io);

    const bindSocketUser = (socket, decoded, userName = "Scholar") => {
        const userId = String(decoded.id);
        socket.data.userId = userId;
        socket.data.userName = userName;
        socket.join(`user_${userId}`);
        gameManager.setOnline(userId, socket.id, userName);
        const users = Array.from(gameManager.onlineUsers.entries()).map(([id, u]) => ({ id, name: u.userName }));
        socket.emit("online_users_update", users);
        socket.emit("authenticated", { userId, userName });
        logger.info(`[SOCKET] User ${userId} (${userName}) authenticated.`);
    };

    const tokenFromHandshake = (socket) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        return cookies[ACCESS_COOKIE] || null;
    };

    io.on("connection", (socket) => {
        logger.info(`[SOCKET] User connected: ${socket.id}`);

        const handshakeToken = tokenFromHandshake(socket);
        if (handshakeToken) {
            try {
                const decoded = jwt.verify(handshakeToken, process.env.JWT_SECRET);
                bindSocketUser(socket, decoded);
            } catch {
                // Client may authenticate explicitly after refresh
            }
        }

        socket.on("authenticate", (data) => {
            const userName = (typeof data === 'object' ? data.userName : null) || "Scholar";
            // Already bound from handshake cookie — just refresh name / ack.
            if (socket.data.userId) {
                socket.data.userName = userName || socket.data.userName;
                socket.emit("authenticated", { userId: socket.data.userId, userName: socket.data.userName });
                return;
            }

            const token = (typeof data === 'object' ? data.token : null) || tokenFromHandshake(socket);

            if (!token) {
                socket.emit("auth_error", { message: "No token provided" });
                return;
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                bindSocketUser(socket, decoded, userName);
            } catch {
                socket.emit("auth_error", { message: "Invalid token" });
            }
        });

        const requireAuth = () => {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("auth_error", { message: "Not authenticated" });
                return null;
            }
            return userId;
        };

        socket.on("create_quiz_room", async ({ topic, forceNew }) => {
            const userId = requireAuth();
            if (!userId) return;
            const userName = socket.data.userName || 'Scholar';
            try {
                const room = await gameManager.findOrCreateRoom(userId, userName, topic, forceNew);
                socket.join(`room_${room.id}`);
                io.to(`room_${room.id}`).emit("player_joined", room.players);
                socket.emit("room_created", room);
                // Start quiz prep only after the host is in the room (so quiz_ready is received).
                if (room.quizStatus !== "ready") {
                    gameManager.prepareQuiz(room.id, room.topic);
                }
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("join_quiz_room", ({ roomId }) => {
            const userId = requireAuth();
            if (!userId) return;
            const userName = socket.data.userName || 'Scholar';
            try {
                const room = gameManager.joinRoom(roomId?.trim(), userId, userName);
                socket.join(`room_${room.id}`);
                io.to(`room_${room.id}`).emit("player_joined", room.players);
                socket.emit("joined_successfully", room);
                if (room.quizStatus === "ready") {
                    socket.emit("quiz_ready", {
                        roomId: room.id,
                        topic: room.topic,
                        questionCount: room.quiz?.questions?.length || 0,
                    });
                } else if (room.quizStatus === "generating") {
                    socket.emit("quiz_status", { roomId: room.id, status: "generating", topic: room.topic });
                }
            } catch (err) {
                socket.emit("join_failed", err.message);
            }
        });

        socket.on("toggle_ready", ({ roomId }) => {
            const userId = requireAuth();
            if (!userId) return;
            gameManager.toggleReady(roomId, userId);
        });

        socket.on("start_quiz", ({ roomId, config }) => {
            const userId = requireAuth();
            if (!userId) return;
            try {
                gameManager.startGame(roomId, userId, config || {});
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
        });

        socket.on("match_chat", ({ roomId, text }) => {
            const userId = requireAuth();
            if (!userId) return;
            const userName = socket.data.userName || 'Scholar';
            if (!roomId || !text?.trim()) return;
            if (!socket.rooms.has(`room_${roomId}`)) return;
            io.to(`room_${roomId}`).emit("match_chat", {
                userName,
                text: text.trim(),
                ts: Date.now()
            });
        });

        socket.on("submit_quiz_answer", ({ roomId, answerIndex }) => {
            const userId = requireAuth();
            if (!userId) return;
            gameManager.submitAnswer(roomId, userId, answerIndex);
        });

        socket.on("update_room_topic", async ({ roomId, topic }) => {
            const userId = requireAuth();
            if (!userId) return;
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

        socket.on("send_invitation", ({ targetUserId, roomId, topic }) => {
            const userId = requireAuth();
            if (!userId) return;
            const senderName = socket.data.userName || 'Scholar';
            logger.info(`[SOCKET] Invitation from ${senderName} to ${targetUserId} for room ${roomId}`);
            emitToUser(targetUserId, "receive_invitation", {
                senderName,
                roomId,
                topic
            });
        });

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
