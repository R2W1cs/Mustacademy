import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../auth/ThemeContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    ChevronRight, Zap, Brain, Sparkles, ShieldCheck, CheckCircle,
    Layers, Clock, Lock, Headphones
} from "lucide-react";

import TopicContent from "../components/TopicContent";
import TopicPodcastPlayer from "../components/TopicPodcastPlayer";
import TopicSongPlayer from "../components/TopicSongPlayer";
import TopicNotebook from "../components/TopicNotebook";
import QuizModal from "../components/QuizModal";
import Skeleton from "../components/Skeleton";

// Visualizer Imports
import SortingVisualizer from '../components/SortingVisualizer';
import GraphVisualizer from "../components/GraphVisualizer";
import KnapsackVisualizer from "../components/KnapsackVisualizer";
import RecurrenceVisualizer from "../components/RecurrenceVisualizer";
import ComplexityVisualizer from "../components/ComplexityVisualizer";
import MethodologyVisualizer from "../components/MethodologyVisualizer";
import UMLDiagramVisualizer from "../components/UMLDiagramVisualizer";
import DataWarehouseVisualizer from "../components/DataWarehouseVisualizer";

import api from "../api/axios";

const TopicDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const containerRef = useRef(null);

    // State
    const [topic, setTopic] = useState(null);
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [viewMode, setViewMode] = useState('easy');
    const [customInstruction, setCustomInstruction] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Scroll Progress - Default to entire page
    const { scrollYProgress } = useScroll();
    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

    // Load Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [topicRes, accessRes] = await Promise.all([
                api.get(`/courses/topics/${id}`),
                api.get(`/progress/access/${id}`)
            ]);
            setTopic(topicRes.data);
            setAccess(accessRes.data);
            return topicRes.data;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id || id === "undefined") return;
        const init = async () => {
            const data = await loadData();
            if (data && !data.content_markdown && !data.content_easy_markdown && !isSynthesizing) {
                handleSynthesize();
            }
        };
        init();
    }, [id]);

    // Body scroll lock for modals
    useEffect(() => {
        if (isQuizOpen || isSynthesizing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isQuizOpen, isSynthesizing]);

    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        const toastId = toast.loading("Synthesizing content...");
        try {
            await api.post("/ai/topics/synthesize", { topicId: id, customInstruction });
            setIsCustomizing(false);
            setCustomInstruction("");
            await loadData();
            toast.success("Content synthesized.", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Synthesis failed. Try again.", { id: toastId });
        } finally {
            setIsSynthesizing(false);
        }
    };

    const handleToggle = async () => {
        try {
            await api.post("/courses/topics/toggle", { topicId: id });
            await loadData();
            toast.success(topic?.completed ? "Marked as incomplete." : "Topic completed!");
        } catch (err) {
            console.error(err);
            toast.error("Could not update progress.");
        }
    };

    if (!topic && !loading) return <div className="p-20 text-center text-red-500 font-black uppercase">Topic Synchronization Failed</div>;

    const isLight = theme === 'light';

    return (
        <div
            ref={containerRef}
            className={`relative flex flex-col min-h-screen selection:bg-red-500/20 transition-colors duration-300 ${isLight ? 'bg-white text-gray-900' : 'bg-[#050810] text-slate-100'}`}
        >
            {loading ? (
                <div className="relative z-10 w-full mx-auto px-6 lg:px-20 py-16 lg:py-24 max-w-[1600px]">
                    <Skeleton.TopicHero />
                    <div className="h-12 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse mb-16" />
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                        <div className="xl:col-span-8 space-y-6">
                            <Skeleton.TopicContent />
                        </div>
                        <div className="xl:col-span-4 space-y-4">
                            <Skeleton.Card />
                            <Skeleton.Card />
                        </div>
                    </div>
                </div>
            ) : access?.locked ? (
                <div className="flex-1 flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-morphism max-w-2xl w-full p-16 rounded-[3rem] text-center relative overflow-hidden"
                    >
                        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-lg shadow-red-500/10">
                            <ShieldCheck size={32} className="text-red-500" />
                        </div>
                        <h1 className={`text-4xl font-black mb-4 uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : 'text-white'}`}>Security Clearance Required</h1>
                        <p className={`mb-10 text-sm leading-relaxed uppercase tracking-widest font-bold ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                            Proficiency Threshold: <span className="text-red-500">{access.reqScore}%</span> <br />
                            Current Synchronization: <span className={isLight ? 'text-gray-700' : 'text-slate-200'}>{access.yourPrevScore}%</span>
                        </p>
                        <button
                            onClick={() => navigate(`/topics/${access.prevTopicId}`)}
                            className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-red-600/20"
                        >
                            Retreat to Previous Node
                        </button>
                    </motion.div>
                </div>
            ) : (
                <>
                    {/* AMBIENT LAYERS */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        {isLight ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-red-500/5 to-transparent" />
                                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 blur-[150px] rounded-full animate-nebula-float" />
                                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gray-400/10 blur-[150px] rounded-full animate-nebula-float" style={{ animationDelay: '-5s' }} />
                            </>
                        ) : (
                            <>
                                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent" />
                                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-nebula-float" />
                                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[150px] rounded-full animate-nebula-float" style={{ animationDelay: '-5s' }} />
                            </>
                        )}
                    </div>

                    {/* PROGRESS BAR */}
                    <motion.div
                        className={`fixed top-0 left-0 right-0 h-1 z-[60] origin-left ${isLight ? 'bg-gradient-to-r from-red-500 via-red-400 to-rose-500 shadow-lg shadow-red-500/20' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20'}`}
                        style={{ scaleX: scrollYProgress }}
                    />

                    {/* AI SYNC OVERLAY */}
                    <AnimatePresence>
                        {isSynthesizing && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className={`fixed inset-0 z-[100] backdrop-blur-xl flex items-center justify-center p-6 ${isLight ? 'bg-white/80' : 'bg-[#050810]/80'}`}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                    className={`glass-morphism max-w-md w-full p-12 rounded-[2.5rem] flex flex-col items-center ${isLight ? 'bg-white/90' : 'bg-zinc-900/50'}`}
                                >
                                    <Sparkles className={`mb-8 animate-pulse ${isLight ? 'text-red-500' : 'text-indigo-400'}`} size={48} />
                                    <h2 className={`text-3xl font-black uppercase italic tracking-tighter mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Synthesizing</h2>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-10 ${isLight ? 'text-red-600/60' : 'text-indigo-400/60'}`}>Deploying High-Fidelity Architecture</p>
                                    <div className={`w-full h-1 rounded-full overflow-hidden relative ${isLight ? 'bg-gray-200' : 'bg-white/5'}`}>
                                        <motion.div
                                            animate={{ left: ["-100%", "100%"] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent to-transparent ${isLight ? 'via-red-400' : 'via-cyan-400'}`}
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative z-10 w-full mx-auto px-6 lg:px-20 py-16 lg:py-24 max-w-[1600px]">
                        {/* CINEMATIC HERO */}
                        <motion.header 
                            style={{ opacity: headerOpacity, scale: headerScale }}
                            className="mb-24 flex flex-col gap-8"
                        >
                            <nav className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
                                <button onClick={() => navigate('/dashboard')} className={`transition-colors ${isLight ? 'hover:text-red-600' : 'hover:text-indigo-400'}`}>Neural Hub</button>
                                <ChevronRight size={12} className="opacity-30" />
                                <button onClick={() => navigate(`/courses/${topic.course_id}/roadmap`)} className={`transition-colors ${isLight ? 'hover:text-red-600' : 'hover:text-indigo-400'}`}>Roadmap</button>
                                <ChevronRight size={12} className="opacity-30" />
                                <span className={isLight ? 'text-red-600/70' : 'text-indigo-400/60'}>{topic.title}</span>
                            </nav>

                            <h1 className={`text-5xl lg:text-7xl xl:text-8xl font-black tracking-tightest leading-[1] italic drop-shadow-2xl max-w-5xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                {topic.title}
                            </h1>

                            <div className={`flex flex-wrap items-center gap-10 mt-6 pt-10 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Protocol Complexity</span>
                                    <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${isLight ? 'text-red-600' : 'text-indigo-400'}`}>
                                        <Layers size={14} /> {topic.difficulty || 'Advanced Matrix'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Cognitive Load</span>
                                    <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>
                                        <Clock size={14} /> {topic.estimated_time || '2h 15m'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Mastery Status</span>
                                    <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${topic.completed ? 'text-emerald-500' : isLight ? 'text-gray-400' : 'text-slate-600'}`}>
                                        <CheckCircle size={14} /> {topic.completed ? 'Verified' : 'Pending Sync'}
                                    </span>
                                </div>
                            </div>
                        </motion.header>

                        {/* ADAPTIVE CONTROL BAR (STICKY) */}
                        <div className="sticky top-6 z-50 mb-16">
                            <div className={`glass-morphism p-2 rounded-2xl flex items-center justify-between gap-4 shadow-2xl backdrop-blur-2xl ${isLight ? 'bg-white/80 border-gray-200' : 'bg-zinc-900/40 border-white/5'}`}>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setViewMode('easy')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'easy' ? (isLight ? 'bg-red-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        Essential Protocol
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('deep')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'deep' ? (isLight ? 'bg-red-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        Deep Architecture
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('notebook')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'notebook' ? (isLight ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        <Sparkles size={14} className="inline mr-2" /> Research Notebook
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (localStorage.getItem('userPlan') !== 'premium') {
                                                navigate('/upgrade');
                                            } else {
                                                setViewMode('podcast');
                                            }
                                        }}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'podcast' ? (isLight ? 'bg-red-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        {localStorage.getItem('userPlan') !== 'premium'
                                            ? <Lock size={12} />
                                            : <Headphones size={12} />
                                        }
                                        Podcast
                                    </button>
                                    <button
                                        onClick={() => setIsCustomizing(true)}
                                        className={`hidden sm:flex px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLight ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                                    >
                                        <Zap size={14} className="inline mr-2" /> Re-Forge Node
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 pr-2">
                                    <div className={`hidden lg:flex items-center gap-2 mr-4 pr-4 border-r ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Synaptic Map:</span>
                                        {topic.prerequisites?.length > 0 ? (
                                            <div className="flex gap-2">
                                                {topic.prerequisites.map((pre, idx) => (
                                                    <span key={idx} className={`text-[10px] font-bold uppercase py-1 px-2 rounded-lg border ${isLight ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-slate-300'}`}>{pre}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-500' : 'text-slate-500'}`}>None</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={handleToggle}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${topic.completed ? 'bg-emerald-600 text-white' : (isLight ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white')}`}
                                    >
                                        <CheckCircle size={14} /> {topic.completed ? 'Mastered' : 'Complete Sync'}
                                    </button>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {isCustomizing && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }} 
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`glass-morphism p-4 rounded-2xl shadow-xl border ${isLight ? 'bg-white border-emerald-200' : 'bg-zinc-900 border-emerald-500/20'}`}>
                                            <textarea 
                                                value={customInstruction}
                                                onChange={(e) => setCustomInstruction(e.target.value)}
                                                placeholder="Forge Instruction... (e.g. 'Explain with hardware focus')"
                                                className={`w-full border rounded-xl p-4 text-[10px] font-medium outline-none transition-all min-h-[80px] mb-3 ${isLight ? 'bg-emerald-50/50 border-emerald-100 text-gray-800 focus:border-emerald-400' : 'bg-black/40 border-emerald-500/10 text-slate-200 focus:border-emerald-500/30'}`}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsCustomizing(false)} className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>Abort</button>
                                                <button onClick={handleSynthesize} className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">Execute Sync</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* DYNAMIC CONTENT GRID */}
                        <AnimatePresence mode="wait">
                            {viewMode === 'notebook' ? (
                                <motion.div
                                    key="notebook"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full"
                                >
                                    <TopicNotebook topic={topic} isDark={true} />
                                </motion.div>
                            ) : viewMode === 'podcast' ? (
                                <motion.div
                                    key="podcast"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="max-w-3xl mx-auto w-full"
                                >
                                    <TopicPodcastPlayer topic={topic} />
                                </motion.div>
                            ) : (
                                <motion.main
                                    key="standard"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="max-w-6xl mx-auto w-full"
                                >
                                    <div className="space-y-20">
                                        
                                        {/* VISUALIZER MATRIX */}
                                        <section className="space-y-16">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-1 h-8 rounded-full ${isLight ? 'bg-red-500' : 'bg-purple-500'}`} />
                                                    <h2 className={`text-2xl font-black uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : ''}`}>Tactile Lab</h2>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Active Simulation Engine</span>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {topic.title?.toLowerCase().includes("sorting") && <SortingVisualizer />}
                                                {(topic.title?.toLowerCase().includes("graph") || topic.title?.toLowerCase().includes("search") || topic.title?.toLowerCase().includes("bfs") || topic.title?.toLowerCase().includes("dfs") || topic.title?.toLowerCase().includes("path")) && <GraphVisualizer algorithm="BFS" />}
                                                {topic.title?.toLowerCase().includes("knapsack") && <KnapsackVisualizer />}
                                                {topic.title?.toLowerCase().includes("recurrence") && <RecurrenceVisualizer />}
                                                 {(topic.title?.toLowerCase().includes("complexity") || topic.title?.toLowerCase().includes("big o") || topic.title?.toLowerCase().includes("asymptotic") || topic.title?.toLowerCase().includes("growth")) && <ComplexityVisualizer />}
                                                 {(topic.title?.toLowerCase().includes("olap") || topic.title?.toLowerCase().includes("warehouse")) && <DataWarehouseVisualizer type="comparison" />}
                                                 {(topic.title?.toLowerCase().includes("uml") || topic.title?.toLowerCase().includes("activity") || topic.title?.toLowerCase().includes("sequence") || topic.title?.toLowerCase().includes("use case")) && <UMLDiagramVisualizer type={topic.title?.toLowerCase().includes("activity") ? "activity" : topic.title?.toLowerCase().includes("sequence") ? "sequence" : "class"} />}
                                                 {(topic.title?.toLowerCase().includes("sdlc") || topic.title?.toLowerCase().includes("waterfall") || topic.title?.toLowerCase().includes("spiral") || topic.title?.toLowerCase().includes("scrum") || topic.title?.toLowerCase().includes("agile") || topic.title?.toLowerCase().includes("kanban") || topic.title?.toLowerCase().includes("xp")) && <MethodologyVisualizer type={topic.title?.toLowerCase().includes("spiral") ? "spiral" : topic.title?.toLowerCase().includes("scrum") ? "scrum" : topic.title?.toLowerCase().includes("kanban") ? "kanban" : topic.title?.toLowerCase().includes("xp") ? "xp" : "waterfall"} />}
                                            </AnimatePresence>
                                        </section>

                                        {/* ACADEMIC MANUSCRIPT */}
                                        <section className={`prose max-w-none ${isLight ? 'prose-gray' : 'prose-invert'}`}>
                                            <TopicContent topic={topic} mode={viewMode} />
                                        </section>

                                        {/* MASTERY ANTHEM (Footer Reinforcement) */}
                                        {topic.song_url && (
                                            <section className={`pt-20 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                                                <div className="flex flex-col md:flex-row gap-12 items-center">
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-1 h-8 bg-amber-500 rounded-full" />
                                                            <h2 className={`text-3xl font-black uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : ''}`}>Harmonic Reinforcement</h2>
                                                        </div>
                                                        <p className={`text-lg leading-relaxed font-medium italic ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                                                            "A cognitive lock-in for your neural pathways. Let the rhythm solidify the architecture."
                                                        </p>
                                                    </div>
                                                    <div className="w-full md:w-[400px]">
                                                        <TopicSongPlayer 
                                                            songUrl={topic.song_url} 
                                                            songLyrics={topic.song_lyrics} 
                                                            topicTitle={topic.title} 
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                </motion.main>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}

            <QuizModal isOpen={isQuizOpen} setIsOpen={setIsQuizOpen} topicId={id} />
        </div>
    );
};

export default TopicDetails;