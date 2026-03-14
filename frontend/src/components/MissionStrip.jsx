import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Target, Activity, Maximize2, Minimize2, CheckCircle2, Play, Flame } from "lucide-react";
import api from "../api/axios";
import { usePlan } from "../auth/PlanContext";

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function MissionStrip({ isDark }) {
    const { plan, refreshPlan } = usePlan();
    const [isExpanded, setIsExpanded] = useState(false);

    // Timer states
    const [activeBlockIndex, setActiveBlockIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    // Sync active block when plan changes
    useEffect(() => {
        if (plan?.schedule) {
            const firstInbox = plan.schedule.findIndex(b => !b.completed_at);
            if (firstInbox !== -1) {
                setActiveBlockIndex(firstInbox);
                if (!isRunning) {
                    setTimeLeft(plan.schedule[firstInbox].duration * 60);
                }
            } else {
                setActiveBlockIndex(null);
            }
        }
    }, [plan]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleComplete();
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft]);

    const handleComplete = async () => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            await api.post('/ai/daily-plan/session-complete', { blockIndex: activeBlockIndex });
            refreshPlan(); // Refresh from context to update entire app
        } catch (err) {
            console.error("Failed to sync completion:", err);
        }
    };

    if (!plan) return null;

    const activeBlock = activeBlockIndex !== null ? plan.schedule[activeBlockIndex] : null;
    const isAllComplete = activeBlockIndex === null;

    if (isAllComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 rounded-2xl p-4 flex items-center justify-between border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
            >
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-sm font-black uppercase tracking-widest">Daily Protocol Completed</span>
                </div>
                <span className="text-[10px] font-bold uppercase">All systems optimized</span>
            </motion.div>
        );
    }

    return (
        <div className="mb-8 relative z-30">
            {/* === COMPACT STRIP (Always visible when not expanded) === */}
            <AnimatePresence mode="wait">
                {!isExpanded && (
                    <motion.div
                        key="compact"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`overflow-hidden rounded-2xl border backdrop-blur-md shadow-lg transition-colors cursor-pointer group ${isDark
                            ? 'bg-[#0f1729]/80 border-indigo-500/30 hover:border-indigo-400/50 hover:bg-[#0f1729]'
                            : 'bg-white border-indigo-200 hover:border-indigo-300 hover:shadow-indigo-100'
                            }`}
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="flex items-center justify-between p-3 px-5">
                            {/* Left: Status & Title */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                                    <Activity size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                                </div>
                                <div className="min-w-0 flex-1 flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Active Mission
                                    </span>
                                    <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-indigo-100'} shrink-0`} />
                                    <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                        {activeBlock?.action || "Awaiting Orders"}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Timer & Expand */}
                            <div className="flex items-center gap-4 shrink-0">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-[#0a0e1a]/80 border border-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                                    <Clock size={12} className={timeLeft < 300 ? "text-red-400 animate-pulse" : (isDark ? "text-slate-400" : "text-slate-500")} />
                                    <span className={`text-xs font-black tabular-nums transition-colors ${timeLeft < 300 ? 'text-red-400' : (isDark ? 'text-white' : 'text-slate-700')}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>

                                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
                                    <Maximize2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar under the strip */}
                        <div className={`h-1 w-full flex ${isDark ? 'bg-[#0a0e1a]' : 'bg-slate-100'}`}>
                            {plan.schedule.map((b, i) => (
                                <div
                                    key={i}
                                    className={`h-full transition-all ${b.completed_at ? 'bg-emerald-500' : i === activeBlockIndex ? 'bg-indigo-500' : 'bg-transparent'}`}
                                    style={{ width: `${(b.duration / plan.schedule.reduce((acc, curr) => acc + curr.duration, 0)) * 100}%` }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* === EXPANDED BLUEPRINT VIEW === */}
            <AnimatePresence mode="wait">
                {isExpanded && (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0, scale: 0.98 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.98 }}
                        className={`overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-xl ${isDark
                            ? 'bg-[#0f1729]/95 border-indigo-500/20 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)]'
                            : 'bg-white border-indigo-100 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)]'
                            }`}
                    >
                        {/* Top Header Row */}
                        <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-[#0a0e1a]/50' : 'border-indigo-50 bg-indigo-50/30'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                                    <Target className={isDark ? "text-indigo-400" : "text-indigo-600"} size={20} />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-transparent animate-pulse" style={{ borderColor: isDark ? '#0f1729' : 'white' }} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-black tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Momentum Blueprint</h3>
                                    <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest mt-1">
                                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{plan.schedule.length} Sessions</span>
                                        <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>•</span>
                                        <span className={isDark ? 'text-indigo-400' : 'text-indigo-600'}>{plan.technique.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                            >
                                <Minimize2 size={12} /> Minimize
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Left Col: Active Timer Focus */}
                            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-8 rounded-[2rem] border relative overflow-hidden group">
                                <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark
                                    ? isRunning ? 'bg-indigo-500/10 opacity-100' : 'bg-white/[0.02] opacity-50'
                                    : isRunning ? 'bg-indigo-50 opacity-100' : 'bg-slate-50 opacity-50'}`}
                                />

                                {isRunning && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                                )}

                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Active Block
                                    </span>
                                    <h2 className={`text-2xl font-bold mb-8 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {activeBlock?.action}
                                    </h2>

                                    <div className={`text-6xl font-black tabular-nums tracking-tighter mb-8 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                        {formatTime(timeLeft)}
                                    </div>

                                    <div className="flex gap-4 w-full">
                                        <button
                                            onClick={() => setIsRunning(!isRunning)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isRunning
                                                    ? (isDark ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-rose-100 text-rose-600 hover:bg-rose-200')
                                                    : (isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20')
                                                }`}
                                        >
                                            {isRunning ? 'Pause' : 'Engage'}
                                            {!isRunning && <Zap size={14} className={isDark ? "" : "text-amber-300"} />}
                                        </button>
                                        <button
                                            onClick={handleComplete}
                                            className={`w-14 items-center justify-center rounded-2xl flex transition-all ${isDark ? 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400' : 'bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 text-slate-500'}`}
                                            title="Mark Complete"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Mission List */}
                            <div className="lg:col-span-7 pl-0 lg:pl-6 border-t pt-8 lg:pt-0 lg:border-t-0 lg:border-l border-dashed border-slate-700/30">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mission Trajectory</h4>

                                <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:to-transparent">
                                    {plan.schedule.map((block, i) => {
                                        const isCompleted = block.completed_at;
                                        const isActive = i === activeBlockIndex;
                                        const isPending = i > activeBlockIndex;

                                        return (
                                            <div key={i} className={`relative pl-10 transition-opacity ${isCompleted ? 'opacity-40' : isActive ? 'opacity-100 scale-[1.02]' : 'opacity-60 grayscale'}`}>
                                                {/* Node */}
                                                <div className={`absolute left-[9px] top-3 w-3 h-3 rounded-full flex items-center justify-center ring-4 ${isDark ? 'ring-[#0f1729]' : 'ring-white'} ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)]' : (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                                    }`}>
                                                    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                                </div>

                                                {/* Card */}
                                                <div className={`p-4 rounded-2xl border transition-all ${isActive
                                                        ? isDark ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-900/20' : 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100/50'
                                                        : isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                    }`}>
                                                    <div className="flexjustify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                                                    {block.type === 'work' ? 'Focus Block' : 'Recovery Entry'}
                                                                </span>
                                                                <span className={`text-[9px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>• {block.duration}m</span>
                                                            </div>
                                                            <h5 className={`text-sm font-bold ${isActive ? (isDark ? 'text-white' : 'text-indigo-900') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                                                                {block.action}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
