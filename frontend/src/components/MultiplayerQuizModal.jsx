import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Zap, Trophy, MessageSquare, Send, Settings, Crown } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { runConfetti } from "../utils/confetti";
import { getAllCourses } from "../api/courses";
import toast from "react-hot-toast";

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
    const chatEnd   = useRef(null);
    const pickedRef = useRef(null);

    const userId   = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName") || "Scholar";

    useEffect(() => {
        if (!room) {
            action === 'join' && joinCode
                ? socket.emit("join_quiz_room", { roomId: joinCode.trim(), userId, userName })
                : socket.emit("create_quiz_room", { userId, userName, topic, forceNew: action === 'host' });
            socket.emit("get_online_users");
        }

        if (action === 'host' || !action) getAllCourses().then(r => setCourses(r.data)).catch(()=>{});

        const enterRoom = (d) => { setRoom(d.id); setPlayers([...d.players]); setTopic_(d.topic); setGameState("lobby"); };

        socket.on("room_created",       enterRoom);
        socket.on("joined_successfully",enterRoom);
        socket.on("room_updated",       d => { setTopic_(d.topic); setPlayers([...d.players]); });
        socket.on("join_failed",        e => { toast.error(`Join failed: ${e}`); onClose(); });
        socket.on("player_joined",      p => setPlayers([...p]));
        socket.on("online_users_update",u => setOnlineUsers(u));

        socket.on("question_started", d => {
            setGameState("question"); setQuestion(d.question);
            setTimeLeft(d.timeRemaining); setTimeTotal(d.timePerQuestion || 15);
            setAnsweredCount(0); setPicked(null); pickedRef.current = null; setReveal(null);
        });
        socket.on("timer_tick",       t => setTimeLeft(t));
        socket.on("player_answered",  d => setAnsweredCount(d.answeredCount));
        socket.on("answer_revealed",  d => {
            setGameState("leaderboard"); setReveal(d); setBoard(d.leaderboard);
            pickedRef.current === null || pickedRef.current !== d.correctIndex ? playFail() : playWin();
        });
        socket.on("game_finished", d => {
            setGameState("finished"); setBoard(d.leaderboard);
            if (d.leaderboard[0]?.id === userId) runConfetti();
        });
        socket.on("match_chat", m => setMsgs(p => [...p.slice(-49), m]));
        socket.on("meme_alert", () => playFail());

        return () => ["room_created","joined_successfully","room_updated","join_failed","player_joined",
            "online_users_update","question_started","timer_tick","player_answered","answer_revealed",
            "game_finished","match_chat","meme_alert"].forEach(e => socket.off(e));
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3" style={{ background: 'rgba(3,4,11,0.92)', backdropFilter: 'blur(20px)' }}>
            <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                className="relative w-full max-w-5xl flex flex-col overflow-hidden"
                style={{ height: '92vh', background: '#080b1a', borderRadius: 32, border: '1px solid rgba(255,255,255,0.07)' }}
            >
                {/* Ambient blobs */}
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(192,38,211,0.12) 0%, transparent 70%)' }} />

                {/* ── HEADER ── */}
                <div className="relative z-10 flex items-center justify-between px-6 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,11,26,0.8)', backdropFilter: 'blur(12px)' }}>
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#c026d3)' }}>
                            <Zap size={15} fill="white" className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-wider leading-none">Neural Clash</p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: '#6366f1' }}>Arena</p>
                        </div>
                    </div>

                    {/* GAME PIN — always visible */}
                    {room && (
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Game PIN</span>
                            <div className="px-5 py-1" style={{ background: 'white', borderRadius: 10 }}>
                                <span className="text-xl font-black tracking-widest font-mono" style={{ color: '#080b1a' }}>{room}</span>
                            </div>
                        </div>
                    )}

                    {/* Right actions */}
                    <div className="flex items-center gap-1.5">
                        {gameState !== "lobby" && room && (
                            <button onClick={() => setChatOpen(v => !v)} className="relative p-2 rounded-xl transition-all" style={{ background: chatOpen ? '#6366f1' : 'rgba(255,255,255,0.05)', color: chatOpen ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                <MessageSquare size={17} />
                                {msgs.length > 0 && !chatOpen && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ background: '#6366f1' }}>
                                        {Math.min(msgs.length, 9)}
                                    </span>
                                )}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ color: 'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
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
                            style={{ width: 260, height: 320, background: 'rgba(6,8,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                        >
                            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(99,102,241,0.12)' }}>
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare size={13} style={{ color: '#6366f1' }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>Match Chat</span>
                                </div>
                                <button onClick={() => setChatOpen(false)} className="p-1 rounded-lg transition-all hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    <X size={13} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                                {msgs.length === 0 && <p className="text-center text-[10px] mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>No messages yet</p>}
                                {msgs.map((m, i) => {
                                    const isMe = m.userName === userName;
                                    return (
                                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-[9px] font-bold uppercase px-1 mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{m.userName}</span>
                                            <div className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium max-w-[90%]" style={{ background: isMe ? '#6366f1' : 'rgba(255,255,255,0.08)', color: 'white' }}>{m.text}</div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEnd} />
                            </div>
                            <div className="p-2 flex gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()}
                                    placeholder="Message..." className="flex-1 rounded-xl px-2.5 py-1.5 text-[11px] text-white outline-none"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                <button onClick={sendMsg} disabled={!chatInput.trim()} className="p-1.5 rounded-xl text-white" style={{ background: '#6366f1', opacity: chatInput.trim() ? 1 : 0.3 }}>
                                    <Send size={12} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MAIN CONTENT ── */}
                <div className="flex-1 overflow-y-auto relative z-10" style={{ padding: '1.5rem' }}>
                    <AnimatePresence mode="wait">

                        {/* ══════════ LOBBY ══════════ */}
                        {gameState === "lobby" && (
                            <motion.div key="lobby" initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,scale:.96 }} className="h-full flex flex-col gap-6">

                                {/* Pin spotlight */}
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Share this PIN with friends</p>
                                    <div className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)' }}>
                                        <span className="text-5xl font-black font-mono tracking-widest text-white">{room || '------'}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Lobby Open</span>
                                    </div>
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
                                                    style={{ background: i===0 ? 'rgba(251,191,36,0.15)' : p.isReady ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: i===0 ? '#fbbf24' : p.isReady ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                                                    {i === 0 ? 'HOST' : p.isReady ? '✓ READY' : 'WAITING'}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {[...Array(Math.max(0, 6 - players.length))].map((_, i) => (
                                            <div key={i} className="flex items-center justify-center p-4 rounded-2xl" style={{ border: '2px dashed rgba(255,255,255,0.07)', minHeight: 112 }}>
                                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>Waiting...</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Settings sidebar */}
                                    <div className="w-64 flex flex-col gap-4 flex-shrink-0">
                                        {/* Topic */}
                                        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Topic</p>
                                            {isHost ? (
                                                <select value={topic_} onChange={e => changeTopic(e.target.value)}
                                                    className="w-full rounded-xl px-3 py-2 text-[11px] font-bold text-indigo-300 outline-none"
                                                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                                    <option value="General CS">General CS</option>
                                                    {courses.map(c => <option key={c.id} value={c.name}>{c.name} (Y{c.year_number}S{c.semester_number})</option>)}
                                                </select>
                                            ) : (
                                                <div className="px-3 py-2 rounded-xl text-[11px] font-bold text-indigo-300 text-center" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>{topic_}</div>
                                            )}
                                        </div>

                                        {/* Match config */}
                                        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <Settings size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Match Config</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Questions</p>
                                                    <div className="flex gap-1.5">
                                                        {[5,10,15].map(n => (
                                                            <button key={n} disabled={!isHost} onClick={() => setCfg(c => ({...c, questionCount: n}))}
                                                                className="flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all"
                                                                style={{ background: cfg.questionCount===n ? '#6366f1' : 'rgba(255,255,255,0.06)', color: cfg.questionCount===n ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                                                {n}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Seconds / Q</p>
                                                    <div className="flex gap-1.5">
                                                        {[10,15,30].map(t => (
                                                            <button key={t} disabled={!isHost} onClick={() => setCfg(c => ({...c, timePerQuestion: t}))}
                                                                className="flex-1 py-1.5 rounded-lg text-[11px] font-black transition-all"
                                                                style={{ background: cfg.timePerQuestion===t ? '#6366f1' : 'rgba(255,255,255,0.06)', color: cfg.timePerQuestion===t ? 'white' : 'rgba(255,255,255,0.4)' }}>
                                                                {t}s
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Online users */}
                                        <div className="flex-1 p-4 rounded-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={11} style={{ color: '#6366f1' }} />
                                                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Online</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-400">{onlineUsers.length}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1.5 overflow-y-auto">
                                                {onlineUsers.filter(u => u.id !== userId).map((u, i) => (
                                                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-xl group" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{u.name.charAt(0)}</div>
                                                        <span className="flex-1 text-[11px] font-bold text-white truncate">{u.name}</span>
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
                                    {isHost ? (
                                        <motion.button onClick={startGame}
                                            disabled={players.length > 1 && !players.slice(1).every(p => p.isReady)}
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                            className="px-16 py-5 rounded-2xl text-white text-xl font-black uppercase tracking-widest shadow-2xl disabled:opacity-40 flex items-center gap-3"
                                            style={{ background: 'linear-gradient(135deg,#6366f1,#c026d3)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
                                            <Zap size={22} fill="white" />
                                            {players.length > 1 && !players.slice(1).every(p => p.isReady) ? 'Waiting for Ready...' : 'Launch Arena'}
                                        </motion.button>
                                    ) : (
                                        <motion.button onClick={() => socket.emit("toggle_ready",{ roomId:room, userId })}
                                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                            className="px-16 py-5 rounded-2xl text-xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                                            style={{ background: players.find(p=>p.id===userId)?.isReady ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#6366f1,#6366f1)', border: players.find(p=>p.id===userId)?.isReady ? '2px solid #22c55e' : 'none', color: players.find(p=>p.id===userId)?.isReady ? '#22c55e' : 'white' }}>
                                            <Zap size={22} fill="currentColor" />
                                            {players.find(p=>p.id===userId)?.isReady ? '✓ READY' : 'READY UP'}
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
                                        <div className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                            Q{question.index + 1} / {question.total}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                            <Users size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                            <span className="text-[11px] font-black text-white">{answeredCount}/{players.length}</span>
                                            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>answered</span>
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
                                <div className="rounded-2xl px-8 py-6 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 96 }}>
                                    <h2 className="text-2xl font-bold text-white text-center leading-snug">{question.text}</h2>
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
                            <motion.div key="leaderboard" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} className="h-full flex flex-col gap-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-4xl font-black text-white italic mb-1">Standings</h2>
                                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#6366f1' }}>After Question {question?.index + 1}</p>
                                    </div>
                                    {reveal && (
                                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: COLORS[reveal.correctIndex]?.bg }}>
                                                {COLORS[reveal.correctIndex]?.shape}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Correct Answer</p>
                                                <p className="text-sm font-bold text-white max-w-[180px] truncate">{question?.options?.[reveal.correctIndex]}</p>
                                            </div>
                                            <div className="text-3xl font-black ml-2" style={{ color: picked === reveal.correctIndex ? '#22c55e' : '#ef4444' }}>
                                                {picked === reveal.correctIndex ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2.5 overflow-y-auto">
                                    {board.map((p, i) => (
                                        <motion.div key={p.id} initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} transition={{ delay: i*0.04 }}
                                            className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                                            style={{ background: p.id===userId ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: p.id===userId ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.05)' }}>
                                            <span className="text-2xl font-black w-10 text-center" style={{ color: i===0 ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
                                                {i === 0 ? <Crown size={22} className="mx-auto" style={{ color: '#fbbf24' }} /> : `#${i+1}`}
                                            </span>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-white" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{p.name}{p.id===userId ? ' (You)' : ''}</p>
                                                {p.streak > 1 && <span className="text-[10px] font-black" style={{ color: '#f97316' }}>🔥 {p.streak}x streak</span>}
                                            </div>
                                            <span className="text-xl font-black tabular-nums" style={{ color: '#6366f1' }}>{p.score.toLocaleString()}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {reveal?.explanation && (
                                    <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,210,255,0.7)' }}>
                                            <span className="font-black text-white mr-2">Why:</span>{reveal.explanation}
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
                                    <h2 className="text-5xl font-black text-white italic mb-2">Game Over!</h2>
                                    <p className="text-slate-400">Final synaptic rankings are in.</p>
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
                                            <div className="text-xs font-bold text-white truncate max-w-[80px]">{p.name}</div>
                                            <div className="rounded-t-xl flex flex-col items-center justify-start pt-3 w-24"
                                                style={{ height: pos===1 ? 120 : pos===0 ? 84 : 60, background: pos===1 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)', borderTop: `3px solid ${pos===1 ? '#fbbf24' : pos===0 ? '#94a3b8' : '#f97316'}` }}>
                                                <span className="font-black" style={{ color: pos===1 ? '#fbbf24' : pos===0 ? '#94a3b8' : '#f97316', fontSize: pos===1 ? 24 : 18 }}>
                                                    #{pos===1?1:pos===0?2:3}
                                                </span>
                                                <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.score.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <motion.button onClick={onClose} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                                    className="px-12 py-4 rounded-2xl text-white font-black uppercase tracking-widest"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    Leave Arena
                                </motion.button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
