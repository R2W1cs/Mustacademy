import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Zap, Award, Brain, Clock, Rocket, Trophy, ChevronRight } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { runConfetti } from "../utils/confetti";
import { getAllCourses } from "../api/courses";

const MultiplayerQuizModal = ({ onClose, topic, action, joinCode }) => {
    const socket = useSocket();
    const [gameState, setGameState] = useState("lobby"); // lobby, question, leaderboard, finished
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [revealData, setRevealData] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [currentTopic, setCurrentTopic] = useState(topic || "General CS");

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Scholar";

    useEffect(() => {
        if (!room) {
            if (action === 'join' && joinCode) {
                socket.emit("join_quiz_room", { roomId: joinCode.trim(), userId, userName });
            } else {
                // Host or default matchmaking (forceNew if hosting)
                socket.emit("create_quiz_room", { userId, userName, topic, forceNew: action === 'host' });
            }

            // Initial fetch of online users
            socket.emit("get_online_users");
        }

        const handleRoomEntry = (roomData) => {
            console.log("[SOCKET] Entering room:", roomData.id, roomData.players);
            setRoom(roomData.id);
            setPlayers([...roomData.players]); // Force new array for state update
            setCurrentTopic(roomData.topic);
            setGameState("lobby");
        };

        socket.on("room_updated", (roomData) => {
            setCurrentTopic(roomData.topic);
            setPlayers([...roomData.players]);
        });

        if (action === 'host' || !action) {
            getAllCourses().then(res => setAvailableCourses(res.data)).catch(console.error);
        }

        socket.on("room_created", handleRoomEntry);
        socket.on("joined_successfully", handleRoomEntry);

        socket.on("join_failed", (error) => {
            console.error("Failed to join room:", error);
            alert(`Failed to join room: ${error}. Please check the code or try again.`);
            onClose(); // Close the modal if join fails
        });

        socket.on("player_joined", (newPlayers) => {
            console.log("[SOCKET] Player joined/updated:", newPlayers);
            setPlayers([...newPlayers]); // Force new array for state update
        });

        socket.on("question_started", (data) => {
            setGameState("question");
            setCurrentQuestion(data.question);
            setTimeRemaining(data.timeRemaining);
            setAnsweredCount(0);
            setSelectedAnswer(null);
            setRevealData(null);
        });

        socket.on("timer_tick", (time) => {
            setTimeRemaining(time);
        });

        socket.on("player_answered", (data) => {
            setAnsweredCount(data.answeredCount);
        });

        socket.on("answer_revealed", (data) => {
            setGameState("leaderboard");
            setRevealData(data);
            setLeaderboard(data.leaderboard);
        });

        socket.on("game_finished", (data) => {
            setGameState("finished");
            setLeaderboard(data.leaderboard);
            if (data.leaderboard[0]?.id === userId) {
                runConfetti();
            }
        });

        socket.on("online_users_update", (users) => {
            setOnlineUsers(users);
        });

        socket.on("error", (err) => {
            console.error("Socket error:", err.message);
        });

        socket.on("meme_alert", (data) => {
            console.log(`[MEME] Triggered for ${data.playerName}`);
            // Play meme sound
            const audio = new Audio("https://www.myinstants.com/media/sounds/haya-bahy.mp3"); // Placeholder Tunisian meme sound
            audio.play().catch(e => console.error("Audio playback blocked:", e));

            // Visual notification (optional but nice)
            // You could add a toast or alert here
        });

        socket.on("receive_invitation", (data) => {
            console.log("[SOCKET] Received invitation from:", data.senderName);
            if (confirm(`${data.senderName} is inviting you to a Neural Clash arena for topic: ${data.topic}. Join?`)) {
                onClose(); // Close current modal if it's open (it might be a matchmaking lobby)
                // We need a way to open a NEW modal with the join code. 
                // Since this modal is already open, we might need a better way.
                // For now, let's just use the room ID and join.
                socket.emit("join_quiz_room", { roomId: data.roomId, userId, userName });
            }
        });

        return () => {
            socket.off("room_created");
            socket.off("joined_successfully");
            socket.off("join_failed");
            socket.off("player_joined");
            socket.off("question_started");
            socket.off("timer_tick");
            socket.off("player_answered");
            socket.off("answer_revealed");
            socket.off("game_finished");
            socket.off("online_users_update");
            socket.off("meme_alert");
            socket.off("receive_invitation");
            socket.off("room_updated");
        };
    }, []);

    const handleTopicChange = (newTopic) => {
        setCurrentTopic(newTopic);
        socket.emit("update_room_topic", { roomId: room, topic: newTopic, userId });
    };

    const handleStart = () => {
        socket.emit("start_quiz", { roomId: room, userId });
    };

    const handleSubmitAnswer = (idx) => {
        if (selectedAnswer !== null || gameState !== "question") return;
        setSelectedAnswer(idx);
        socket.emit("submit_quiz_answer", { roomId: room, userId, answerIndex: idx });
    };

    const isHost = room && players[0]?.id === userId;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03040b]/90 backdrop-blur-xl p-4 overflow-hidden">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0f1126] rounded-[3rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-lg border border-white/10 relative overflow-hidden"
            >
                {/* Visual Flair */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0d0f22]/80 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Rocket className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tightest leading-none">
                                Neural Clash
                            </h2>
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-2">
                                Realtime Multi-User Assessment
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {room && (
                            <div className="px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-3">Room Code</span>
                                <span className="text-xl font-mono font-black text-indigo-400 tracking-wider">{room}</span>
                            </div>
                        )}
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-500 hover:text-white">
                            <X size={28} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-12 relative z-10">
                    <AnimatePresence mode="wait">
                        {gameState === "lobby" && (
                            <motion.div
                                key="lobby"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex flex-col"
                            >
                                <div className="text-center mb-12">
                                    <h3 className="text-5xl font-black text-white mb-4 italic">Waiting for Challengers...</h3>
                                    <p className="text-slate-400 text-lg">Join the arena. May the fastest synth win.</p>
                                </div>

                                <div className="flex-1 flex gap-8">
                                    {/* Players Grid */}
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {players.map((p, i) => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex flex-col items-center gap-4 group"
                                            >
                                                <div className="relative">
                                                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                                                        {i === 0 ? "👑" : "👤"}
                                                    </div>
                                                    {i === 0 ? (
                                                        <div className="absolute -top-2 -right-2 px-2 py-1 bg-indigo-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg">
                                                            Room Admin
                                                        </div>
                                                    ) : (
                                                        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg ${p.isReady ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                                                            {p.isReady ? 'Ready' : 'Not Ready'}
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#0f1126] animate-pulse" />
                                                </div>
                                                <span className={`text-sm font-bold uppercase tracking-widest ${p.id === userId ? 'text-indigo-400' : 'text-slate-300'}`}>
                                                    {p.name} {p.id === userId && "(You)"}
                                                </span>
                                            </motion.div>
                                        ))}
                                        {[...Array(Math.max(0, 6 - players.length))].map((_, i) => (
                                            <div key={i} className="flex flex-col items-center gap-4 opacity-20">
                                                <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-slate-500 flex items-center justify-center text-4xl" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Awaiting...</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Online Sidebar */}
                                    <div className="w-72 bg-white/5 rounded-[2rem] border border-white/10 p-6 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Online Scholars</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] text-emerald-500 font-bold">{onlineUsers.length}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                            {onlineUsers.filter(u => u.id !== userId).length > 0 ? (
                                                onlineUsers.filter(u => u.id !== userId).map((u, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-300 truncate">{u.name}</span>
                                                        <div className="flex items-center gap-2 ml-auto">
                                                            <button
                                                                onClick={() => {
                                                                    socket.emit("send_invitation", {
                                                                        targetUserId: u.id,
                                                                        senderName: userName,
                                                                        roomId: room,
                                                                        topic: topic || 'General CS'
                                                                    });
                                                                    alert(`Invitation sent to ${u.name}`);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-indigo-600 rounded-lg text-[8px] font-black text-white hover:bg-indigo-500 transition-all uppercase tracking-widest"
                                                            >
                                                                Invite
                                                            </button>
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                                    <Users size={32} className="text-slate-500 mb-2" />
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No others online</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            <p className="text-[9px] text-slate-500 text-center leading-relaxed font-medium uppercase tracking-[0.1em] mb-3">
                                                Assessment Subject
                                            </p>
                                            {isHost ? (
                                                <select
                                                    value={currentTopic}
                                                    onChange={(e) => handleTopicChange(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-colors"
                                                >
                                                    <option value="General CS">General CS</option>
                                                    {availableCourses.map(c => (
                                                        <option key={c.id} value={c.name}>{c.name} (Y{c.year_number}S{c.semester_number})</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-indigo-400 text-center uppercase tracking-widest">
                                                    {currentTopic}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-center gap-8 items-center">
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Room Protocol</p>
                                        <p className="text-lg font-black text-indigo-400">AUTO-MATCHING ENABLED</p>
                                    </div>
                                    <div className="w-[1px] h-12 bg-white/10" />
                                    {isHost ? (
                                        <button
                                            onClick={handleStart}
                                            // Admin is always ready. Check if all OTHER players (guests) are ready.
                                            disabled={players.length > 1 && !players.slice(1).every(p => p.isReady)}
                                            className="group relative px-16 py-6 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-[2rem] shadow-lg hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            <span className="relative flex items-center gap-4 text-white text-2xl font-black uppercase tracking-widest">
                                                <Zap fill="currentColor" /> {players.length > 1 && !players.slice(1).every(p => p.isReady) ? 'Wait for Ready' : 'Initiate Protocol'}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => socket.emit("toggle_ready", { roomId: room, userId })}
                                            className={`group relative px-16 py-6 rounded-[2rem] transition-all overflow-hidden border-2 ${players.find(p => p.id === userId)?.isReady
                                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                                : 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                }`}
                                        >
                                            <span className="relative flex items-center gap-4 text-xl font-black uppercase tracking-widest">
                                                <Zap fill="currentColor" /> {players.find(p => p.id === userId)?.isReady ? 'READY' : 'READY UP'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {gameState === "question" && currentQuestion && (
                            <motion.div
                                key="question"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-12">
                                    <div className="flex items-center gap-4">
                                        <span className="text-7xl font-black text-white/5 tracking-tighter">
                                            Q{String(currentQuestion.index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="h-10 w-[2px] bg-white/10" />
                                        <span className="text-indigo-400 font-black tracking-widest uppercase">Question Stream</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-3">
                                            <Users size={20} className="text-slate-500" />
                                            <span className="text-2xl font-black text-white">{answeredCount} / {players.length}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Responded</span>
                                        </div>
                                        <div className={`relative w-24 h-24 flex items-center justify-center rounded-3xl border-2 ${timeRemaining < 5 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-indigo-500/30 text-indigo-400'}`}>
                                            <span className="text-4xl font-black">{timeRemaining}</span>
                                            <Clock className="absolute -top-3 -right-3 bg-[#0f1126]" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-4xl font-bold text-slate-100 mb-16 leading-tight max-w-4xl">
                                    {currentQuestion.text}
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    {currentQuestion.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            disabled={selectedAnswer !== null}
                                            onClick={() => handleSubmitAnswer(i)}
                                            className={`group relative p-8 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden ${selectedAnswer === i
                                                ? 'bg-indigo-600 border-indigo-400 shadow-lg'
                                                : 'bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10'
                                                } ${selectedAnswer !== null && selectedAnswer !== i ? 'opacity-40 grayscale-[0.5]' : ''}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${selectedAnswer === i ? 'bg-white text-indigo-600' : 'bg-white/10 text-slate-400'
                                                    }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="text-xl font-bold text-white leading-snug">{opt}</span>
                                            </div>
                                            {selectedAnswer === i && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-4 right-4 text-white/20"
                                                >
                                                    <Zap size={40} fill="currentColor" />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {gameState === "leaderboard" && (
                            <motion.div
                                key="leaderboard"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex justify-between items-end mb-12">
                                    <div>
                                        <h3 className="text-5xl font-black text-white italic mb-2">Neural Standings</h3>
                                        <p className="text-indigo-400 font-bold tracking-widest uppercase">After Question {currentQuestion?.index + 1}</p>
                                    </div>
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${revealData?.correctIndex === selectedAnswer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                            }`}>
                                            {revealData?.correctIndex === selectedAnswer ? "✓" : "✗"}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pulse Status</p>
                                            <p className={`text-2xl font-black uppercase ${revealData?.correctIndex === selectedAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {revealData?.correctIndex === selectedAnswer ? "Synced" : "Corrupted"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 pr-4 custom-scrollbar overflow-y-auto">
                                    {leaderboard.map((p, i) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all ${p.id === userId
                                                ? 'bg-indigo-600/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                                                : 'bg-white/5 border-white/5'
                                                }`}
                                        >
                                            <span className={`text-2xl font-black w-10 ${i === 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                                                #{i + 1}
                                            </span>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${p.id === userId ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'
                                                }`}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg font-bold text-white uppercase tracking-tight">{p.name} {p.id === userId && "(You)"}</p>
                                                {p.streak > 1 && (
                                                    <span className="flex items-center gap-1 text-[10px] text-orange-400 font-black uppercase tracking-widest">
                                                        <Zap size={10} fill="currentColor" /> {p.streak} Streak
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Points</p>
                                                <p className="text-2xl font-black text-indigo-400 tracking-tighter">{p.score.toLocaleString()}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                                    <p className="text-xs text-indigo-300 font-medium leading-relaxed">
                                        <span className="font-black text-white mr-2">LOGIC:</span> {revealData?.explanation}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {gameState === "finished" && (
                            <motion.div
                                key="finished"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center"
                            >
                                <div className="mb-12 relative">
                                    <div className="absolute inset-0 bg-amber-400/20 blur-[80px] rounded-full animate-pulse" />
                                    <div className="w-48 h-48 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-amber-500/40 relative z-10">
                                        <Trophy size={80} className="text-white" />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-8 border-4 border-dashed border-amber-400/30 rounded-full"
                                    />
                                </div>

                                <h3 className="text-6xl font-black text-white italic mb-4">Neural Apex Reached</h3>
                                <p className="text-xl text-slate-400 mb-12 max-w-2xl">The assessment is complete. Behold the final synaptic ranking of the participants.</p>

                                <div className="flex gap-8 mb-12 items-end">
                                    {/* Podium 2 */}
                                    {leaderboard[1] && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-700/50 flex items-center justify-center text-white font-bold mb-4">
                                                {leaderboard[1].name.charAt(0)}
                                            </div>
                                            <div className="w-24 h-32 bg-slate-700/30 border-t-2 border-slate-400 rounded-t-xl flex flex-col items-center p-4">
                                                <span className="text-2xl font-black text-slate-400">#2</span>
                                                <span className="text-[10px] font-bold text-slate-500">{leaderboard[1].name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Podium 1 */}
                                    {leaderboard[0] && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-28 h-28 rounded-3xl bg-amber-500 flex items-center justify-center text-white text-4xl mb-4 shadow-xl shadow-amber-500/20 border-4 border-amber-300">
                                                {leaderboard[0].name.charAt(0)}
                                            </div>
                                            <div className="w-32 h-48 bg-amber-500/20 border-t-4 border-amber-400 rounded-t-xl flex flex-col items-center p-6">
                                                <span className="text-4xl font-black text-amber-400">#1</span>
                                                <span className="text-xs font-bold text-white mt-2">{leaderboard[0].name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Podium 3 */}
                                    {leaderboard[2] && (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 rounded-xl bg-orange-800/50 flex items-center justify-center text-white font-bold mb-4">
                                                {leaderboard[2].name.charAt(0)}
                                            </div>
                                            <div className="w-20 h-24 bg-orange-800/30 border-t-2 border-orange-600 rounded-t-xl flex flex-col items-center p-4">
                                                <span className="text-xl font-black text-orange-500">#3</span>
                                                <span className="text-[10px] font-bold text-slate-500">{leaderboard[2].name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="px-16 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-3xl border border-white/10 transition-all"
                                >
                                    Dissolve Arena
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default MultiplayerQuizModal;

