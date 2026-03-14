import { useState, useEffect } from "react";
import MultiplayerQuizModal from "../components/MultiplayerQuizModal";
import { useTheme } from "../auth/ThemeContext";
import { Rocket, Users, Zap, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSocket } from "../hooks/useSocket";

export default function NeuralClashPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isArenaOpen, setIsArenaOpen] = useState(false);
    const [arenaAction, setArenaAction] = useState(null); // 'host' or 'join'
    const [joinCode, setJoinCode] = useState("");
    const [onlineCount, setOnlineCount] = useState(0);
    const socket = useSocket();

    useEffect(() => {
        socket.emit("get_online_users");

        socket.on("online_users_update", (users) => {
            setOnlineCount(users.length);
        });

        return () => {
            socket.off("online_users_update");
        };
    }, [socket]);

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

                                <div className="w-full sm:w-auto flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-indigo-500/50 transition-colors">
                                    <input
                                        type="text"
                                        placeholder="ROOM CODE"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                        className="bg-transparent border-none outline-none text-white font-mono font-black uppercase tracking-widest px-4 w-32 placeholder:text-white/20 italic"
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
                    <div className={`p-6 rounded-[2.5rem] border ${cardClass}`}>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-40">Arena Intel</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Users size={16} className="text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Classmates</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="font-mono text-indigo-400 font-black">{onlineCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Trophy size={16} className="text-amber-400" />
                                    <span className="text-[10px] font-black uppercase">Apex Yield</span>
                                </div>
                                <span className="font-mono text-amber-500">+100 ASC</span>
                            </div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-[2.5rem] border bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40 border-indigo-500/20`}>
                        <h3 className="text-white font-black mb-4 uppercase italic tracking-widest text-xs">Faculty Note:</h3>
                        <p className="text-indigo-200/60 text-xs leading-relaxed italic">
                            "The Neural Clash is not merely a game; it is a real-time validation of your ability to synthesize first principles under industrial pressure. Proceed with absolute focus."
                        </p>
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
