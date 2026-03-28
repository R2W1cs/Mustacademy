import { useState, useEffect } from "react";
import MultiplayerQuizModal from "../components/MultiplayerQuizModal";
import { useTheme } from "../auth/ThemeContext";
import { Rocket, Users, Zap, ChevronRight, Crown } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import api from "../api/axios";

export default function NeuralClashPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isArenaOpen, setIsArenaOpen] = useState(false);
    const [arenaAction, setArenaAction] = useState(null); // 'host' or 'join'
    const [joinCode, setJoinCode] = useState("");
    const [onlineCount, setOnlineCount] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [lbLoading, setLbLoading] = useState(true);
    const socket = useSocket();

    useEffect(() => {
        socket.emit("get_online_users");
        socket.on("online_users_update", (users) => setOnlineCount(users.length));
        return () => { socket.off("online_users_update"); };
    }, [socket]);

    useEffect(() => {
        api.get("/arena/leaderboard")
            .then(res => setLeaderboard(res.data))
            .catch(() => {})
            .finally(() => setLbLoading(false));
    }, [isArenaOpen]); // refresh after each match

    const cardClass = isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-slate-200 shadow-xl";

    return (
        <div className={`min-h-screen p-8 lg:p-12 animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <header className="mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-14 h-14 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                        <Rocket size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block mb-1">Combat Assessment</span>
                        <h1 className="text-4xl font-black tracking-tight uppercase">Neural Clash Arena</h1>
                    </div>
                </div>
                <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'} max-w-2xl text-sm leading-relaxed`}>
                    Enter the high-fidelity assessment arena. Compete with peer scholars in real-time to validate your industrial readiness and cognitive supremacy.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className={`p-12 rounded-[3rem] border flex flex-col items-center text-center relative overflow-hidden ${cardClass}`}>
                        {/* Ambient Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 mx-auto mb-8 animate-float">
                                <Zap className="text-white" size={40} fill="white" />
                            </div>

                            <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">Enter the Simulation</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium">
                                Host a new assessment protocol or enter an existing room code to join an active simulation.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    onClick={() => {
                                        setArenaAction('host');
                                        setIsArenaOpen(true);
                                    }}
                                    className="group px-8 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 w-full sm:w-auto"
                                >
                                    <Zap size={20} fill="white" className="group-hover:rotate-12 transition-transform" />
                                    Host Arena
                                </button>

                                <div className={`w-full sm:w-auto flex items-center gap-2 p-2 rounded-2xl border focus-within:border-indigo-500/50 transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-300'}`}>
                                    <input
                                        type="text"
                                        placeholder="ROOM CODE"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        className={`bg-transparent border-none outline-none font-mono font-black uppercase tracking-widest px-4 w-32 italic ${isDark ? 'text-white placeholder:text-white/20' : 'text-slate-800 placeholder:text-slate-400'}`}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!joinCode) return;
                                            setArenaAction('join');
                                            setIsArenaOpen(true);
                                        }}
                                        disabled={!joinCode}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Live stats */}
                    <div className={`p-5 rounded-[2.5rem] border ${cardClass}`}>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-40">Arena Intel</h3>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Users size={15} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Scholars</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="font-mono text-indigo-400 font-black">{onlineCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* ELO Leaderboard */}
                    <div className={`p-5 rounded-[2.5rem] border flex flex-col ${cardClass}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Crown size={13} className="text-amber-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">ELO Ranking</h3>
                        </div>

                        {lbLoading ? (
                            <div className="flex justify-center py-6 opacity-20">
                                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <p className="text-center text-[10px] opacity-20 py-6 uppercase tracking-widest">No rankings yet</p>
                        ) : (
                            <div className="space-y-1.5">
                                {leaderboard.slice(0, 10).map((player, i) => {
                                    const myId = localStorage.getItem('userId');
                                    const isMe = String(player.id) === String(myId);
                                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                                    return (
                                        <div
                                            key={player.id}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isMe ? (isDark ? 'bg-indigo-500/15 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-200') : (isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50')}`}
                                        >
                                            <span className="w-5 text-center text-[10px] font-black shrink-0">
                                                {medal || <span className="text-slate-600">{i + 1}</span>}
                                            </span>
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-black text-white shrink-0">
                                                {player.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className={`flex-1 text-[11px] font-bold truncate ${isMe ? 'text-indigo-400' : isDark ? 'text-white/70' : 'text-slate-700'}`}>
                                                {isMe ? 'You' : player.name}
                                            </span>
                                            <span className={`text-[10px] font-black tabular-nums shrink-0 ${i === 0 ? 'text-amber-400' : isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                {player.elo_rating}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isArenaOpen && (
                <MultiplayerQuizModal
                    onClose={() => {
                        setIsArenaOpen(false);
                        setArenaAction(null);
                        setJoinCode("");
                    }}
                    action={arenaAction}
                    joinCode={joinCode}
                />
            )}
        </div>
    );
}
