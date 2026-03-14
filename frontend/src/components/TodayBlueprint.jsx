import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Clock, Zap, Play, Pause, CheckCircle2, Brain,
    Lock, AlertCircle, RefreshCw, ArrowRight, Target, Flame, Activity,
    Maximize2, Minimize2, Bot, Sparkles
} from "lucide-react";
import { usePlan } from "../auth/PlanContext";

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function TodayBlueprint({ isDark, onPlanBuild }) {
    const navigate = useNavigate();
    const {
        plan, activeBlockIndex, timeLeft, isRunning, toggleTimer, completeBlock
    } = usePlan();

    const [completedSubTasks, setCompletedSubTasks] = useState([]);
    const [isMinimized, setIsMinimized] = useState(true);
    const [showAllPlan, setShowAllPlan] = useState(false);
    const [showAllSubTasks, setShowAllSubTasks] = useState(false);

    const toggleSubTask = (idx) => {
        setCompletedSubTasks(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    useEffect(() => {
        setCompletedSubTasks([]);
    }, [activeBlockIndex]);

    const handleComplete = async () => {
        await completeBlock();
    };

    // No local loading state needed as plan comes from context
    if (!plan && !activeBlockIndex) return null;

    if (!plan) {
        return (
            <section className="mb-16 animate-fade-in px-4">
                <div className={`group relative rounded-[3rem] p-12 overflow-hidden transition-all duration-700 border ${isDark
                    ? 'bg-[#0a0e1a]/80 border-indigo-500/20 shadow-[0_0_80px_-20px_rgba(79,70,229,0.3)]'
                    : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 border-indigo-100 shadow-2xl shadow-indigo-200/40'}`}>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 relative ${isDark ? 'bg-indigo-500/10' : 'bg-white shadow-xl'}`}
                        >
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 animate-ping opacity-20" />
                            <Target className={isDark ? "text-indigo-400" : "text-indigo-600"} size={42} strokeWidth={1.5} />
                        </motion.div>

                        <h3 className={`text-3xl font-black mb-4 tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Momentum <span className="text-indigo-500">Architect</span>
                        </h3>
                        <p className={`max-w-xl text-base mb-10 font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Your high-performance protocol is offline. Forge a precision blueprint to dominate your cognitive objectives and trigger peak flow state.
                        </p>

                        <button
                            onClick={onPlanBuild}
                            className={`group relative flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 ${isDark
                                ? 'bg-indigo-600 text-white shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500'
                                : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 hover:bg-slate-800'}`}
                        >
                            <Zap size={18} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                            <span>Initialize Strategy</span>
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const activeBlock = activeBlockIndex !== null ? plan.schedule[activeBlockIndex] : null;

    return (
        <section className="mb-16 animate-fade-in relative z-10 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center relative ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white border border-indigo-100 shadow-xl'}`}>
                        <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/10 animate-pulse" />
                        <Activity size={28} className="text-indigo-500 relative z-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-indigo-400/80' : 'text-indigo-600/80'}`}>
                                Neural Momentum Active
                            </span>
                        </div>
                        <h3 className={`text-2xl font-black tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Command <span className="text-indigo-500">Center</span>
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className={`flex items-center gap-2 pr-5 pl-4 py-3 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest ${isDark
                            ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'}`}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        <span>{isMinimized ? 'Expand Control' : 'Minimize View'}</span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isMinimized ? (
                    <motion.div
                        key="minimized"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 ${isDark
                            ? 'bg-[#0a0e1a]/90 border-indigo-500/20 shadow-xl'
                            : 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/20'}`}
                    >
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                                <Activity size={20} className="text-indigo-500" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {activeBlock?.action || "No Active Protocol"}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Bot size={12} className="text-indigo-500" />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                                            AI Pilot Active
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {formatTime(timeLeft)} remaining
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className={`w-3 h-1 rounded-full ${i < completedSubTasks.length ? 'bg-emerald-500' : (isDark ? 'bg-white/10' : 'bg-slate-200')}`} />
                                    ))}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {completedSubTasks.length}/{activeBlock?.sub_tasks?.length || 0} Modules
                                </span>
                            </div>

                            <button
                                onClick={toggleTimer}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isRunning
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}
                            >
                                {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Active Session Column (Command Deck) */}
                        <div className="lg:col-span-9">
                            <div className={`group relative h-full rounded-[3.5rem] border p-12 overflow-hidden transition-all duration-1000 ${isDark
                                ? 'bg-[#0a0e1a]/95 border-indigo-500/20 shadow-[0_0_100px_-30px_rgba(79,70,229,0.4)]'
                                : 'bg-white border-indigo-100 shadow-[0_40px_80px_-20px_rgba(99,102,241,0.15)]'}`}>

                                {/* Inner Glow / Glass Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-cyan-500/[0.02]" />

                                {activeBlock ? (
                                    <div className="flex flex-col h-full relative z-10">
                                        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-12 mb-16">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className={`w-1 h-12 rounded-full ${isDark ? 'bg-indigo-500/30' : 'bg-indigo-100'}`} />
                                                <div>
                                                    <p className={`text-sm font-medium italic mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        Target duration: <span className={isDark ? "text-indigo-400 font-black" : "text-indigo-600 font-black"}>{activeBlock.duration} mins</span>.
                                                    </p>
                                                    {/* Proactive AI Status */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex p-1 rounded-md bg-indigo-500/10">
                                                            <Bot size={12} className="text-indigo-500" />
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                                                            AI Pilot: Analyzing session depth...
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {!isMinimized && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {/* Task Matrix (Subplans) directly under duration */}
                                                        <div className="flex flex-col gap-3 mb-6">
                                                            {(showAllSubTasks ? activeBlock.sub_tasks : activeBlock.sub_tasks?.slice(0, 4)).map((task, idx) => {
                                                                const isCompleted = completedSubTasks.includes(idx);
                                                                return (
                                                                    <motion.button
                                                                        key={idx}
                                                                        layout
                                                                        onClick={() => toggleSubTask(idx)}
                                                                        className={`group/task relative p-4 rounded-2xl border transition-all text-left flex items-center gap-4 backdrop-blur-sm ${isCompleted
                                                                            ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20 opacity-40' : 'bg-emerald-50 border-emerald-200 opacity-60')
                                                                            : (isDark ? 'bg-[#1a1f2e]/60 border-white/10 hover:border-indigo-500/50 hover:bg-[#1e2538]/80 hover:shadow-lg' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-200 shadow-sm')
                                                                            }`}
                                                                    >
                                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-500 ${isCompleted
                                                                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                                                            : (isDark ? 'border-white/10 bg-white/5 group-hover/task:border-indigo-500' : 'border-slate-200 bg-white group-hover/task:border-indigo-400')}`}>
                                                                            {isCompleted && <CheckCircle2 size={12} strokeWidth={3} className="text-white" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`text-sm font-bold truncate transition-all ${isCompleted ? 'line-through text-slate-500' : (isDark ? 'text-slate-100' : 'text-slate-800')}`}>
                                                                                {task}
                                                                            </p>
                                                                        </div>
                                                                    </motion.button>
                                                                );
                                                            })}

                                                            {activeBlock.sub_tasks?.length > 4 && (
                                                                <button
                                                                    onClick={() => setShowAllSubTasks(!showAllSubTasks)}
                                                                    className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark
                                                                        ? 'text-indigo-400 hover:bg-indigo-500/10'
                                                                        : 'text-indigo-600 hover:bg-indigo-50'}`}
                                                                >
                                                                    {showAllSubTasks ? (
                                                                        <>Collapse Protocol</>
                                                                    ) : (
                                                                        <>{activeBlock.sub_tasks.length - 4} more objects button works</>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Cognitive Progress Bar (Trajectory) under subplans */}
                                                        <div className="mb-10 relative">
                                                            <div className="flex justify-between items-end mb-3">
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Momentum Trajectory</span>
                                                                <span className={`text-xs font-black tabular-nums ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                                    {Math.round(((activeBlock.duration * 60 - timeLeft) / (activeBlock.duration * 60)) * 100)}% Complete
                                                                </span>
                                                            </div>
                                                            <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${isDark ? 'bg-white/5 shadow-inner' : 'bg-slate-100 shadow-inner'}`}>
                                                                <motion.div
                                                                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 relative overflow-hidden"
                                                                    initial={{ width: "0%" }}
                                                                    animate={{ width: `${((activeBlock.duration * 60 - timeLeft) / (activeBlock.duration * 60)) * 100}%` }}
                                                                >
                                                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Holographic Timer Interface */}
                                        <div className={`flex flex-col items-center justify-center p-10 rounded-[3rem] min-w-[320px] transition-all duration-700 relative group/timer ${isRunning
                                            ? (isDark ? 'bg-indigo-600/10 border border-indigo-500/50 shadow-[0_0_60px_-10px_rgba(79,70,229,0.3)] scale-[1.02]' : 'bg-indigo-50 border border-indigo-200 shadow-xl scale-[1.02]')
                                            : (isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200')}`}>

                                            {/* Timer pulse rings */}
                                            {isRunning && (
                                                <>
                                                    <div className="absolute inset-0 rounded-[3rem] border-2 border-indigo-500/20 animate-ping opacity-20" />
                                                    <div className="absolute inset-4 rounded-[2.5rem] border border-indigo-500/10 animate-pulse" />
                                                </>
                                            )}

                                            <div className={`font-mono text-6xl font-black mb-10 tabular-nums tracking-[-0.08em] select-none flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {formatTime(timeLeft).split(':').map((part, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className="relative">
                                                            {part}
                                                            {isRunning && <span className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-50" />}
                                                        </span>
                                                        {i === 0 && <span className="text-indigo-500/50 animate-pulse ">:</span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>

                                            <div className="flex gap-6 w-full relative z-10">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={toggleTimer}
                                                    className={`flex-1 h-20 rounded-3xl flex items-center justify-center transition-all shadow-2xl ${isRunning
                                                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/40 hover:shadow-indigo-500/60'}`}
                                                >
                                                    {isRunning ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-2" />}
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleComplete}
                                                    className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all border ${isDark
                                                        ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/50'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 shadow-lg shadow-indigo-100/50'}`}
                                                >
                                                    <CheckCircle2 size={32} />
                                                </motion.button>
                                            </div>

                                            <div className="mt-6 flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {isRunning ? 'System Executing' : 'Awaiting Link'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 relative z-10">
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-32 h-32 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center mb-10 relative"
                                        >
                                            <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-500/20 animate-ping opacity-20" />
                                            <CheckCircle2 size={64} className="text-emerald-500" strokeWidth={1.5} />
                                        </motion.div>
                                        <h4 className={`text-3xl font-black mb-6 tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            Protocol <span className="text-emerald-500">Mastered</span>
                                        </h4>
                                        <p className={`max-w-md text-sm font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Your cognitive systems have executed all missions for the current cycle. Restoration protocol initialized. Peak momentum achieved.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Vertical Timeline (The Chronos Log) */}
                        <div className="lg:col-span-3">
                            <div className={`h-full rounded-[3.5rem] border p-10 flex flex-col transition-all duration-700 relative overflow-hidden ${isDark
                                ? 'bg-[#0a0e1a]/90 border-indigo-500/20 shadow-2xl'
                                : 'bg-white border-indigo-50 shadow-2xl shadow-indigo-100/10'}`}>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="flex justify-between items-center mb-12 relative z-10">
                                    <h5 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Chronos Log
                                    </h5>
                                    <button
                                        onClick={() => setShowAllPlan(!showAllPlan)}
                                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${isDark
                                            ? 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
                                            : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}
                                    >
                                        {showAllPlan ? 'Active Focus' : 'Full Session'}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-10 no-scrollbar relative z-10">
                                    {(showAllPlan ? plan.schedule : plan.schedule.slice(activeBlockIndex || 0, (activeBlockIndex || 0) + 4)).map((block, i) => {
                                        const realIndex = showAllPlan ? i : (activeBlockIndex || 0) + i;
                                        return (
                                            <div key={realIndex} className={`flex items-start gap-6 relative group/log ${realIndex < (activeBlockIndex || 0) ? 'opacity-30' : ''}`}>
                                                {realIndex !== plan.schedule.length - 1 && (
                                                    <div className={`absolute left-2.5 top-8 bottom-[-32px] w-0.5 ${isDark ? 'bg-indigo-500/10' : 'bg-slate-100'}`}>
                                                        {realIndex < (activeBlockIndex || 0) && <div className="h-full w-full bg-emerald-500/20" />}
                                                        {realIndex === (activeBlockIndex || 0) && <div className="h-full w-full bg-gradient-to-b from-indigo-500/50 to-transparent animate-pulse" />}
                                                    </div>
                                                )}
                                                <div className={`w-5 h-5 rounded-lg z-10 flex items-center justify-center shrink-0 transition-all duration-700 ${block.completed_at
                                                    ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                                    : realIndex === (activeBlockIndex || 0)
                                                        ? 'bg-indigo-500 ring-8 ring-indigo-500/10 shadow-[0_0_25px_rgba(79,70,229,0.6)]'
                                                        : (isDark ? 'bg-[#1a1f2e] border border-white/10' : 'bg-white border-2 border-slate-100 shadow-sm')
                                                    }`}
                                                >
                                                    {block.completed_at && <CheckCircle2 size={12} strokeWidth={4} className="text-white" />}
                                                    {realIndex === (activeBlockIndex || 0) && <Activity size={10} className="text-white animate-pulse" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className={`text-[10px] font-black tabular-nums transition-colors ${realIndex === (activeBlockIndex || 0) ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                            {block.time}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm font-black truncate transition-all tracking-tight uppercase italic ${isDark ? 'text-slate-300' : 'text-slate-700'} ${realIndex === (activeBlockIndex || 0) ? 'text-white scale-105 origin-left' : ''} ${block.completed_at ? 'line-through opacity-70' : ''}`}>
                                                        {block.action}
                                                    </p>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                        {block.duration} MIN SESSION
                                                    </span>
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
        </section >
    );
}
