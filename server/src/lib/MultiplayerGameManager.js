import { callOllama } from "../utils/aiClient.js";
import pool from "../config/db.js";

const K_FACTOR = 32;

function computeElo(playerRating, opponentAvgRating, score) {
    const expected = 1 / (1 + Math.pow(10, (opponentAvgRating - playerRating) / 400));
    return Math.round(playerRating + K_FACTOR * (score - expected));
}

class MultiplayerGameManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();
        this.onlineUsers = new Map(); // userId -> { socketId, userName }
        this.TIMER_DURATION = 15; // 15 seconds per question
        this.LOBBY_ROOM_PREFIX = "room_";
    }

    setOnline(userId, socketId, userName) {
        if (!userId) return;
        this.onlineUsers.set(userId, { socketId, userName });
        this.broadcastOnlineUsers();
    }

    removeOnline(socketId) {
        for (const [userId, data] of this.onlineUsers.entries()) {
            if (data.socketId === socketId) {
                this.onlineUsers.delete(userId);
                break;
            }
        }
        this.broadcastOnlineUsers();
    }

    broadcastOnlineUsers() {
        const users = Array.from(this.onlineUsers.entries()).map(([userId, u]) => ({ id: userId, name: u.userName }));
        this.io.emit("online_users_update", users);
    }

    async findOrCreateRoom(userId, userName, topic, forceNew = false) {
        const normalizedTopic = topic || "General CS";

        // Matchmaking: Only if not forcing a new room
        if (!forceNew) {
            for (const room of this.rooms.values()) {
                if (room.topic === normalizedTopic && room.status === "lobby" && room.players.length < 10) {
                    return this.joinRoom(room.id, userId, userName);
                }
            }
        }

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create lobby + PIN immediately. Quiz generation must not block the PIN.
        const room = {
            id: roomId,
            topic: normalizedTopic,
            quiz: null,
            quizStatus: "generating",
            players: [{ id: userId, name: userName, score: 0, streak: 0, loseStreak: 0, isReady: true, lastAnswered: -1 }],
            status: "lobby",
            currentQuestionIndex: -1,
            timer: null,
            timeRemaining: 0,
            firstCorrectUserId: null
        };

        this.rooms.set(roomId, room);
        console.log(`[ROOM] Created room: ${roomId} for topic ${normalizedTopic}`);
        // Caller must join the socket room, then call prepareQuiz so the host receives events.
        return room;
    }

    prepareQuiz(roomId, topic) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        room.quizStatus = "generating";
        this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("quiz_status", { roomId, status: "generating", topic });

        this.generateQuizData(topic)
            .then((quizData) => {
                const live = this.rooms.get(roomId);
                if (!live || live.status !== "lobby") return;
                live.quiz = quizData;
                live.quizStatus = "ready";
                this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("quiz_ready", {
                    roomId,
                    topic: live.topic,
                    questionCount: quizData?.questions?.length || 0,
                });
            })
            .catch((err) => {
                console.error(`[ROOM] Quiz prep failed for ${roomId}:`, err.message);
                const live = this.rooms.get(roomId);
                if (!live) return;
                live.quiz = this.fallbackQuiz(topic);
                live.quizStatus = "ready";
                this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("quiz_ready", {
                    roomId,
                    topic: live.topic,
                    questionCount: live.quiz.questions.length,
                    fallback: true,
                });
            });
    }

    fallbackQuiz(topic) {
        const label = topic || "Computer Science";
        return {
            questions: [
                {
                    text: `Which concept is most central to ${label}?`,
                    options: ["Core algorithms & data structures", "Only UI styling", "Printer drivers", "Spreadsheet macros"],
                    correctIndex: 0,
                    explanation: "Strong CS foundations start with algorithms and data structures.",
                },
                {
                    text: "What does Big-O notation primarily describe?",
                    options: ["Code style", "Asymptotic complexity", "Memory brand", "Git commit size"],
                    correctIndex: 1,
                    explanation: "Big-O estimates how runtime/space grow with input size.",
                },
                {
                    text: "Which structure is typically LIFO?",
                    options: ["Queue", "Stack", "Hash set", "B-Tree"],
                    correctIndex: 1,
                    explanation: "Stacks are last-in, first-out.",
                },
                {
                    text: "HTTP is primarily a protocol for:",
                    options: ["Disk formatting", "Client-server web communication", "CPU scheduling", "GPU shading"],
                    correctIndex: 1,
                    explanation: "HTTP defines request/response communication on the web.",
                },
                {
                    text: "A race condition is most associated with:",
                    options: ["Concurrent shared-state bugs", "CSS specificity", "DNS caching", "JPEG compression"],
                    correctIndex: 0,
                    explanation: "Race conditions appear when concurrent access to shared state is unsynchronized.",
                },
            ],
        };
    }

    joinRoom(roomId, userId, userName) {
        const cleanRoomId = roomId?.trim()?.toUpperCase();
        console.log(`[ROOM] Attempting join: ${cleanRoomId} for user ${userId}`);
        const room = this.rooms.get(cleanRoomId);
        if (!room) {
            console.error(`[ROOM] Failed join: Room ${cleanRoomId} not found. Active rooms:`, Array.from(this.rooms.keys()));
            throw new Error("Room not found");
        }
        if (room.status !== "lobby") throw new Error("Game already in progress");
        if (room.players.length >= 10) throw new Error("Room full (v1 limit: 10)");

        const existing = room.players.find(p => p.id === userId);
        if (!existing) {
            room.players.push({ id: userId, name: userName, score: 0, streak: 0, loseStreak: 0, isReady: false, lastAnswered: -1 });
        }

        return room;
    }

    toggleReady(roomId, userId) {
        const cleanId = roomId?.trim()?.toUpperCase();
        const room = this.rooms.get(cleanId);
        if (!room) return;

        const player = room.players.find(p => String(p.id) === String(userId));
        if (player) {
            player.isReady = !player.isReady;
            this.io.to(this.LOBBY_ROOM_PREFIX + cleanId).emit("player_joined", room.players);
        }
    }

    async updateRoomTopic(roomId, topic, userId) {
        const room = this.rooms.get(roomId);
        if (!room) throw new Error("Room not found");
        if (room.players[0].id !== userId) throw new Error("Only host can change topic");
        if (room.status !== "lobby") throw new Error("Cannot change topic during game");

        room.topic = topic;
        room.quiz = null;
        room.quizStatus = "generating";
        this.prepareQuiz(roomId, topic);
        return room;
    }

    startGame(roomId, userId, config = {}) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Verify host (first player is the host)
        if (room.players[0].id !== userId) {
            throw new Error("Only the host can initiate the protocol.");
        }

        if (room.quizStatus !== "ready" || !room.quiz?.questions?.length) {
            throw new Error("Quiz is still generating. Wait for the PIN lobby to finish loading questions.");
        }

        // Apply host config
        if (config.timePerQuestion && [10, 15, 30].includes(config.timePerQuestion)) {
            room.timePerQuestion = config.timePerQuestion;
        }
        if (config.questionCount && [5, 10, 15].includes(config.questionCount)) {
            room.questionCount = config.questionCount;
        }

        room.status = "playing";
        this.nextQuestion(roomId);
    }

    nextQuestion(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.currentQuestionIndex++;

        const actualCount = room.quiz?.questions?.length || 0;
        const maxQuestions = Math.min(room.questionCount || actualCount, actualCount);
        if (room.currentQuestionIndex >= maxQuestions || maxQuestions === 0) {
            this.endGame(roomId);
            return;
        }

        const question = room.quiz.questions[room.currentQuestionIndex];
        if (!question) {
            this.endGame(roomId);
            return;
        }

        // Reset player answer tracking for new question
        room.players.forEach(p => p.lastAnswered = -1);

        room.timeRemaining = room.timePerQuestion || this.TIMER_DURATION;

        room.firstCorrectUserId = null;

        this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("question_started", {
            question: {
                text: question.text,
                options: question.options,
                index: room.currentQuestionIndex,
                total: maxQuestions
            },
            timeRemaining: room.timeRemaining,
            timePerQuestion: room.timePerQuestion || this.TIMER_DURATION
        });

        // Clear existing timer if any
        if (room.timer) clearInterval(room.timer);

        room.timer = setInterval(() => {
            room.timeRemaining--;
            if (room.timeRemaining <= 0) {
                clearInterval(room.timer);
                this.revealAnswer(roomId);
            } else {
                this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("timer_tick", room.timeRemaining);
            }
        }, 1000);
    }

    submitAnswer(roomId, userId, answerIndex) {
        const room = this.rooms.get(roomId);
        if (!room || room.status !== "playing") return;

        const player = room.players.find(p => p.id === userId);
        if (!player || player.lastAnswered !== -1) return; // Already answered or not in room

        player.lastAnswered = answerIndex;

        // Check if correct
        const question = room.quiz.questions[room.currentQuestionIndex];
        if (answerIndex === question.correctIndex) {
            // Scoring Formula: Base 500 + Speed Bonus (up to 500)
            const timerDuration = room.timePerQuestion || this.TIMER_DURATION;
            const speedBonus = Math.round((room.timeRemaining / timerDuration) * 500);
            let firstToFinishBonus = 0;

            // First to finish correct bonus (+200)
            if (!room.firstCorrectUserId) {
                room.firstCorrectUserId = userId;
                firstToFinishBonus = 200;
                player.wasFirst = true; // Temporary flag for this question
            } else {
                player.wasFirst = false;
            }

            player.score += (500 + speedBonus + firstToFinishBonus);
            player.streak++;
            player.loseStreak = 0; // Reset lose streak
        } else {
            player.streak = 0;
            player.loseStreak++;
            player.wasFirst = false;

            // Trigger meme alert on 3 consecutive wrong answers
            if (player.loseStreak === 3) {
                this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("meme_alert", {
                    playerName: player.name,
                    reason: "LOSE_STREAK"
                });
                player.loseStreak = 0; // Reset after trigger to allow re-trigger at 6, etc? Or just stop.
            }
        }

        // Notify room that someone answered (but don't reveal what)
        this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("player_answered", {
            userId,
            isFirst: player.wasFirst,
            answeredCount: room.players.filter(p => p.lastAnswered !== -1).length
        });

        // If everyone answered, jump to reveal
        if (room.players.every(p => p.lastAnswered !== -1)) {
            clearInterval(room.timer);
            this.revealAnswer(roomId);
        }
    }

    revealAnswer(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const question = room.quiz?.questions?.[room.currentQuestionIndex];
        if (!question) { this.endGame(roomId); return; }

        this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("answer_revealed", {
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            leaderboard: [...room.players].sort((a, b) => b.score - a.score)
        });

        // Set timeout for next question
        setTimeout(() => {
            this.nextQuestion(roomId);
        }, 5000); // 5 second pause to see leaderboard
    }

    async endGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.status = "finished";

        const sorted = [...room.players].sort((a, b) => b.score - a.score);

        this.io.to(this.LOBBY_ROOM_PREFIX + roomId).emit("game_finished", {
            leaderboard: sorted
        });

        // Persist ELO updates (only for authenticated users with numeric IDs)
        if (sorted.length >= 2) {
            try {
                // Fetch current ELO ratings for all players
                const userIds = sorted.map(p => p.id).filter(id => !isNaN(Number(id)));
                if (userIds.length >= 2) {
                    const { rows } = await pool.query(
                        `SELECT id, elo_rating FROM users WHERE id = ANY($1::int[])`,
                        [userIds]
                    );
                    const ratingMap = Object.fromEntries(rows.map(r => [String(r.id), r.elo_rating || 1200]));

                    const avgRating = Object.values(ratingMap).reduce((a, b) => a + b, 0) / Object.values(ratingMap).length;
                    const totalPlayers = sorted.length;

                    for (let i = 0; i < sorted.length; i++) {
                        const player = sorted[i];
                        if (isNaN(Number(player.id))) continue;
                        const currentElo = ratingMap[player.id] || 1200;
                        // Score: 1 for top half, 0 for bottom half (simple rank-based)
                        const outcome = i < totalPlayers / 2 ? 1 : 0;
                        const newElo = computeElo(currentElo, avgRating, outcome);
                        await pool.query(
                            'UPDATE users SET elo_rating = $1 WHERE id = $2',
                            [newElo, Number(player.id)]
                        );
                    }
                }
            } catch (err) {
                console.error('[GameManager] ELO update failed:', err.message);
            }
        }

        // Clean up room after 1 minute
        setTimeout(() => {
            if (room.timer) clearInterval(room.timer);
            this.rooms.delete(roomId);
        }, 60000);
    }

    async generateQuizData(topic, count = 10) {
        const prompt = `Generate a rigorous CS Quiz for Multiplayer.
        Topic: ${topic || "Computer Science"}
        Count: ${count} Questions (generate all ${count}, host may use fewer).
        Return ONLY VALID JSON:
        {
            "questions": [
                {
                    "text": "...",
                    "options": ["A", "B", "C", "D"],
                    "correctIndex": 0,
                    "explanation": "..."
                }
            ]
        }`;

        try {
            const data = await callOllama(prompt);
            if (Array.isArray(data?.questions) && data.questions.length > 0) {
                return data;
            }
            if (Array.isArray(data) && data.length > 0 && data[0]?.text) {
                return { questions: data };
            }
            throw new Error("AI returned no quiz questions");
        } catch (err) {
            console.warn("[ROOM] Using fallback quiz:", err.message);
            return this.fallbackQuiz(topic);
        }
    }
}

export default MultiplayerGameManager;
