import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../auth/ThemeContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import TopicContent from "../components/TopicContent";
import TopicPodcastPlayer from "../components/TopicPodcastPlayer";
import TopicSongPlayer from "../components/TopicSongPlayer";

import QuizModal from "../components/QuizModal";
import SortingVisualizer from '../components/SortingVisualizer';
import GraphVisualizer from "../components/GraphVisualizer";
import KnapsackVisualizer from "../components/KnapsackVisualizer";
import RecurrenceVisualizer from "../components/RecurrenceVisualizer";
import ComplexityVisualizer from "../components/ComplexityVisualizer";
import MethodologyVisualizer from "../components/MethodologyVisualizer";
import UMLDiagramVisualizer from "../components/UMLDiagramVisualizer";
import UMLDiagramChallenge from "../components/UMLDiagramChallenge";
import DataWarehouseVisualizer from "../components/DataWarehouseVisualizer";
import { ChevronRight, Zap, Brain, SendHorizontal, Sparkles, ShieldCheck, AlertTriangle, Play, CheckCircle, Music } from "lucide-react";
import api from "../api/axios";


const TopicDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [topic, setTopic] = useState(null);
    const [access, setAccess] = useState(null); // { locked: boolean, message: string, reqScore: number, yourPrevScore: number }
    const [loading, setLoading] = useState(true);

    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [viewMode, setViewMode] = useState('easy'); // 'easy' or 'deep'
    const [customInstruction, setCustomInstruction] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Exam Mode States
    const [readinessVerdict, setReadinessVerdict] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [topicRes, accessRes] = await Promise.all([
                api.get(`/courses/topics/${id}`),
                api.get(`/progress/access/${id}`)
            ]);
            setTopic(topicRes.data);
            setAccess(accessRes.data);
            return topicRes.data; // Return for auto-synthesis check
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== "undefined") {
            const init = async () => {
                const data = await loadData();
                if (data) {
                    // AUTO-SYNTHESIS LOGIC: Strictly for newly seeded topics without content
                    const isEmpty = !data.content_markdown && !data.content_easy_markdown;
                    if (isEmpty && !isSynthesizing) {
                        handleSynthesize();
                    }
                }
            };
            init();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        try {
            await api.post("/ai/topics/synthesize", {
                topicId: id,
                customInstruction: customInstruction
            });
            setIsCustomizing(false);
            setCustomInstruction("");
            await loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleToggle = async () => {
        try {
            await api.post("/courses/topics/toggle", { topicId: id });
            await loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTakeExam = () => {
        setIsQuizOpen(true);
    };

    const runReadinessAudit = async () => {
        if (!topic?.course_id) return;
        setIsAuditing(true);
        try {
            const res = await api.get(`/exams/readiness/${topic.course_id}`);
            setReadinessVerdict(res.data);
        } catch (err) {
            console.error("Audit failed", err);
        } finally {
            setIsAuditing(false);
        }
    };

    const startExam = () => {
        navigate("/exams/session", {
            state: {
                courseId: topic.course_id,
                courseName: topic.breadcrumb_path?.split(' > ')[0] || "Course",
                mode: isFinal ? "Final" : "Midterm",
                topics: [topic.title] // Or fetch course topics
            }
        });
    };

    const isMidterm = topic?.title?.toLowerCase().includes("midterm");
    const isFinal = topic?.title?.toLowerCase().includes("final");
    const isExamTopic = isMidterm || isFinal;


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="relative flex flex-col items-center gap-12">
                    <div className="relative w-32 h-32">
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 border-t-2 border-indigo-500/40 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-4 border-r-2 border-purple-500/30 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="text-indigo-500 animate-pulse" size={32} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse">Running Security Clearance</p>
                        <div className="flex gap-2 justify-center mt-4">
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className={`w-1 h-1 rounded-full ${isDark ? 'bg-indigo-500' : 'bg-red-500'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!id || id === "undefined" || !topic) return <div className="text-center p-20 text-red-400 font-black uppercase tracking-widest">Topic Not Found or Invalid Link</div>;

    // LOCKED STATE
    if (access?.locked) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6">
                <button
                    onClick={() => navigate(-1)}
                    className={`mb-12 text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] transition-colors flex items-center gap-3 group ${isDark ? 'hover:text-indigo-400' : 'hover:text-red-500'}`}
                >
                    <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Abort Mission / Return to Roadmap
                </button>

                <div className="glass-morphism rounded-[3rem] p-16 text-center relative overflow-hidden border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 p-40 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-red-500/20 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                        <AlertTriangle size={40} className="animate-pulse" />
                    </div>

                    <h1 className="text-5xl font-black text-foreground mb-6 tracking-tightest uppercase italic">Restricted Access</h1>
                    <p className="text-foreground/50 text-lg mb-12 max-w-xl mx-auto leading-relaxed uppercase tracking-wider font-semibold">
                        This module requires a deeper understanding of previous synaptic nodes.
                        Your biometric signature is <span className="text-red-500">unauthorized</span>.
                    </p>

                    <div className="flex justify-center gap-12 mb-16">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-3 italic">Required Proficiency</p>
                            <p className="text-5xl font-black text-red-500">{access.reqScore}%</p>
                        </div>
                        <div className="w-px bg-white/5" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-3 italic">Your Metrics</p>
                            <p className="text-5xl font-black text-foreground/60">{access.yourPrevScore}%</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/topics/${access.prevTopicId}`)}
                        className="px-16 py-6 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 uppercase tracking-[0.4em] text-[11px]"
                    >
                        Retreat to Previous Module
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mesh-bg relative">
            {/* AMBIENT BACKGROUND ELEMENTS */}
            <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'} blur-[120px] rounded-full animate-nebula-float pointer-events-none`} />
            <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'} blur-[120px] rounded-full animate-nebula-float pointer-events-none`} style={{ animationDelay: '-5s' }} />

            {/* ACADEMIC PROGRESS BAR (SUBTLE) */}
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: topic.completed ? "100%" : "0%" }}
                className={`fixed top-0 left-0 h-1 z-50 transition-all duration-1000 ${isDark ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-red-600 shadow-[0_0_15px_rgba(192,22,54,0.5)]'}`}
            />


            <div className="relative z-10 w-full mx-auto px-8 lg:px-16 xl:px-24 py-12 lg:py-20 animate-fade-in">

                {/* AI GENERATION OVERLAY */}
                <AnimatePresence>
                    {isSynthesizing && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            transition={{ duration: 0.4 }}
                            className="fixed inset-0 z-[100] bg-black/60 flex flex-col items-center justify-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="max-w-md w-full glass-morphism border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                            >
                                <div className="absolute inset-0 bg-indigo-500/5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                                <div className="relative mb-12 mt-4 scale-125">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-[-20px] border border-dashed border-indigo-500/40 rounded-full"
                                    />
                                    <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                        <Sparkles className="text-indigo-400" size={40} />
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl -z-10"
                                    />
                                </div>

                                <div className="text-center space-y-6 z-10 w-full">
                                    <h2 className="text-4xl font-black text-white tracking-tightest uppercase italic">Synthesizing</h2>
                                    <p className="text-[11px] font-black text-indigo-200/40 leading-relaxed uppercase tracking-[0.3em]">
                                        Deploying high-fidelity <br /> academic architecture
                                    </p>

                                    <div className="w-full bg-white/5 h-1 rounded-full mt-12 overflow-hidden relative">
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-[10px] font-black uppercase text-indigo-400/60 tracking-widest flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                                            Active Matrix Sync
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-indigo-400/30 tracking-widest">Protocol 11.4β</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 1. ACADEMIC HEADER - EXPANDED */}
                <header className="mb-16 py-12 lg:py-16 border-b border-[var(--academic-border)] relative z-20">


                    {/* BREADCRUMBS */}
                    <nav className="flex flex-wrap items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        {[
                            { label: "Home", onClick: () => navigate('/dashboard') },
                            { label: "Courses", onClick: () => navigate('/courses') },
                            ...(topic?.course_id ? [{
                                label: topic?.breadcrumb_path ? topic.breadcrumb_path.split(' > ')[0] : "Roadmap",
                                onClick: () => navigate(`/courses/${topic.course_id}/roadmap`)
                            }] : []),
                            { label: topic?.title || "Topic details", onClick: null }
                        ].map((segment, index, arr) => {
                            const isLast = index === arr.length - 1;
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    {index > 0 && <ChevronRight size={10} className="opacity-30" />}
                                    {segment.onClick && !isLast ? (
                                        <button
                                            onClick={segment.onClick}
                                            className="hover:text-foreground/80 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            {segment.label}
                                        </button>
                                    ) : (
                                        <span className={isLast ? "opacity-60 text-foreground/80 dark:text-indigo-400" : ""}>
                                            {segment.label}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </nav>


                    <div className="space-y-6">
                        <h1 className="academic-title leading-[1.1] shadow-sm">
                            {topic.title}
                        </h1>


                        <div className="flex flex-wrap items-center gap-8 pt-6">
                            {/* METADATA BADGES */}
                            <div className="flex flex-col gap-2">
                                <span className="academic-label">Protocol Level</span>
                                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' : 'border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm'}`}>
                                    {topic.difficulty || 'Intermediate'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="academic-label">Cognitive Effort</span>
                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                    {topic.estimated_time || '2h 15m'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="academic-label">Synaptic Sync</span>
                                <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                                    {topic.updated_at ? new Date(topic.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Feb 2026'}
                                </span>
                            </div>
                        </div>


                        {/* PREREQUISITES */}
                        {topic.prerequisites && (
                            <div className="pt-8 border-t border-[var(--academic-border)] flex items-start gap-4">
                                <span className="academic-label mt-1">Prerequisites :</span>
                                <div className="flex flex-wrap gap-3">
                                    {Array.isArray(topic.prerequisites) ? topic.prerequisites.map((pre, idx) => (
                                        <button key={idx} className="text-[10px] font-black text-indigo-500 hover:text-foreground uppercase tracking-widest transition-colors" onClick={() => {
                                            const el = document.getElementById('mastery-anthem');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}>
                                            {pre}
                                        </button>
                                    )) : <span className="text-[11px] text-foreground/30 italic uppercase">None specified</span>}
                                </div>
                            </div>
                        )}

                        {/* QUICK ANTHEM LINK */}
                        {topic.song_url && (
                            <div className="pt-8 w-fit flex items-center gap-3">
                                <button
                                    onClick={() => document.getElementById('mastery-anthem')?.scrollIntoView({ behavior: 'smooth' })}
                                    className={`px-4 py-2 border rounded-xl flex items-center gap-2 group transition-all active:scale-95 ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400' : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10 text-red-600'}`}
                                >
                                    <Music size={14} className={`${isDark ? 'text-indigo-400' : 'text-red-600'} group-hover:animate-bounce`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Jump to Anthem</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className={`flex items-center ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-white border-indigo-100 shadow-sm'} p-1 rounded-xl border`}>
                                <button
                                    onClick={() => setViewMode('easy')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'easy' ? (isDark ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-900 text-slate-50 shadow-md') : 'text-foreground/40 hover:text-foreground/60'}`}
                                >
                                    Normal
                                </button>
                                <button
                                    onClick={() => setViewMode('deep')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'deep' ? (isDark ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-900 text-slate-50 shadow-md') : 'text-foreground/40 hover:text-foreground/60'}`}
                                >
                                    Deep Dive
                                </button>
                            </div>



                            <button
                                onClick={handleTakeExam}
                                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all font-sans ${isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/10 text-indigo-400' : 'bg-red-500/5 hover:bg-red-500/10 border-red-500/10 text-red-600'}`}
                            >
                                <Brain size={16} />
                                Knowledge Check
                            </button>

                            <div className="relative flex flex-col items-end gap-3">
                                <AnimatePresence>
                                    {isCustomizing && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, scale: 0.95 }}
                                            animate={{ height: 'auto', opacity: 1, scale: 1 }}
                                            exit={{ height: 0, opacity: 0, scale: 0.95 }}
                                            className="overflow-hidden w-[400px] bg-[#0A0F1A]/90 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 mb-4 ring-1 ring-white/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={14} className="text-emerald-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Forge Chamber</span>
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>

                                            <textarea
                                                rows={3}
                                                placeholder="What should I refine? (e.g. 'Use hardware examples', 'More code', 'Simpler analogies')"
                                                className="w-full bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-4 text-[11px] text-foreground placeholder:text-foreground/30 outline-none focus:border-emerald-500/40 transition-all resize-none font-sans leading-relaxed"
                                                value={customInstruction}
                                                onChange={(e) => setCustomInstruction(e.target.value)}
                                                autoFocus
                                            />

                                            <div className="flex items-center justify-between pt-2">
                                                <button
                                                    onClick={() => setIsCustomizing(false)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-foreground/60 px-2 transition-all"
                                                >
                                                    Deactivate
                                                </button>

                                                <button
                                                    onClick={handleSynthesize}
                                                    disabled={isSynthesizing || !customInstruction.trim()}
                                                    className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-emerald-500/20 active:scale-95"
                                                >
                                                    {isSynthesizing ? "Forging..." : "Execute Proto"}
                                                    <SendHorizontal size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!isCustomizing && (
                                    <button
                                        onClick={() => setIsCustomizing(true)}
                                        disabled={isSynthesizing}
                                        className="group flex items-center gap-3 bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-3 rounded-2xl border border-emerald-500/10 text-[10px] font-black uppercase tracking-widest text-emerald-500 transition-all font-sans disabled:opacity-50"
                                    >
                                        <Zap size={16} className={isSynthesizing ? "animate-pulse" : ""} />
                                        {isSynthesizing ? "Neural Sync..." : "Adaptive Intelligence"}
                                    </button>
                                )}
                            </div>
                        </div>


                        <button
                            onClick={handleToggle}
                            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${topic.completed
                                ? (isDark ? 'bg-gradient-gold text-white shadow-gold pulse-ring' : 'bg-slate-900 text-slate-50 shadow-[0_10px_25px_rgba(15,23,42,0.3)] border border-slate-800')
                                : (isDark ? 'bg-indigo-500/5 text-foreground/40 border border-indigo-500/10 hover:bg-indigo-500/10' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm')
                                }`}
                        >
                            <CheckCircle size={14} className={topic.completed ? (isDark ? 'text-white' : 'text-red-500') : 'text-slate-300'} />
                            {topic.completed ? 'Mastery Verified' : 'Mark as Mastered'}
                        </button>
                    </div>

                </header>

                {/* 2. STRUCTURED ACADEMIC BODY - IMMERSIVE */}
                <main className="animate-fade-in w-full relative z-10" style={{ animationDelay: '0.2s' }}>
                    {isExamTopic ? (
                        <div className="max-w-4xl mx-auto py-12">
                            <div className={`p-10 rounded-[3rem] border bg-indigo-500/5 backdrop-blur-xl border-indigo-500/20 relative overflow-hidden transition-all duration-500`}>
                                {/* Ambient Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] block mb-1">Academic Enforcement</span>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic">{isFinal ? "Final Examination Protocol" : "Midterm Proficiency Audit"}</h2>
                                        </div>
                                    </div>

                                    {!readinessVerdict ? (
                                        <div className="text-center py-12 px-6 border-2 border-dashed border-foreground/10 rounded-[2rem] bg-foreground/[0.02]">
                                            <ShieldCheck size={64} className="text-foreground/10 mx-auto mb-6" />
                                            <h3 className="text-xl font-bold text-foreground mb-4">Uplink Interrupted: Readiness Audit Required</h3>
                                            <p className="text-foreground/40 text-sm max-w-md mx-auto mb-10 leading-relaxed font-medium">
                                                The Faculty Assistant must verify your intellectual synchronization before granting exam clearance.
                                                Proceed only when cognitive load is nominal.
                                            </p>
                                            <button
                                                onClick={runReadinessAudit}
                                                disabled={isAuditing}
                                                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 mx-auto active:scale-95"
                                            >
                                                {isAuditing ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Executing Internal Audit...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SendHorizontal size={18} />
                                                        Initiate Readiness Audit
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in zoom-in-95 duration-500">
                                            <div className={`p-6 rounded-2xl mb-8 border-l-4 ${readinessVerdict.verdict === 'READY' ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`text-xs font-black uppercase tracking-widest ${readinessVerdict.verdict === 'READY' ? 'text-green-500' : 'text-red-500'}`}>
                                                        Faculty Verdict: {readinessVerdict.verdict}
                                                    </span>
                                                    {readinessVerdict.verdict === 'READY' ? <CheckCircle className="text-green-400" size={18} /> : <AlertTriangle className="text-red-400" size={18} />}
                                                </div>
                                                <p className="text-base italic leading-relaxed text-foreground/80 font-medium">"{readinessVerdict.professor_quote}"</p>
                                            </div>

                                            <div className="space-y-6 mb-12 bg-foreground/5 p-8 rounded-3xl border border-foreground/5">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mb-4">Reasoning Matrix</h4>
                                                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">{readinessVerdict.reasoning}</p>
                                                </div>

                                                {readinessVerdict.gaps?.length > 0 && (
                                                    <div className="pt-6 border-t border-foreground/10">
                                                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-4">Intellectual Gaps Detected</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {readinessVerdict.gaps.map(gap => (
                                                                <span key={gap} className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] rounded-lg font-black uppercase border border-rose-500/20">{gap}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {readinessVerdict.verdict === 'READY' ? (
                                                <button
                                                    onClick={startExam}
                                                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl font-black text-white text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 italic"
                                                >
                                                    <Play size={20} fill="white" />
                                                    Initialize Simulation Protocol
                                                </button>
                                            ) : (
                                                <div className="text-center p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
                                                    <p className="text-xs text-red-400 font-black uppercase tracking-widest">Clearance Denied. Master prerequisites to unlock protocol.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-20">
                            {/* 0. SEARCH & SORT VISUALIZERS (Array Context) */}
                            {(topic?.title?.toLowerCase().includes("sorting") ||
                                topic?.title?.toLowerCase().includes("linear search") ||
                                topic?.title?.toLowerCase().includes("binary search") ||
                                topic?.title?.toLowerCase().includes("algorithmic domains")) && !topic?.title?.toLowerCase().includes("bfs") && !topic?.title?.toLowerCase().includes("dfs") && (
                                    <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-1.5 h-10 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Foundational Lab</h3>
                                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Search & Sort Protocol</h2>
                                            </div>
                                        </div>
                                        <SortingVisualizer />
                                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                            Data Reordering and Binary Reduction Engine
                                        </p>
                                    </section>
                                )}
                            {(topic?.title?.toLowerCase().includes("graph") ||
                                topic?.title?.toLowerCase().includes("shortest path") ||
                                topic?.title?.toLowerCase().includes("mst") ||
                                topic?.title?.toLowerCase().includes("greedy") ||
                                topic?.title?.toLowerCase().includes("prim") ||
                                topic?.title?.toLowerCase().includes("kruskal") ||
                                topic?.title?.toLowerCase().includes("bfs") ||
                                topic?.title?.toLowerCase().includes("dfs")) && (
                                    <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Knowledge Lab</h3>
                                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Neural Visualization Protocol</h2>
                                            </div>
                                        </div>
                                        <GraphVisualizer
                                            algorithm={
                                                topic.title.toLowerCase().includes("dfs") ? "DFS" :
                                                    topic.title.toLowerCase().includes("dijkstra") ? "Dijkstra" :
                                                        (topic.title.toLowerCase().includes("mst") || topic.title.toLowerCase().includes("greedy") || (topic.title.toLowerCase().includes("prim") && topic.title.toLowerCase().includes("kruskal"))) ? "MST" :
                                                            topic.title.toLowerCase().includes("prim") ? "Prim" :
                                                                topic.title.toLowerCase().includes("kruskal") ? "Kruskal" : "BFS"
                                            }
                                        />
                                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                            Interactive Synaptic Map inspired by OpenDSA pedagogical standards
                                        </p>
                                    </section>
                                )}

                            {/* 2. DYNAMIC PROGRAMMING VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("dynamic programming") || topic?.title?.toLowerCase().includes("knapsack")) && (
                                <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Optimization Lab</h3>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Recursive-to-Matrix Protocol</h2>
                                        </div>
                                    </div>
                                    <KnapsackVisualizer />
                                    <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                        DP Table Synthesis Engine - Visualizing Overlapping Subproblems
                                    </p>
                                </section>
                            )}

                            {/* 4. DATA WAREHOUSE VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("etl") ||
                                topic?.title?.toLowerCase().includes("data mart") ||
                                topic?.title?.toLowerCase().includes("model") ||
                                topic?.title?.toLowerCase().includes("schema") ||
                                topic?.title?.toLowerCase().includes("olap") ||
                                topic?.title?.toLowerCase().includes("oltp")) && (
                                    <section className="max-w-6xl mx-auto px-6 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Architectural Lab</h3>
                                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Decision Support Protocol</h2>
                                            </div>
                                        </div>
                                        <DataWarehouseVisualizer
                                            type={
                                                topic.title.toLowerCase().includes("architecture") ? "architecture" :
                                                    (topic.title.toLowerCase().includes("oltp") || topic.title.toLowerCase().includes("olap")) ? "comparison" :
                                                        topic.title.toLowerCase().includes("mart") ? "mart" :
                                                            (topic.title.toLowerCase().includes("model") || topic.title.toLowerCase().includes("schema")) ? "modeling" : "etl"
                                            }
                                        />
                                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                            Analytical Processing & Data Flow Orchestration Engine
                                        </p>
                                    </section>
                                )}

                            {/* 5. RECURRENCE & ANALYSIS VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("recurrence") || topic?.title?.toLowerCase().includes("substitution")) && (
                                <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-1.5 h-10 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Mathematical Lab</h3>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Neural Substitution Protocol</h2>
                                        </div>
                                    </div>
                                    <RecurrenceVisualizer />
                                    <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                        Substitution Method & Recursion Tree Synthesis
                                    </p>
                                </section>
                            )}

                            {/* 4. ASYMPTOTIC & COMPLEXITY VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("asymptotic") || topic?.title?.toLowerCase().includes("complexity") || topic?.title?.toLowerCase().includes("growth") || topic?.title?.toLowerCase().includes("limit")) && (
                                <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-1.5 h-10 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Asymptotic Lab</h3>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Growth Synthesis Protocol</h2>
                                        </div>
                                    </div>
                                    <ComplexityVisualizer />
                                    <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                        Limit Analysis & Big-O Comparison Engine
                                    </p>
                                </section>
                            )}

                            {/* 5. METHODOLOGY VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("waterfall") ||
                                topic?.title?.toLowerCase().includes("spiral") ||
                                topic?.title?.toLowerCase().includes("scrum") ||
                                topic?.title?.toLowerCase().includes("kanban") ||
                                topic?.title?.toLowerCase().includes("extreme programming") ||
                                topic?.title?.toLowerCase().includes("xp") ||
                                topic?.title?.toLowerCase().includes("methodolog") ||
                                topic?.title?.toLowerCase().includes("sdlc")) && (
                                    <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-1.5 h-10 bg-rose-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">Process Lab</h3>
                                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">SDLC Simulation Protocol</h2>
                                            </div>
                                        </div>
                                        <MethodologyVisualizer type={topic.title.toLowerCase()} />
                                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                            Interactive SDLC Framework Visualization
                                        </p>
                                    </section>
                                )}

                            {/* 6. UML DIAGRAM VISUALIZERS */}
                            {(topic?.title?.toLowerCase().includes("use case") ||
                                topic?.title?.toLowerCase().includes("sequence") ||
                                topic?.title?.toLowerCase().includes("activity") ||
                                topic?.title?.toLowerCase().includes("class diagram") ||
                                topic?.title?.toLowerCase().includes("package diagram") ||
                                topic?.title?.toLowerCase().includes("uml")) && (
                                    <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                        <div className="flex items-center gap-4 mb-10">
                                            <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Blueprint Lab</h3>
                                                <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">UML Construction Protocol</h2>
                                            </div>
                                        </div>
                                        <UMLDiagramVisualizer type={topic.title.toLowerCase()} />
                                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">
                                            Step-by-Step UML Diagram Synthesis Engine
                                        </p>
                                    </section>
                                )}

                            <TopicPodcastPlayer topic={topic} />
                            <TopicContent topic={topic} mode={viewMode} />

                            {/* RECAP ANTHEM - End of learning experience */}
                            {topic.song_url && (
                                <section id="mastery-anthem" className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-10 duration-1000 scroll-mt-24">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Synaptic Summary</h3>
                                            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">Mastery Anthem</h2>
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-1/2">
                                        <TopicSongPlayer
                                            songUrl={topic.song_url}
                                            songLyrics={topic.song_lyrics}
                                            topicTitle={topic.title}
                                        />
                                    </div>
                                    <p className="mt-6 text-[11px] font-medium text-foreground/40 italic uppercase tracking-widest leading-loose">
                                        Lock-in the knowledge through melodic reinforcement before beginning practical evaluation.
                                    </p>
                                </section>
                            )}

                            {/* 7. DIAGRAM DRAWING CHALLENGE */}
                            {(topic?.title?.toLowerCase().includes("use case") ||
                                topic?.title?.toLowerCase().includes("sequence") ||
                                topic?.title?.toLowerCase().includes("activity") ||
                                topic?.title?.toLowerCase().includes("class diagram") ||
                                topic?.title?.toLowerCase().includes("package diagram") ||
                                topic?.title?.toLowerCase().includes("uml")) && (
                                    <section className="max-w-6xl mx-auto px-6 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 mt-12">
                                        <UMLDiagramChallenge type={topic.title.toLowerCase()} />
                                    </section>
                                )}
                        </div>
                    )}
                </main>





                {/* MODALS */}


                {isQuizOpen && (
                    <QuizModal
                        isOpen={isQuizOpen}
                        onClose={() => {
                            setIsQuizOpen(false);
                            loadData();
                        }}
                        topic={topic.title}
                        topicId={id}
                    />
                )}

            </div>
        </div>
    );
};

export default TopicDetails;
