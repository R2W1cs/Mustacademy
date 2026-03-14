import { Server } from "socket.io";
import MultiplayerGameManager from "./MultiplayerGameManager.js";

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
            credentials: true
        }
    });

    gameManager = new MultiplayerGameManager(io);

    io.on("connection", (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        socket.on("authenticate", (data) => {
            const userId = typeof data === 'object' ? data.userId : data;
            const userName = typeof data === 'object' ? data.userName : "Scholar";

            if (userId) {
                socket.join(`user_${userId}`);
                gameManager.setOnline(userId, socket.id, userName);

                // Immediately send current list to this user
                const users = Array.from(gameManager.onlineUsers.entries()).map(([id, u]) => ({ id, name: u.userName }));
                socket.emit("online_users_update", users);

                console.log(`[SOCKET] User ${userId} (${userName}) authenticated and online.`);
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

        socket.on("start_quiz", ({ roomId, userId }) => {
            try {
                gameManager.startGame(roomId, userId);
            } catch (err) {
                socket.emit("error", { message: err.message });
            }
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
            console.log(`[SOCKET] Invitation from ${senderName} to ${targetUserId} for room ${roomId}`);
            emitToUser(targetUserId, "receive_invitation", {
                senderName,
                roomId,
                topic
            });
        });

        socket.on("disconnect", () => {
            gameManager.removeOnline(socket.id);
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
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
