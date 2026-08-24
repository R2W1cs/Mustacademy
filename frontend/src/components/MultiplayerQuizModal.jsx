import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Zap, Trophy, MessageSquare, Send, Settings, Crown } from "lucide-react";
import { useSocket, authenticateSocket, getSocketStatus } from "../hooks/useSocket";
import { runConfetti } from "../utils/confetti";
import { getAllCourses } from "../api/courses";
import toast from "react-hot-toast";
import { useTheme } from "../auth/ThemeContext";

// ─── Answer palette (Kahoot 4-color) ─────────────────────────────────────────
const COLORS = [
    { bg: '#e21b3c', dark: '#a01228', shape: '▲' },
    { bg: '#1368ce', dark: '#0a4a99', shape: '◆' },
    { bg: '#d89e00', dark: '#9a7200', shape: '●' },
    { bg: '#26890c', dark: '#1a5e08', shape: '■' },
];

// ─── Meme failure sounds ──────────────────────────────────────────────────────
const MEME_SOUNDS = [
    (ctx) => { // sad trombone
        [{ f:415,d:.3 },{ f:370,d:.3 },{ f:330,d:.3 },{ f:277,d:.9 }].forEach(({ f,d },i) => {
            const o=ctx.createOscillator(),g=ctx.createGain();
            o.connect(g);g.connect(ctx.destination);o.type='sawtooth';
            const t=ctx.currentTime+i*.28;
            o.frequency.setValueAtTime(f,t);
            if(i===3)o.frequency.linearRampToValueAtTime(f-25,t+.6);
            g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.38,t+.05);
            g.gain.exponentialRampToValueAtTime(.01,t+d);o.start(t);o.stop(t+d+.1);
        });
    },
    (ctx) => { // slide whistle down
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);o.type='sine';
        o.frequency.setValueAtTime(950,ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(75,ctx.currentTime+.85);
        g.gain.setValueAtTime(.42,ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.01,ctx.currentTime+.9);
        o.start(ctx.currentTime);o.stop(ctx.currentTime+1);
    },
    (ctx) => { // bruh
        [{f:220,d:.08},{f:110,d:.15},{f:82,d:.5}].forEach(({ f,d },i) => {
            const o=ctx.createOscillator(),g=ctx.createGain();
            o.connect(g);g.connect(ctx.destination);o.type='sawtooth';o.frequency.value=f;
            const t=ctx.currentTime+i*.14;
            g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.45,t+.02);
            g.gain.exponentialRampToValueAtTime(.01,t+d);o.start(t);o.stop(t+d+.05);
        });
    },
    (ctx) => { // wamp wamp
        [{f:233,d:.55},{f:185,d:.75}].forEach(({ f,d },i) => {
            const o=ctx.createOscillator(),g=ctx.createGain();
            o.connect(g);g.connect(ctx.destination);o.type='triangle';
            const t=ctx.currentTime+i*.5;
            o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*.82,t+d);
            g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.48,t+.04);
            g.gain.exponentialRampToValueAtTime(.01,t+d);o.start(t);o.stop(t+d+.1);
        });
    },
    (ctx) => { // windows error
        [{f:523,at:0},{f:494,at:.22},{f:523,at:.44},{f:466,at:.66}].forEach(({ f,at }) => {
            const o=ctx.createOscillator(),g=ctx.createGain();
            o.connect(g);g.connect(ctx.destination);o.type='square';o.frequency.value=f;
            const t=ctx.currentTime+at;
            g.gain.setValueAtTime(.18,t);g.gain.setValueAtTime(.18,t+.17);g.gain.setValueAtTime(0,t+.19);
            o.start(t);o.stop(t+.25);
        });
    },
    (ctx) => { // dial-up screech
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);o.type='sawtooth';
        [1200,800,1400,600].forEach((f,i)=>o.frequency.setValueAtTime(f,ctx.currentTime+i*.1));
        o.frequency.linearRampToValueAtTime(200,ctx.currentTime+.6);
        g.gain.setValueAtTime(.22,ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.01,ctx.currentTime+.65);
        o.start(ctx.currentTime);o.stop(ctx.currentTime+.7);
    },
];
const playFail = () => { try { const ctx=new(window.AudioContext||window.webkitAudioContext)(); MEME_SOUNDS[Math.floor(Math.random()*MEME_SOUNDS.length)](ctx); } catch(e){} };
const playWin  = () => { try { const ctx=new(window.AudioContext||window.webkitAudioContext)(); [{f:523,d:.12},{f:659,d:.12},{f:784,d:.28}].forEach(({ f,d },i)=>{ const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.value=f;const t=ctx.currentTime+i*.14;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.02);g.gain.exponentialRampToValueAtTime(.01,t+d);o.start(t);o.stop(t+d+.05);}); } catch(e){} };

// ─── Player avatar colors ─────────────────────────────────────────────────────
const AVATAR_COLORS = ['#e21b3c','#1368ce','#d89e00','#26890c','#7c3aed','#0e7575','#c2410c','#0369a1'];

export default function MultiplayerQuizModal({ onClose, topic, action, joinCode }) {
    const { theme } = useTheme();
    const isDark = theme !== 'light';
    const ui = isDark ? {
        overlay: 'rgba(3,4,11,0.92)',
        shell: '#080b1a',
        shellBorder: 'rgba(255,255,255,0.07)',
        headerBg: 'rgba(8,11,26,0.85)',
        headerBorder: 'rgba(255,255,255,0.06)',
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.35)',
        faint: 'rgba(255,255,255,0.15)',
        card: 'rgba(255,255,255,0.04)',
        cardBorder: 'rgba(255,255,255,0.08)',
        pinBg: 'rgba(255,255,255,0.06)',
        pinBorder: 'rgba(255,255,255,0.12)',
        blobA: 'rgba(99,102,241,0.15)',
        blobB: 'rgba(192,38,211,0.12)',
        chatBg: 'rgba(6,8,20,0.97)',
        inputBg: 'rgba(255,255,255,0.06)',
        idleBtn: 'rgba(255,255,255,0.06)',
        idleBtnText: 'rgba(255,255,255,0.4)',
    } : {
        overlay: 'rgba(241,245,249,0.82)',
        shell: '#ffffff',
        shellBorder: 'rgba(148,163,184,0.35)',
        headerBg: 'rgba(255,255,255,0.96)',
        headerBorder: 'rgba(226,232,240,1)',
        text: '#0f172a',
        muted: 'rgba(71,85,105,0.95)',
        faint: 'rgba(148,163,184,0.85)',
        card: 'rgba(248,250,252,1)',
        cardBorder: 'rgba(226,232,240,1)',
        pinBg: 'rgba(238,242,255,1)',
        pinBorder: 'rgba(165,180,252,0.65)',
        blobA: 'rgba(99,102,241,0.12)',
        blobB: 'rgba(225,29,72,0.08)',
        chatBg: 'rgba(255,255,255,0.98)',
        inputBg: 'rgba(241,245,249,1)',
        idleBtn: 'rgba(241,245,249,1)',
        idleBtnText: 'rgba(100,116,139,1)',
    };

    const socket = useSocket();
    const [gameState, setGameState]     = useState("lobby");
    const [room, setRoom]               = useState(null);
    const [players, setPlayers]         = useState([]);
    const [question, setQuestion]       = useState(null);
    const [timeLeft, setTimeLeft]       = useState(0);
    const [timeTotal, setTimeTotal]     = useState(15);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [picked, setPicked]           = useState(null);
    const [reveal, setReveal]           = useState(null);
    const [board, setBoard]             = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [courses, setCourses]         = useState([]);
    const [topic_, setTopic_]           = useState(topic || "General CS");
    const [cfg, setCfg]                 = useState({ questionCount: 5, timePerQuestion: 15 });
    const [msgs, setMsgs]               = useState([]);
    const [chatInput, setChatInput]     = useState("");
    const [chatOpen, setChatOpen]       = useState(false);
    const [quizReady, setQuizReady]     = useState(false);
    const [creatingRoom, setCreatingRoom] = useState(true);
    const [lobbyError, setLobbyError] = useState("");
    const chatEnd     = useRef(null);
    const pickedRef   = useRef(null);
    const contentRef  = useRef(null);

    // Standings/question headers were clipping because scroll position carried over between phases
    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [gameState]);

    const userId   = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Scholar";

    const createOrJoinRoom = async () => {
        setCreatingRoom(true);
        setLobbyError("");
        setQuizReady(false);

        const status = getSocketStatus();
        console.log("[Arena] socket status", status);

        const ok = await authenticateSocket(socket, { force: true });
        if (!ok) {
            setCreatingRoom(false);
            const st = getSocketStatus();
            setLobbyError(
                st.connected
                    ? "Arena auth failed. Log out, log back in, then retry."
                    : "Cannot reach the game server. Check your connection and retry."
            );
            toast.error("Arena connection failed");
            return false;
        }

        if (action === "join" && joinCode) {
            socket.emit("join_quiz_room", { roomId: joinCode.trim().toUpperCase(), userId, userName });
        } else {
            socket.emit("create_quiz_room", {
                userId,
                userName,
                topic: topic || topic_ || "General CS",
                forceNew: true,
            });
        }
        socket.emit("get_online_users");
        return true;
    };

    useEffect(() => {
        let cancelled = false;
        let hasRoom = false;

        if (action === "host" || !action) {
            getAllCourses({ params: { limit: 200 } })
                .then((r) => {
                    const list = Array.isArray(r.data) ? r.data : (r.data?.courses || []);
                    setCourses(list);
                })
                .catch(() => setCourses([]));
        }

        const enterRoom = (d) => {
            if (cancelled) return;
            if (!d?.id) {
                setCreatingRoom(false);
                setLobbyError("Server returned a room without a PIN. Retry.");
                return;
            }
            hasRoom = true;
            setRoom(d.id);
            setPlayers([...(d.players || [])]);
            setTopic_(d.topic || topic_ || "General CS");
            setGameState("lobby");
            setCreatingRoom(false);
            setLobbyError("");
            setQuizReady(d.quizStatus === "ready" || Boolean(d.quiz?.questions?.length));
            toast.success(`Room PIN: ${d.id}`);
        };

        const failLobby = (msg) => {
            if (cancelled || hasRoom) return;
            setCreatingRoom(false);
            setLobbyError(msg);
            toast.error(msg);
        };

        socket.on("room_created", enterRoom);
        socket.on("joined_successfully", enterRoom);
        socket.on("room_updated", (d) => {
            setTopic_(d.topic);
            setPlayers([...(d.players || [])]);
            setQuizReady(d.quizStatus === "ready" || Boolean(d.quiz?.questions?.length));
        });
        socket.on("join_failed", (e) => failLobby(typeof e === "string" ? e : (e?.message || "Join failed")));
        socket.on("player_joined", (p) => setPlayers([...(p || [])]));
        socket.on("online_users_update", (u) => setOnlineUsers(u || []));
        socket.on("quiz_ready", () => {
            setQuizReady(true);
            toast.success("Quiz ready — launch when everyone is set");
        });
        socket.on("quiz_status", (d) => {
            if (d?.status === "generating") setQuizReady(false);
        });
        socket.on("auth_error", (e) => failLobby(e?.message || "Socket auth failed — refresh and try again"));
        socket.on("error", (e) => failLobby(e?.message || "Arena error"));

        socket.on("question_started", (d) => {
            setGameState("question");
            setQuestion(d.question);
            setTimeLeft(d.timeRemaining);
            setTimeTotal(d.timePerQuestion || 15);
            setAnsweredCount(0);
            setPicked(null);
            pickedRef.current = null;
            setReveal(null);
        });
        socket.on("timer_tick", (t) => setTimeLeft(t));
        socket.on("player_answered", (d) => setAnsweredCount(d.answeredCount));
        socket.on("answer_revealed", (d) => {
            setGameState("leaderboard");
            setReveal(d);
            setBoard(d.leaderboard);
            pickedRef.current === null || pickedRef.current !== d.correctIndex ? playFail() : playWin();
        });
        socket.on("game_finished", (d) => {
            setGameState("finished");
            setBoard(d.leaderboard);
            if (d.leaderboard[0]?.id === userId) runConfetti();
        });
        socket.on("match_chat", (m) => setMsgs((p) => [...p.slice(-49), m]));
        socket.on("meme_alert", () => playFail());

        createOrJoinRoom();

        const watchdog = setTimeout(() => {
            if (!cancelled && !hasRoom) {
                setCreatingRoom(false);
                setLobbyError((prev) => prev || "Timed out creating the room. Retry or re-login.");
            }
        }, 20000);

        return () => {
            cancelled = true;
            clearTimeout(watchdog);
            [
                "room_created", "joined_successfully", "room_updated", "join_failed", "player_joined",
                "online_users_update", "quiz_ready", "quiz_status", "auth_error", "error",
                "question_started", "timer_tick", "player_answered", "answer_revealed",
                "game_finished", "match_chat", "meme_alert",
            ].forEach((e) => socket.off(e));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { if (chatOpen) chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, chatOpen]);

    const submitAnswer = (i) => {
        if (picked !== null || gameState !== "question") return;
        setPicked(i); pickedRef.current = i;
        socket.emit("submit_quiz_answer", { roomId: room, userId, answerIndex: i });
    };
    const startGame  = () => socket.emit("start_quiz", { roomId: room, userId, config: cfg });
    const sendMsg    = () => { if (!chatInput.trim() || !room) return; socket.emit("match_chat", { roomId: room, text: chatInput.trim() }); setChatInput(""); };
    const changeTopic = (t) => { setTopic_(t); socket.emit("update_room_topic", { roomId: room, topic: t, userId }); };

    const isHost = room && players[0]?.id === userId;
    const timerPct = timeTotal > 0 ? timeLeft / timeTotal : 0;
    const circumference = 2 * Math.PI * 28;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3" style={{ background: ui.overlay, backdropFilter: 'blur(20px)' }}>
            <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                className="relative w-full max-w-5xl flex flex-col overflow-hidden"
                style={{ height: '92vh', background: ui.shell, borderRadius: 32, border: `1px solid ${ui.shellBorder}` }}
            >
                {/* Ambient blobs */}
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${ui.blobA} 0%, transparent 70%)` }} />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${ui.blobB} 0%, transparent 70%)` }} />

                {/* ── HEADER ── */}
                <div className="flex-shrink-0 relative z-10 flex items-center justify-between px-6 py-3.5" style={{ borderBottom: `1px solid ${ui.headerBorder}`, background: ui.headerBg, backdropFilter: 'blur(12px)' }}>
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#c026d3)' }}>
                            <Zap size={15} fill="white" className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-wider leading-none" style={{ color: ui.text }}>Neural Clash</p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: '#6366f1' }}>Arena</p>
                        </div>
                    </div>

                    {/* GAME PIN — always visible */}
                    {room && (
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] mb-0.5" style={{ color: ui.muted }}>Game PIN</span>
                            <div className="px-5 py-1" style={{ background: 'white', borderRadius: 10 }}>
                                <span className="text-xl font-black tracking-widest font-mono" style={{ color: '#080b1a' }}>{room}</span>
                            </div>
                        </div>
                    )}

                    {/* Right actions */}
                    <div className="flex items-center gap-1.5">
                        {gameState !== "lobby" && room && (
                            <button onClick={() => setChatOpen(v => !v)} className="relative p-2 rounded-xl transition-all" style={{ background: chatOpen ? '#6366f1' : ui.idleBtn, color: chatOpen ? 'white' : ui.idleBtnText }}>
                                <MessageSquare size={17} />
                                {msgs.length > 0 && !chatOpen && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ background: '#6366f1' }}>
                                        {Math.min(msgs.length, 9)}
                                    </span>
                                )}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ color: ui.muted }}
                            onMouseEnter={e => e.currentTarget.style.color=ui.text} onMouseLeave={e => e.currentTarget.style.color=ui.muted}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── CHAT PANEL — floating bottom-right, never covers header ── */}
                <AnimatePresence>
                    {chatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className="absolute bottom-4 right-4 z-20 flex flex-col rounded-2xl overflow-hidden"
                            style={{ width: 260, height: 320, background: ui.chatBg, border: `1px solid ${ui.cardBorder}`, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(15,23,42,0.12)' }}
                        >
                            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: `1px solid ${ui.cardBorder}`, background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}>
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare size={13} style={{ color: '#6366f1' }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>Match Chat</span>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: ui.muted }}>
                                    <X size={13} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                                {msgs.length === 0 && <p className="text-center text-[10px] mt-6" style={{ color: ui.faint }}>No messages yet</p>}
                                {msgs.map((m, i) => {
                                    const isMe = m.userName === userName;
                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] font-bold uppercase px-1 mb-0.5" style={{ color: ui.faint }}>{m.userName}</span>
                                            <div className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium max-w-[90%]" style={{ background: isMe ? '#6366f1' : ui.card, color: isMe ? 'white' : ui.text }}>{m.text}</div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEnd} />
                            </div>
                            <div className="p-2 flex gap-1.5" style={{ borderTop: `1px solid ${ui.cardBorder}` }}>
                                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()}
                                    placeholder="Message..." className="flex-1 rounded-xl px-2.5 py-1.5 text-[11px] outline-none"
                                    style={{ background: ui.inputBg, border: `1px solid ${ui.cardBorder}`, color: ui.text }} />
                                <button onClick={sendMsg} disabled={!chatInput.trim()} className="p-1.5 rounded-xl text-white" style={{ background: '#6366f1', opacity: chatInput.trim() ? 1 : 0.3 }}>
                                    <Send size={12} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MAIN CONTENT ── */}
                {/* min-h-0 so flex child can scroll; avoid clipping tall italic titles */}
                <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto relative z-10" style={{ padding: '1.5rem 1.5rem 1.75rem' }}>
                    <AnimatePresence mode="wait">

                        {/* ══════════ LOBBY ══════════ */}
                        {gameState === "lobby" && (
                            <motion.div key="lobby" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:.96 }} className="h-full flex flex-col gap-6">

                                {/* Pin spotlight */}
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: ui.muted }}>Share this PIN with friends</p>
                                    <div className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl" style={{ background: ui.pinBg, border: `2px solid ${ui.pinBorder}` }}>
                                        <span className="text-5xl font-black font-mono tracking-widest" style={{ color: ui.text }}>
                                            {room || (creatingRoom ? '······' : '------')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${room ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${room ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {!room ? (creatingRoom ? 'Creating room…' : (lobbyError || 'Waiting for server…')) : (quizReady ? 'Lobby Open · Quiz Ready' : 'Lobby Open · Generating quiz…')}
                                        </span>
                                    </div>
                                    {lobbyError && !creatingRoom && !room && (
                                        <button
                                            type="button"
                                            onClick={() => { createOrJoinRoom(); }}
                                            className="mt-4 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white"
                                            style={{ background: '#6366f1' }}
                                        >
                                            Retry create room
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-1 gap-5 min-h-0">
                                    {/* Players */}
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 content-start gap-3">
                                        {players.map((p, i) => (
                                            <motion.div key={p.id} initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ type:'spring', delay: i*0.07 }}
                                                className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                                                style={{ background: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}18`, border: `2px solid ${AVATAR_COLORS[i % AVATAR_COLORS.length]}40` }}
                                            >
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg relative"
                                                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                    {i === 0 && <div className="absolute -top-2 -right-2 text-base">👑</div>}
                                                </div>
                                                <span className="text-xs font-bold text-center truncate w-full text-center" style={{ color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                                    {p.name}{p.id === userId ? ' ⭐' : ''}
                                                </span>
                                                <div className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                                                    style={{ background: i===0 ? 'rgba(251,191,36,0.15)' : p.isReady ? 'rgba(34,197,94,0.15)' : ui.idleBtn, color: i===0 ? '#fbbf24' : p.isReady ? '#22c55e' : ui.muted }}>
                                                    {i === 0 ? 'HOST' : p.isReady ? '✓ READY' : 'WAITING'}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {[...Array(Math.max(0, 6 - players.length))].map((_, i) => (
                                            <div key={i} className="flex items-center justify-center p-4 rounded-2xl" style={{ border: `2px dashed ${ui.faint}`, minHeight: 112 }}>
                                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ui.faint }}>Waiting...</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Settings sidebar */}
                                    <div className="w-64 flex flex-col gap-4 flex-shrink-0">
                                        {/* Topic */}
                                        <div className="p-4 rounded-2xl" style={{ background: ui.card, border: `1px solid ${ui.cardBorder}` }}>
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: ui.muted }}>Topic</p>
                                            {isHost ? (
                                                <>
                                                    <label className="block text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}>
                                                        This topic (quiz subject)
                                                    </label>
                                                    <select value={topic_} onChange={e => changeTopic(e.target.value)}
                                                        className="w-full rounded-xl px-3 py-2.5 text-[11px] font-bold outline-none"
                                                        style={{
                                                            background: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff',
                                                            border: `1px solid ${isDark ? 'rgba(99,102,241,0.35)' : '#a5b4fc'}`,
                                                            color: isDark ? '#c7d2fe' : '#1e1b4b',
                                                        }}>
                                                        <option value="General CS" style={{ color: '#0f172a' }}>General CS</option>
                                                        {courses.map(c => (
                                                            <option key={c.id} value={c.name} style={{ color: '#0f172a' }}>
                                                                {c.name} (Y{c.year_number ?? c.yearNumber ?? '?'}S{c.semester_number ?? c.semesterNumber ?? '?'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {courses.length === 0 && (
                                                        <p className="text-[9px] mt-2" style={{ color: ui.muted }}>No courses loaded — using General CS</p>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="px-3 py-2.5 rounded-xl text-[11px] font-bold text-center"
                                                    style={{
                                                        background: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff',
                                                        border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#a5b4fc'}`,
                                                        color: isDark ? '#c7d2fe' : '#312e81',
                                                    }}>{topic_}</div>
                                            )}
                                        </div>

                                        {/* Match config */}
                                        <div className="p-4 rounded-2xl" style={{ background: ui.card, border: `1px solid ${ui.cardBorder}` }}>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <Settings size={11} style={{ color: ui.muted }} />
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ui.muted }}>Match Config</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: ui.faint }}>Questions</p>
                                                    <div className="flex gap-1.5">
                                                        {[5,10,15].map(n => (
                                                            <button key={n} disabled={!isHost} onClick={() => setCfg(c => ({...c, questionCount: n}))}
                                                                className="flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all"
                                                                style={{ background: cfg.questionCount===n ? '#6366f1' : ui.idleBtn, color: cfg.questionCount===n ? 'white' : ui.idleBtnText }}>
                                                                {n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: ui.faint }}>Seconds / Q</p>
                                                    <div className="flex gap-1.5">
                                                        {[10,15,30].map(t => (
                                                            <button key={t} disabled={!isHost} onClick={() => setCfg(c => ({...c, timePerQuestion: t}))}
                                                                className="flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all"
                                                                style={{ background: cfg.timePerQuestion===t ? '#6366f1' : ui.idleBtn, color: cfg.timePerQuestion===t ? 'white' : ui.idleBtnText }}>
                                                                {t}s
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Online users */}
                                        <div className="flex-1 p-4 rounded-2xl overflow-hidden flex flex-col" style={{ background: ui.card, border: `1px solid ${ui.cardBorder}` }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={11} style={{ color: '#6366f1' }} />
                                                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ui.muted }}>Online</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-400">{onlineUsers.length}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1.5 overflow-y-auto">
                                                {onlineUsers.filter(u => u.id !== userId).map((u, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-xl group" style={{ background: ui.card }}>
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{u.name.charAt(0)}</div>
                                                        <span className="flex-1 text-[11px] font-bold truncate" style={{ color: ui.text }}>{u.name}</span>
                                                        <button onClick={() => { socket.emit("send_invitation",{ targetUserId:u.id, senderName:userName, roomId:room, topic:topic_||'General CS' }); toast.success(`Invited ${u.name}`); }}
                                                            className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded-lg text-[8px] font-black text-white transition-all"
                                                            style={{ background: '#6366f1' }}>
                                                            Invite
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="flex justify-center pt-2">
                                    {!room ? (
                                        <div className="px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest" style={{ color: ui.muted, background: ui.card, border: `1px solid ${ui.cardBorder}` }}>
                                            Connecting to arena…
                                        </div>
                                    ) : isHost ? (
                                        <motion.button onClick={startGame}
                                            disabled={!quizReady || (players.length > 1 && !players.slice(1).every(p => p.isReady))}
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                            className="px-16 py-5 rounded-2xl text-white text-xl font-black uppercase tracking-widest shadow-2xl disabled:opacity-40 flex items-center gap-3"
                                            style={{ background: 'linear-gradient(135deg,#6366f1,#c026d3)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
                                            <Zap size={22} fill="white" />
                                            {!quizReady
                                                ? 'Preparing Quiz…'
                                                : (players.length > 1 && !players.slice(1).every(p => p.isReady) ? 'Waiting for Ready…' : 'Launch Arena')}
                                        </motion.button>
                                    ) : (
                                        <motion.button onClick={() => {
                                                if (!room) { toast.error('Room not ready yet'); return; }
                                                socket.emit("toggle_ready", { roomId: room, userId });
                                            }}
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                            className="px-16 py-5 rounded-2xl text-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                                            style={{ background: players.find(p => String(p.id) === String(userId))?.isReady ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#6366f1,#6366f1)', border: players.find(p => String(p.id) === String(userId))?.isReady ? '2px solid #22c55e' : 'none', color: players.find(p => String(p.id) === String(userId))?.isReady ? '#22c55e' : 'white' }}>
                                            <Zap size={22} fill="currentColor" />
                                            {players.find(p => String(p.id) === String(userId))?.isReady ? '✓ READY' : 'READY UP'}
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ══════════ QUESTION ══════════ */}
                        {gameState === "question" && question && (
                            <motion.div key="question" initial={{ opacity:0,scale:.96 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:.96 }} className="h-full flex flex-col gap-4">

                                {/* Top bar */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest" style={{ background: ui.card, color: ui.text }}>
                                            Q{question.index + 1} / {question.total}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: ui.card }}>
                                            <Users size={12} style={{ color: ui.muted }} />
                                            <span className="text-[11px] font-black" style={{ color: ui.text }}>{answeredCount}/{players.length}</span>
                                            <span className="text-[9px] uppercase tracking-widest" style={{ color: ui.muted }}>answered</span>
                                        </div>
                                    </div>

                                    {/* SVG circular timer */}
                                    <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
                                        <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="36" cy="36" r="28" fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.06)" />
                                            <circle cx="36" cy="36" r="28" fill="none" strokeWidth="5" strokeLinecap="round"
                                                stroke={timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#6366f1'}
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference * (1 - timerPct)}
                                                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xl font-black leading-none" style={{ color: timeLeft <= 5 ? '#ef4444' : 'white' }}>{timeLeft}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Question card */}
                                <div className="rounded-2xl px-8 py-6 flex items-center justify-center" style={{ background: ui.card, border: `1px solid ${ui.cardBorder}`, minHeight: 96 }}>
                                    <h2 className="text-2xl font-bold text-center leading-snug" style={{ color: ui.text }}>{question.text}</h2>
                                </div>

                                {/* 2×2 Answer grid */}
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {question.options.map((opt, i) => {
                                        const col = COLORS[i] || COLORS[0];
                                        const isSel = picked === i;
                                        const isDim = picked !== null && !isSel;
                                        return (
                                            <motion.button key={i}
                                                disabled={picked !== null}
                                                onClick={() => submitAnswer(i)}
                                                whileHover={picked===null ? { scale:1.025, y:-2 } : {}}
                                                whileTap={picked===null ? { scale:0.97 } : {}}
                                                className="relative flex items-center gap-4 px-6 rounded-2xl text-white font-bold text-left shadow-xl overflow-hidden transition-opacity"
                                                style={{ background: col.bg, opacity: isDim ? 0.32 : 1, minHeight: 80, outline: isSel ? '3px solid white' : 'none', outlineOffset: 3, boxShadow: isSel ? `0 0 28px ${col.bg}88` : `0 4px 20px ${col.bg}30` }}
                                            >
                                                {/* darker bottom stripe */}
                                                <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-2xl" style={{ background: col.dark }} />
                                                <span className="text-2xl font-black opacity-80 flex-shrink-0">{col.shape}</span>
                                                <span className="text-base font-bold leading-snug">{opt}</span>
                                                {isSel && (
                                                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                                        <Zap size={18} fill="white" className="text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ══════════ LEADERBOARD ══════════ */}
                        {gameState === "leaderboard" && (
                            <motion.div
                                key="leaderboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                    <div className="min-w-0">
                                        <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight" style={{ color: ui.text }}>
                                            Standings
                                        </h2>
                                        <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: '#6366f1' }}>
                                            After Question {question?.index + 1}
                                        </p>
                                    </div>
                                    {reveal && (
                                        <div
                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-shrink-0 self-start sm:self-auto"
                                            style={{ background: ui.card, border: `1px solid ${ui.cardBorder}` }}
                                        >
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white"
                                                style={{ background: COLORS[reveal.correctIndex]?.bg }}
                                            >
                                                {COLORS[reveal.correctIndex]?.shape}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: ui.muted }}>
                                                    Correct Answer
                                                </p>
                                                <p className="text-sm font-bold max-w-[200px] truncate" style={{ color: ui.text }}>
                                                    {question?.options?.[reveal.correctIndex]}
                                                </p>
                                            </div>
                                            <div
                                                className="text-3xl font-black ml-1 leading-none"
                                                style={{ color: picked === reveal.correctIndex ? '#22c55e' : '#ef4444' }}
                                            >
                                                {picked === reveal.correctIndex ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2.5">
                                    {board.map((p, i) => (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                                            style={{
                                                background: p.id === userId
                                                    ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)')
                                                    : ui.card,
                                                border: p.id === userId
                                                    ? '1px solid rgba(99,102,241,0.35)'
                                                    : `1px solid ${ui.cardBorder}`,
                                            }}
                                        >
                                            <span className="text-2xl font-black w-10 text-center flex-shrink-0" style={{ color: i === 0 ? '#fbbf24' : ui.faint }}>
                                                {i === 0 ? <Crown size={22} className="mx-auto" style={{ color: '#fbbf24' }} /> : `#${i + 1}`}
                                            </span>
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white flex-shrink-0"
                                                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                                            >
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate" style={{ color: ui.text }}>
                                                    {p.name}{p.id === userId ? ' (You)' : ''}
                                                </p>
                                                {p.streak > 1 && (
                                                    <span className="text-[10px] font-black" style={{ color: '#f97316' }}>
                                                        🔥 {p.streak}x streak
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xl font-black tabular-nums flex-shrink-0" style={{ color: '#6366f1' }}>
                                                {p.score.toLocaleString()}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {reveal?.explanation && (
                                    <div
                                        className="px-5 py-4 rounded-2xl"
                                        style={{
                                            background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                                            border: `1px solid ${isDark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.22)'}`,
                                        }}
                                    >
                                        <p className="text-sm leading-relaxed" style={{ color: ui.muted }}>
                                            <span className="font-black mr-2" style={{ color: ui.text }}>Why:</span>
                                            {reveal.explanation}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ══════════ FINISHED ══════════ */}
                        {gameState === "finished" && (
                            <motion.div key="finished" initial={{ opacity:0,scale:1.08 }} animate={{ opacity:1,scale:1 }} className="h-full flex flex-col items-center justify-center text-center gap-8">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full blur-[60px]" style={{ background: 'rgba(251,191,36,0.2)' }} />
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                        className="absolute -inset-8 rounded-full" style={{ border: '3px dashed rgba(251,191,36,0.25)' }} />
                                    <div className="relative w-36 h-36 rounded-[2rem] flex items-center justify-center shadow-2xl" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)', boxShadow: '0 0 60px rgba(251,191,36,0.4)' }}>
                                        <Trophy size={64} className="text-white" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-5xl font-black italic mb-2" style={{ color: ui.text }}>Game Over!</h2>
                                    <p style={{ color: ui.muted }}>Final synaptic rankings are in.</p>
                                </div>

                                {/* Podium */}
                                <div className="flex items-end gap-4 justify-center">
                                    {[board[1], board[0], board[2]].map((p, pos) => p && (
                                        <div key={p.id} className="flex flex-col items-center gap-2">
                                            <div className="font-black text-2xl">{pos===1?'👑':pos===0?'🥈':'🥉'}</div>
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                                                style={{ background: AVATAR_COLORS[board.indexOf(p) % AVATAR_COLORS.length] }}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="text-xs font-bold truncate max-w-[80px]" style={{ color: ui.text }}>{p.name}</div>
                                            <div className="rounded-t-xl flex flex-col items-center justify-start pt-3 w-24"
                                                style={{ height: pos===1 ? 120 : pos===0 ? 84 : 60, background: pos===1 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)', borderTop: `3px solid ${pos===1 ? '#fbbf24' : pos===0 ? '#94a3b8' : '#f97316'}` }}>
                                                <span className="font-black" style={{ color: pos===1 ? '#fbbf24' : pos===0 ? '#94a3b8' : '#f97316', fontSize: pos===1 ? 24 : 18 }}>
                                                    #{pos===1?1:pos===0?2:3}
                                                </span>
                                                <span className="text-[10px] font-bold" style={{ color: ui.muted }}>{p.score.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <motion.button onClick={onClose} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                                    className="px-12 py-4 rounded-2xl text-white font-black uppercase tracking-widest"
                                    style={{ background: ui.card, border: `1px solid ${ui.cardBorder}`, color: ui.text }}>
                                    Leave Arena
                                </motion.button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    , document.body);
}