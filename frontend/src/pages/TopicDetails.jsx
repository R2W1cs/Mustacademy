import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../auth/ThemeContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
    ChevronRight, Zap, Brain, SendHorizontal, Sparkles, 
    ShieldCheck, AlertTriangle, Play, CheckCircle, Music,
    Clock, Award, BookOpen, Layers, BarChart3, Database,
    Search, Cpu, Network, Code, Binary, Globe, Shield, GitBranch
} from "lucide-react";

import TopicContent from "../components/TopicContent";
import TopicPodcastPlayer from "../components/TopicPodcastPlayer";
import TopicSongPlayer from "../components/TopicSongPlayer";
import QuizModal from "../components/QuizModal";

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
    const isDark = theme === 'dark';
    const containerRef = useRef(null);
    
    // Core State
    const [topic, setTopic] = useState(null);
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [viewMode, setViewMode] = useState('easy');
    const [customInstruction, setCustomInstruction] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [readinessVerdict, setReadinessVerdict] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);

    // Scroll Progress for Header
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
    const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

    // Data Fetching
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

    // Body Scroll Lock for Modals
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
        try {
            await api.post("/ai/topics/synthesize", { topicId: id, customInstruction });
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

    const runReadinessAudit = async () => {
        if (!topic?.course_id) return;
        setIsAuditing(true);
        try {
            const res = await api.get(`/exams/readiness/${topic.course_id}`);
            setReadinessVerdict(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAuditing(false);
        }
    };

    const startExam = () => {
        navigate("/exams/session", {
            state: {
                courseId: topic.course_id,
                courseName: topic.breadcrumb_path?.split(' > ')[0] || "Course",
                mode: topic?.title?.toLowerCase().includes("final") ? "Final" : "Midterm",
                topics: [topic.title]
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050810]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-20 h-20">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-indigo-500 animate-pulse" size={24} />
                    </div>
                </div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[1em] animate-pulse">Initializing Matrix</p>
            </div>
        </div>
    );

    if (!topic) return <div className="p-20 text-center text-red-500 font-black uppercase">Topic Synchronization Failed</div>;

    if (access?.locked) return (
        <div className="min-h-screen w-full flex items-center justify-center px-6 bg-[#050810]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism max-w-2xl w-full p-16 rounded-[3rem] text-center relative overflow-hidden"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-lg shadow-red-500/10">
                    <ShieldCheck size={32} className="text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tight">Security Clearance Required</h1>
                <p className="text-slate-400 mb-10 text-sm leading-relaxed uppercase tracking-widest font-bold">
                    Proficiency Threshold: <span className="text-red-500">{access.reqScore}%</span> <br/>
                    Current Synchronization: <span className="text-slate-200">{access.yourPrevScore}%</span>
                </p>
                <button 
                    onClick={() => navigate(`/topics/${access.prevTopicId}`)}
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-red-600/20"
                >
                    Retreat to Previous Node
                </button>
            </motion.div>
        </div>
    );

    return (
        <div ref={containerRef} className="relative flex flex-col min-h-screen bg-[#050810] text-slate-100 selection:bg-indigo-500/30">
            
            {/* AMBIENT LAYERS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-nebula-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[150px] rounded-full animate-nebula-float" style={{ animationDelay: '-5s' }} />
            </div>

            {/* PROGRESS BAR */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[60] origin-left shadow-lg shadow-indigo-500/20"
                style={{ scaleX: scrollYProgress }}
            />

            {/* AI SYNC OVERLAY */}
            <AnimatePresence>
                {isSynthesizing && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#050810]/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="glass-morphism max-w-md w-full p-12 rounded-[2.5rem] flex flex-col items-center bg-zinc-900/50"
                        >
                            <Sparkles className="text-indigo-400 mb-8 animate-pulse" size={48} />
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Synthesizing</h2>
                            <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.4em] mb-10">Deploying High-Fidelity Architecture</p>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div 
                                    animate={{ left: ["-100%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
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
                    <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-400 transition-colors">Neural Hub</button>
                        <ChevronRight size={12} className="opacity-30" />
                        <button onClick={() => navigate(`/courses/${topic.course_id}/roadmap`)} className="hover:text-indigo-400 transition-colors">Roadmap</button>
                        <ChevronRight size={12} className="opacity-30" />
                        <span className="text-indigo-400/60">{topic.title}</span>
                    </nav>

                    <h1 className="text-5xl lg:text-9xl font-black tracking-tightest leading-[0.9] text-white italic drop-shadow-2xl">
                        {topic.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-10 mt-6 pt-10 border-t border-white/5">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Complexity</span>
                            <span className="text-sm font-bold text-indigo-400 uppercase tracking-tighter flex items-center gap-2">
                                <Layers size={14} /> {topic.difficulty || 'Advanced Matrix'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cognitive Load</span>
                            <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter flex items-center gap-2">
                                <Clock size={14} /> {topic.estimated_time || '2h 15m'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Status</span>
                            <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${topic.completed ? 'text-emerald-400' : 'text-slate-600'}`}>
                                <CheckCircle size={14} /> {topic.completed ? 'Verified' : 'Pending Sync'}
                            </span>
                        </div>
                    </div>
                </motion.header>

                {/* ADAPTIVE CONTROL BAR (STICKY) */}
                <div className="sticky top-6 z-50 mb-16">
                    <div className="glass-morphism p-2 rounded-2xl flex items-center justify-between gap-4 shadow-2xl bg-zinc-900/40 backdrop-blur-2xl border-white/5">
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setViewMode('easy')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'easy' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Essential Protocol
                            </button>
                            <button 
                                onClick={() => setViewMode('deep')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'deep' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Deep Architecture
                            </button>
                        </div>

                        <div className="flex items-center gap-2 pr-2">
                            <button 
                                onClick={() => setIsQuizOpen(true)}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center gap-2"
                            >
                                <Brain size={14} /> Audit Brain
                            </button>
                            <button 
                                onClick={handleToggle}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${topic.completed ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}
                            >
                                <CheckCircle size={14} /> {topic.completed ? 'Mastered' : 'Complete Sync'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC CONTENT GRID */}
                <main className="grid grid-cols-1 xl:grid-cols-12 gap-12 orientation-aware">
                    
                    {/* LEFT PANEL — MAIN LECTURE */}
                    <div className="xl:col-span-8 space-y-20">
                        
                        {/* THE PODCAST EXPERIENCE (Integrated) */}
                        <section className="animate-in slide-in-from-bottom-10 duration-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                                <h2 className="text-2xl font-black uppercase italic tracking-tightest">Synthesized Dialogue</h2>
                            </div>
                            <TopicPodcastPlayer topic={topic} />
                        </section>

                        {/* VISUALIZER MATRIX */}
                        <section className="space-y-16">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-8 bg-purple-500 rounded-full" />
                                    <h2 className="text-2xl font-black uppercase italic tracking-tightest">Tactile Lab</h2>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Simulation Engine</span>
                            </div>

                            <AnimatePresence mode="wait">
                                {topic.title?.toLowerCase().includes("sorting") && <SortingVisualizer />}
                                {topic.title?.toLowerCase().includes("graph") && <GraphVisualizer algorithm="BFS" />}
                                {topic.title?.toLowerCase().includes("knapsack") && <KnapsackVisualizer />}
                                {topic.title?.toLowerCase().includes("recurrence") && <RecurrenceVisualizer />}
                                {topic.title?.toLowerCase().includes("complexity") && <ComplexityVisualizer />}
                                {(topic.title?.toLowerCase().includes("olap") || topic.title?.toLowerCase().includes("warehouse")) && <DataWarehouseVisualizer type="comparison" />}
                                {topic.title?.toLowerCase().includes("uml") && <UMLDiagramVisualizer type="class" />}
                                {topic.title?.toLowerCase().includes("sdlc") && <MethodologyVisualizer type="waterfall" />}
                            </AnimatePresence>
                        </section>

                        {/* ACADEMIC MANUSCRIPT */}
                        <section className="prose prose-invert max-w-none">
                            <TopicContent topic={topic} mode={viewMode} />
                        </section>

                        {/* MASTERY ANTHEM (Footer Reinforcement) */}
                        {topic.song_url && (
                            <section className="pt-20 border-t border-white/5">
                                <div className="flex flex-col md:flex-row gap-12 items-center">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-8 bg-amber-500 rounded-full" />
                                            <h2 className="text-3xl font-black uppercase italic tracking-tightest">Harmonic Reinforcement</h2>
                                        </div>
                                        <p className="text-slate-400 text-lg leading-relaxed font-medium italic">
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

                    {/* RIGHT PANEL — INTEL HUD */}
                    <aside className="xl:col-span-4 space-y-8">
                        <div className="glass-morphism rounded-3xl p-8 sticky top-40 bg-zinc-900/20 border-white/5 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Synaptic Map</h3>
                                <div className="space-y-2">
                                    {topic.prerequisites?.map((pre, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-indigo-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{pre}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Adaptive Intelligence</h3>
                                <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest">
                                    Adjust the pedagogical matrix in real-time. Challenge the AI to re-architect this node.
                                </p>
                                <button 
                                    onClick={() => setIsCustomizing(true)}
                                    className="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/10 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                                >
                                    <Zap size={14} /> Re-Forge Node
                                </button>
                            </div>

                            {/* RE-FORGE PANEL (Conditional) */}
                            <AnimatePresence>
                                {isCustomizing && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 overflow-hidden pt-4"
                                    >
                                        <textarea 
                                            value={customInstruction}
                                            onChange={(e) => setCustomInstruction(e.target.value)}
                                            placeholder="Forge Instruction... (e.g. 'Explain with hardware focus')"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-medium text-slate-200 outline-none focus:border-emerald-500/30 transition-all min-h-[100px]"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsCustomizing(false)} className="flex-1 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">Abort</button>
                                            <button onClick={handleSynthesize} className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Execute Sync</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>
                </main>
            </div>

            <QuizModal isOpen={isQuizOpen} setIsOpen={setIsQuizOpen} topicId={id} />
        </div>
    );
};

export default TopicDetails;
