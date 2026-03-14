import React, { useState, useEffect, useMemo } from "react";
import Markdown from "markdown-to-jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, BookOpen, Lightbulb, Loader2, Info,
    CheckCircle2, XCircle, Trophy, Target,
    Code2, Terminal, Zap
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// ─── Sub-components ──────────────────────────────────────────────────────────

const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { theme } = useTheme(); // Note: useTheme needs to be imported if not already, checking...
    const isDark = theme === 'dark';
    const borderClass = isDark ? 'border-indigo-500/30' : 'border-indigo-100 hover:border-emerald-200 shadow-sm bg-white/50';
    const accentClass = isDark ? 'text-indigo-400' : 'text-emerald-700';

    return (
        <div className={`mb-6 rounded-[2rem] border glass-morphism overflow-hidden transition-all duration-500 ${isOpen ? (isDark ? 'border-indigo-500/30' : borderClass) : (isDark ? 'border-indigo-500/5' : 'border-indigo-50/50')}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isOpen ? (isDark ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.3)]') : 'bg-white/20'}`} />
                    <span className={`text-[13px] font-black uppercase tracking-widest transition-colors ${isOpen ? accentClass : 'text-foreground/60 group-hover:text-foreground'}`}>
                        {title}
                    </span>
                </div>
                <ChevronDown size={18} className={`text-foreground/30 group-hover:text-foreground/60 transition-transform duration-500 ${isOpen ? `rotate-180 ${accentClass}` : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="px-12 pb-10 text-base lg:text-lg leading-relaxed text-foreground/70 font-medium border-t border-foreground/10 pt-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StaffNote = ({ children }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <div className={`my-20 p-12 rounded-[2.5rem] glass-morphism border-indigo-500/5 font-sans relative overflow-hidden group shadow-[0_20px_60px_rgba(99,102,241,0.05)] ${isDark ? '' : 'bg-emerald-50/30 border-emerald-100'}`}>
            <div className={`absolute top-0 right-0 p-32 ${isDark ? 'bg-indigo-500/5' : 'bg-emerald-500/5'} blur-[100px] rounded-full pointer-events-none group-hover:opacity-60 transition-colors duration-1000`} />
            <div className="absolute top-6 left-10 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200'} border`}>
                    <Lightbulb size={16} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-indigo-400/80' : 'text-emerald-600/80'} italic`}>Staff Architect Insight</span>
            </div>
            <div className={`relative z-10 pt-10 text-lg lg:text-xl ${isDark ? 'text-foreground' : 'text-emerald-950'} font-serif italic leading-relaxed`}>
                {children}
            </div>
        </div>
    );
};

const MathComponent = ({ math, block }) => {
    return block ? <BlockMath math={math} /> : <InlineMath math={math} />;
};

// ─── Exercises Engine ────────────────────────────────────────────────────────

const TopicExercises = ({ topicId, topicTitle }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [exercises, setExercises] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mcqCount, setMcqCount] = useState(10);
    const [shortCount, setShortCount] = useState(5);
    const [answers, setAnswers] = useState({}); // { mcq_0: 'A', short_0: '...' }
    const [checked, setChecked] = useState({}); // { mcq_0: true }

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);
        console.log(`[MasteryCrucible] Initializing matrix for: ${topicTitle} with ${mcqCount} MCQs`);
        try {
            const res = await api.post("/ai/topics/exercises", {
                topicId,
                topicTitle,
                mcqCount,
                shortAnswerCount: shortCount
            });

            if (res.data && res.data.exercises) {
                setExercises(res.data.exercises);
            } else {
                throw new Error("AI returned empty exercises protocol.");
            }
        } catch (err) {
            console.error("[MasteryCrucible] Generation failed:", err);
            setError(err.response?.data?.message || err.message || "Neural Link Timeout");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="mt-20 p-12 rounded-[2rem] border border-rose-500/20 bg-rose-500/5 text-center">
                <XCircle className="mx-auto mb-4 text-rose-500" size={32} />
                <h3 className="text-lg font-black text-rose-400 uppercase tracking-widest mb-2">Sync Failure</h3>
                <p className="text-foreground/60 mb-6 font-medium">{error}</p>
                <button
                    onClick={fetchExercises}
                    className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
                >
                    Retry Neural Sync
                </button>
            </div>
        );
    }

    if (!exercises && !loading) {
        return (
            <div className={`mt-20 p-16 rounded-[4rem] border relative overflow-hidden group ${isDark ? 'bg-foreground/[0.02] border-foreground/10 backdrop-blur-xl' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-500/5'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 ${isDark ? 'opacity-50' : 'opacity-80'}`} />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border shadow-sm ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'bg-indigo-50 border-indigo-200'}`}>
                        <Zap size={32} className="text-indigo-500" />
                    </div>

                    <h3 className={`text-2xl font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-foreground' : 'text-slate-900'}`}>Mastery Crucible</h3>
                    <p className={`mb-12 max-w-md mx-auto leading-relaxed ${isDark ? 'text-foreground/50' : 'text-slate-500 font-medium'}`}>Define your training rigor and generate personalized AI challenges.</p>

                    {/* Parameter Console */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-12 p-10 rounded-[2.5rem] border shadow-sm ${isDark ? 'glass-morphism border-indigo-500/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="space-y-4 text-left">
                            <label className={`text-[10px] font-black uppercase tracking-widest flex justify-between ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                MCQ Density <span>{mcqCount}</span>
                            </label>
                            <input
                                type="range" min="10" max="30" step="1"
                                value={mcqCount}
                                onChange={(e) => setMcqCount(parseInt(e.target.value))}
                                className={`w-full accent-indigo-500 rounded-lg appearance-none cursor-pointer h-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}
                            />
                            <div className={`flex justify-between text-[10px] font-bold ${isDark ? 'text-foreground/30' : 'text-slate-400'}`}>
                                <span>10</span>
                                <span>30</span>
                            </div>
                        </div>

                        <div className="space-y-4 text-left">
                            <label className={`text-[10px] font-black uppercase tracking-widest flex justify-between ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                Short Answer <span>{shortCount}</span>
                            </label>
                            <input
                                type="range" min="5" max="15" step="1"
                                value={shortCount}
                                onChange={(e) => setShortCount(parseInt(e.target.value))}
                                className={`w-full accent-purple-500 rounded-lg appearance-none cursor-pointer h-1.5 ${isDark ? 'bg-foreground/10' : 'bg-slate-200'}`}
                            />
                            <div className={`flex justify-between text-[10px] font-bold ${isDark ? 'text-foreground/30' : 'text-slate-400'}`}>
                                <span>5</span>
                                <span>15</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={fetchExercises}
                        className={`group relative px-12 py-5 font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden ${isDark ? 'bg-indigo-500 text-white shadow-[0_20px_50px_rgba(99,102,241,0.2)]' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'}`}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Initialize Matrix Sync
                            <ChevronDown size={14} className="-rotate-90" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mt-20 p-24 rounded-[4rem] bg-indigo-500/[0.02] border border-indigo-500/10 flex flex-col items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-shimmer" />
                <div className="relative">
                    <Loader2 size={48} className="text-indigo-500 animate-spin" />
                    <div className="absolute inset-0 blur-2xl bg-indigo-500/20 pulse-slow" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-indigo-400 animate-pulse">Forging High-Fidelity Matrix</p>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Synthesizing {mcqCount} conceptual nodes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-20 space-y-16 animate-fade-in pb-20">
            <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-foreground/10" />
                <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-foreground/80 flex items-center gap-4">
                    <Target className="text-indigo-500" size={24} />
                    Crucible
                </h3>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-foreground/10" />
            </div>

            {/* PART I: MCQ SECTION */}
            {exercises?.mcq?.length > 0 && (
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <span className="text-xs font-black">01</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Conceptual Selection</h4>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Matrix Scan Accuracy: 98.4%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {exercises.mcq.map((q, idx) => (
                            <div key={idx} className="p-10 rounded-[2.5rem] glass-morphism border-indigo-500/5 transition-all hover:bg-white/[0.04] shadow-sm">
                                <div className="flex gap-6 mb-10">
                                    <span className="text-xs font-black text-indigo-500/40 mt-1">{String(idx + 1).padStart(2, '0')}</span>
                                    <p className="text-xl font-bold text-foreground leading-snug">{q.q}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q?.options?.map((opt, oIdx) => {
                                        const letter = opt[0];
                                        const isSelected = answers[`mcq_${idx}`] === letter;
                                        const isCorrect = q.answer === letter;
                                        const isChecked = checked[`mcq_${idx}`];

                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => !isChecked && setAnswers({ ...answers, [`mcq_${idx}`]: letter })}
                                                className={`flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-300 ${isChecked
                                                    ? isCorrect
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                                        : isSelected ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-foreground/[0.01] border-foreground/5 opacity-30 shadow-none'
                                                    : isSelected
                                                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20'
                                                        : 'bg-foreground/[0.02] border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.04]'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${isSelected ? 'bg-indigo-500 text-white shadow-lg' : 'bg-foreground/5 text-foreground/40'}`}>
                                                    {letter}
                                                </div>
                                                <span className="font-semibold text-[15px]">{opt.substring(3)}</span>
                                                {isChecked && isCorrect && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
                                                {isChecked && isSelected && !isCorrect && <XCircle size={18} className="ml-auto text-rose-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setChecked({ ...checked, [`mcq_${idx}`]: true })}
                                    disabled={!answers[`mcq_${idx}`] || checked[`mcq_${idx}`]}
                                    className={`mt-10 px-8 py-3 bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 ${checked[`mcq_${idx}`] ? 'opacity-0 scale-95 pointer-events-none' : ''} disabled:opacity-20`}
                                >
                                    Verify Logic Gate
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PART II: SHORT ANSWER SECTION */}
            {exercises?.short_answer?.length > 0 && (
                <div className="pt-16 space-y-10 border-t border-indigo-500/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <span className="text-xs font-black">02</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Deep Conceptual Articulation</h4>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Linguistic Precision Required</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {exercises.short_answer.map((q, idx) => (
                            <div key={idx} className="group">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500/50 block mb-2">Question {idx + 1}</span>
                                    <p className="text-xl font-bold text-foreground/90">{q.q}</p>
                                </div>

                                <div className="relative">
                                    <textarea
                                        rows="3"
                                        placeholder="Articulate your technical response..."
                                        className="w-full bg-foreground/[0.01] border glass-border rounded-3xl p-8 text-foreground focus:border-purple-500/30 focus:bg-foreground/[0.03] transition-all outline-none resize-none placeholder:text-foreground/20 font-serif text-lg italic shadow-inner"
                                        value={answers[`short_${idx}`] || ''}
                                        onChange={(e) => setAnswers({ ...answers, [`short_${idx}`]: e.target.value })}
                                        disabled={checked[`short_${idx}`]}
                                    />
                                    <button
                                        onClick={() => setChecked({ ...checked, [`short_${idx}`]: true })}
                                        disabled={!answers[`short_${idx}`] || checked[`short_${idx}`]}
                                        className="absolute bottom-4 right-4 p-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-purple-400 hover:bg-foreground/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                    >
                                        <ChevronDown className="-rotate-90" size={18} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {checked[`short_${idx}`] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="mt-6 overflow-hidden"
                                        >
                                            <div className="p-8 rounded-3xl bg-purple-500/5 border border-purple-500/10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Info size={14} className="text-purple-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Master Protocol Answer</span>
                                                </div>
                                                <p className="text-foreground/70 font-medium leading-relaxed mb-6">{q.model_answer}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-foreground/5 text-[10px] text-foreground/50 italic px-4 font-serif">
                                                        Hint: {q.hint}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PART III: CASE STUDY SECTION */}
            {exercises?.challenge && (
                <div className="pt-24 border-t border-indigo-500/10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <span className="text-xs font-black">03</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Elite Systems Case Study</h4>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Full Production Simulation</p>
                        </div>
                    </div>

                    <div className="p-16 rounded-[4rem] bg-gradient-to-br from-indigo-500/15 via-emerald-500/5 to-transparent border border-foreground/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-60 bg-indigo-500/20 blur-[140px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-1000" />
                        <div className="relative z-10">
                            <h5 className="text-4xl font-black text-foreground mb-10 tracking-tight leading-tight max-w-2xl">{exercises.challenge.title}</h5>

                            <div className="space-y-12 mb-16">
                                <section>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 block mb-4">Deployment Scenario</span>
                                    <p className="text-xl font-serif italic text-foreground/80 leading-relaxed indent-8">
                                        {exercises.challenge.scenario}
                                    </p>
                                </section>

                                <section className="p-10 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/10 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 block mb-6">Critical Deliverables</span>
                                    <div className="text-2xl font-black leading-tight text-foreground/90">
                                        {exercises.challenge.task}
                                    </div>
                                </section>
                            </div>

                            <button
                                onClick={() => setChecked({ ...checked, challenge: true })}
                                className="group flex items-center gap-4 px-12 py-5 bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-all shadow-xl active:scale-95"
                            >
                                <Terminal size={18} />
                                Access Architect Console
                                <ChevronDown className="-rotate-90 group-hover:translate-x-1 transition-transform" size={14} />
                            </button>

                            <AnimatePresence>
                                {checked.challenge && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-16 p-12 rounded-[3.5rem] bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-3xl"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-8 h-px bg-emerald-500/50" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-400">Architectural Rubric</span>
                                        </div>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-lg font-medium text-emerald-900/80 dark:text-emerald-50/80 leading-relaxed whitespace-pre-line">
                                                {exercises.challenge.solution_guide}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TopicContent = ({ topic, mode = 'easy' }) => {
    if (!topic) return null;

    // Determine which content to show based on mode
    const hasEasy = !!topic.content_easy_markdown;
    const hasDeep = !!topic.content_deep_markdown;

    const activeContent = mode === 'deep'
        ? (topic.content_deep_markdown || topic.content_markdown)
        : (topic.content_easy_markdown || topic.content_markdown);

    const isShowingFallback = (mode === 'deep' && !hasDeep) || (mode === 'easy' && !hasEasy);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [topic.id, mode]);

    // ── CASE 1: High-fidelity Markdown content ───────────────────────────
    if (activeContent) {
        return (
            <div className="text-foreground max-w-5xl mx-auto">
                {/* 1. LECTURE HERO */}
                <section className="py-20 animate-article-scroll relative">
                    <div className="absolute top-0 -left-20 w-px h-full bg-gradient-to-b from-indigo-500/50 via-indigo-500/5 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)] hidden lg:block" />

                    <div className="flex items-center gap-4 mb-20">
                        <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                            <BookOpen size={28} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-foreground/80">The Protocol</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    {mode === 'deep' ? 'Deep Engineering Insight' : 'Conceptual Foundation'}
                                </span>
                                {isShowingFallback && (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                        Legacy Content - Sync Required
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {mode === 'deep' && (
                        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {topic.first_principles && (
                                <CollapsibleSection title="First Principles" defaultOpen={true}>
                                    <div className="font-serif italic text-foreground/80 leading-relaxed">
                                        {topic.first_principles}
                                    </div>
                                </CollapsibleSection>
                            )}
                            {topic.structural_breakdown && (
                                <CollapsibleSection title="Structural Architecture" defaultOpen={true}>
                                    <div className="font-mono text-xs text-foreground/70 leading-relaxed whitespace-pre-line">
                                        {topic.structural_breakdown}
                                    </div>
                                </CollapsibleSection>
                            )}
                            {topic.failure_analysis && (
                                <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-rose-500/[0.03] border border-rose-500/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <XCircle className="text-rose-500" size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Critical Failure Modes</span>
                                    </div>
                                    <p className="text-foreground/70 font-medium leading-relaxed">{topic.failure_analysis}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                        <div className="markdown-lesson relative">
                            <Markdown options={{
                                overrides: {
                                    h1: { props: { className: "text-5xl font-black mb-16 tracking-tight text-foreground leading-tight" } },
                                    h2: { props: { className: "text-3xl font-black mt-24 mb-10 text-foreground flex items-center gap-4 border-l-4 border-indigo-500 pl-8" } },
                                    h3: { props: { className: "text-xl font-bold mt-16 mb-6 text-foreground/90 uppercase tracking-widest" } },
                                    p: { props: { className: "text-lg lg:text-xl font-medium mb-10 leading-[1.8] text-foreground/70 font-serif" } },
                                    ul: { props: { className: "space-y-6 mb-12 ml-6 list-none" } },
                                    li: {
                                        component: ({ children }) => (
                                            <li className="flex gap-6 text-lg lg:text-xl font-medium text-foreground/70 group">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                <span className="leading-relaxed">{children}</span>
                                            </li>
                                        )
                                    },
                                    table: {
                                        component: ({ children }) => (
                                            <div className="my-16 overflow-x-auto rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl shadow-2xl">
                                                <table className="w-full border-collapse">
                                                    {children}
                                                </table>
                                            </div>
                                        )
                                    },
                                    th: { props: { className: "bg-white/5 p-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 border-b border-white/5" } },
                                    td: { props: { className: "p-6 border-b border-white/5 text-foreground/70 text-sm font-medium leading-relaxed" } },
                                    hr: { component: () => <hr className="my-24 border-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.05)]" /> },
                                    blockquote: {
                                        component: ({ children }) => (
                                            <div className="my-16 p-10 rounded-[2.5rem] bg-indigo-500/[0.03] border-l-4 border-indigo-500/40 relative overflow-hidden group">
                                                <div className="absolute top-4 left-4 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <Zap size={12} />
                                                </div>
                                                <div className="pl-6 italic text-xl lg:text-2xl font-serif text-foreground/80 leading-relaxed">
                                                    {children}
                                                </div>
                                            </div>
                                        )
                                    },
                                    strong: { props: { className: "font-black text-foreground shadow-[inset_0_-1px_0_0_rgba(99,102,241,0.3)]" } },
                                    Math: { component: MathComponent }
                                }
                            }}>
                                {(() => {
                                    // Pre-process for KaTeX: replace $$...$$ with <Math block math="..." /> and $...$ with <Math math="..." />
                                    let processed = activeContent;
                                    processed = processed.replace(/\$\$(.*?)\$\$/gs, (match, p1) => `<Math block math="${p1.replace(/"/g, '&quot;')}" />`);
                                    processed = processed.replace(/\$(.*?)\$/g, (match, p1) => `<Math math="${p1.replace(/"/g, '&quot;')}" />`);
                                    return processed;
                                })()}
                            </Markdown>
                        </div>

                        {topic.staff_engineer_note && (
                            <StaffNote>{topic.staff_engineer_note}</StaffNote>
                        )}
                    </div>
                </section>

                {/* 2. EXERCISES SECTION */}
                <div id="crucible">
                    <TopicExercises topicId={topic.id} topicTitle={topic.title} />
                </div>

                <div className="h-40" />
            </div>
        );
    }

    // ── CASE 2: LOADING / PENDING ────────────────────────────────────────────
    return (
        <div id="crucible" className="text-foreground max-w-4xl mx-auto py-20">
            <div className="relative p-16 rounded-[4rem] bg-indigo-500/[0.02] border border-indigo-500/10 overflow-hidden text-center backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-shimmer" />
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-10 text-indigo-500 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                    <Loader2 size={32} className="animate-spin" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white mb-6">Neural Link Synchronizing</h3>
                <p className="text-foreground/50 text-lg lg:text-xl font-serif italic max-w-md mx-auto leading-relaxed mb-12">
                    The High-Fidelity Intelligence Protocol is currently mapping this synaptic node. Please maintain connection.
                </p>
                <div className="flex justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-75" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" />
                </div>
            </div>
        </div>
    );
};

export default TopicContent;
