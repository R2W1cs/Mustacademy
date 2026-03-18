import { motion } from "framer-motion";
import { X, Trophy, Medal, Star, Target } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function LeaderboardModal({ onClose, isDark }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get("/contributions/leaderboard");
                setLeaderboard(res.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const modalBg = isDark ? "bg-[#0a0e1a]/95 border-white/10" : "bg-white/95 border-indigo-50 shadow-2xl";
    const textColor = isDark ? "text-white" : "text-slate-900";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-2xl rounded-[2.5rem] border backdrop-blur-2xl p-8 relative overflow-hidden ${modalBg}`}
        >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Trophy size={200} className={isDark ? "text-white" : "text-indigo-900"} />
            </div>

            <button
                onClick={onClose}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Trophy size={24} />
                </div>
                <div>
                    <h2 className={`text-2xl font-black ${textColor}`}>Elite Rankings</h2>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-amber-400/60' : 'text-amber-600/60'}`}>Cohort Performance Index</p>
                </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className={`h-16 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                    ))
                ) : leaderboard.length > 0 ? (
                    leaderboard.map((student, index) => {
                        const isTop3 = index < 3;
                        const rankColors = [
                            "from-amber-400 to-yellow-600",
                            "from-slate-300 to-slate-500",
                            "from-orange-400 to-orange-700"
                        ];

                        return (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={student.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-lg'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isTop3 ? `bg-gradient-to-br ${rankColors[index]} text-white shadow-lg` : (isDark ? 'bg-gray-800 text-gray-500' : 'bg-white text-slate-400')}`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold truncate ${textColor}`}>{student.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-cyan-400/60' : 'text-cyan-600/60'}`}>Level {student.level}</span>
                                        <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>{student.contribution_score} XP</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <span className={`text-xl font-black tracking-tighter ${textColor}`}>{student.current_asc}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-indigo-600'}`}>ASC</span>
                                    </div>
                                    <p className={`text-[9px] font-medium ${textMuted}`}>Signal Strength</p>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center opacity-30">
                        <Star size={48} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-sm">No rankings available yet</p>
                    </div>
                )}
            </div>

            <div className={`mt-8 p-4 rounded-2xl border text-center ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Competition drives excellence. Keep contributing to climb the ranks.
                </p>
            </div>
        </motion.div>
    );
}
