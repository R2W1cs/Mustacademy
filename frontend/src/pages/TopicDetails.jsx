import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../auth/ThemeContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    ChevronRight, ChevronLeft, Sparkles, ShieldCheck, CheckCircle,
    Layers, Clock, Headphones, BookOpen, ArrowLeft
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
import NetworkVisualizer from "../components/NetworkVisualizer";
import { resolveLessonVisualizers } from "../utils/lessonVisualizers";

import api from "../api/axios";

function renderLessonViz(lab, key) {
    const p = lab.props || {};
    switch (lab.viz) {
        case 'sorting': return <SortingVisualizer key={key} />;
        case 'graph': return <GraphVisualizer key={key} algorithm={p.algorithm || 'BFS'} />;
        case 'knapsack': return <KnapsackVisualizer key={key} />;
        case 'recurrence': return <RecurrenceVisualizer key={key} />;
        case 'complexity': return <ComplexityVisualizer key={key} />;
        case 'methodology': return <MethodologyVisualizer key={key} type={p.type || 'waterfall'} />;
        case 'uml': return <UMLDiagramVisualizer key={key} type={p.type || 'class'} />;
        case 'warehouse': return <DataWarehouseVisualizer key={key} type="comparison" />;
        case 'network': return <NetworkVisualizer key={key} type={p.type} config={p.config} />;
        default: return null;
    }
}

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
    const [viewMode, setViewMode] = useState('lesson');

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
        loadData();
    }, [id]);

    // Body scroll lock for modals
    useEffect(() => {
        if (isQuizOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isQuizOpen]);

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

    if (!topic && !loading) return <div className="p-20 text-center text-red-500 font-black uppercase">Could not load this lesson</div>;

    const isLight = theme === 'light';
    const lessonLabs = topic ? resolveLessonVisualizers(topic.title) : [];

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
                        <h1 className={`text-4xl font-black mb-4 uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : 'text-white'}`}>Complete the previous lesson first</h1>
                        <p className={`mb-10 text-sm leading-relaxed uppercase tracking-widest font-bold ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                            Required score: <span className="text-red-500">{access.reqScore}%</span> <br />
                            Your score: <span className={isLight ? 'text-gray-700' : 'text-slate-200'}>{access.yourPrevScore}%</span>
                        </p>
                        <button
                            onClick={() => navigate(`/topics/${access.prevTopicId}`)}
                            className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-red-600/20"
                        >
                            Go to previous lesson
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
                    {/* Scroll progress */}
                    <motion.div
                        className={`fixed top-0 left-0 right-0 h-1 z-[60] origin-left ${isLight ? 'bg-gradient-to-r from-red-500 via-red-400 to-rose-500 shadow-lg shadow-red-500/20' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20'}`}
                        style={{ scaleX: scrollYProgress }}
                    />

                    <div className="relative z-10 w-full mx-auto px-6 lg:px-20 py-16 lg:py-20 pb-8 max-w-[1600px]">
                        {/* HERO — back link stays visible; title fades on scroll */}
                        <header className="mb-16 flex flex-col gap-8">
                            <nav className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
                                <button onClick={() => navigate('/dashboard')} className={`transition-colors ${isLight ? 'hover:text-red-600' : 'hover:text-indigo-400'}`}>Home</button>
                                <ChevronRight size={12} className="opacity-30" />
                                <button onClick={() => navigate(`/courses/${topic.course_id}`)} className={`transition-colors ${isLight ? 'hover:text-red-600' : 'hover:text-indigo-400'}`}>Course</button>
                                <ChevronRight size={12} className="opacity-30" />
                                <span className={isLight ? 'text-red-600/70' : 'text-indigo-400/60'}>{topic.title}</span>
                            </nav>

                            <motion.div style={{ opacity: headerOpacity, scale: headerScale }}>
                                <h1 className={`text-5xl lg:text-7xl xl:text-8xl font-black tracking-tightest leading-[1] italic drop-shadow-2xl max-w-5xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                    {topic.title}
                                </h1>

                                <div className={`flex flex-wrap items-center gap-10 mt-6 pt-10 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                                    <div className="flex flex-col gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Difficulty</span>
                                        <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${isLight ? 'text-red-600' : 'text-indigo-400'}`}>
                                            <Layers size={14} /> {topic.difficulty || 'Intermediate'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Est. time</span>
                                        <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>
                                            <Clock size={14} /> {topic.estimated_time || '2h 15m'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Progress</span>
                                        <span className={`text-sm font-bold uppercase tracking-tighter flex items-center gap-2 ${topic.completed ? 'text-emerald-500' : isLight ? 'text-gray-400' : 'text-slate-600'}`}>
                                            <CheckCircle size={14} /> {topic.completed ? 'Done' : 'Not started'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </header>

                        {/* STICKY BAR — back button always visible */}
                        <div className="sticky top-3 z-50 mb-16">
                            <div className={`glass-morphism p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-2xl ${isLight ? 'bg-white/90 border-gray-200' : 'bg-zinc-900/60 border-white/5'}`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/courses/${topic.course_id}`)}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${isLight ? 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600' : 'bg-white/10 border-white/10 text-slate-200 hover:border-indigo-400/40 hover:text-white'}`}
                                    >
                                        <ArrowLeft size={14} /> Back to course
                                    </button>
                                    <div className={`hidden sm:block w-px h-8 ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                                    <button 
                                        onClick={() => setViewMode('lesson')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'lesson' ? (isLight ? 'bg-red-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        <BookOpen size={12} /> Lesson
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('notebook')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'notebook' ? (isLight ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        <Sparkles size={14} className="inline mr-2" /> 1-on-1 AI Tutor
                                    </button>
                                    <button
                                        onClick={() => setViewMode('podcast')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'podcast' ? (isLight ? 'bg-red-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : (isLight ? 'text-gray-500 hover:text-gray-700' : 'text-slate-500 hover:text-slate-300')}`}
                                    >
                                        <Headphones size={12} />
                                        Podcast
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 pr-2">
                                    <div className={`hidden lg:flex items-center gap-2 mr-4 pr-4 border-r ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>Before this:</span>
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
                                        <CheckCircle size={14} /> {topic.completed ? 'Done' : 'Mark complete'}
                                    </button>
                                </div>
                            </div>
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
                                    <TopicNotebook topic={topic} isDark={!isLight} />
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
                                        
                                        {/* Interactive lab — every lesson gets at least one animation */}
                                        <section className="space-y-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-1 h-8 rounded-full ${isLight ? 'bg-red-500' : 'bg-purple-500'}`} />
                                                    <div>
                                                        <h2 className={`text-2xl font-black uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : 'text-white'}`}>Interactive lab</h2>
                                                        <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>Press Play or Step to walk through this lesson.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-12">
                                                {lessonLabs.map((lab, i) => renderLessonViz(lab, `${lab.viz}-${i}`))}
                                            </div>
                                        </section>

                                        {/* ACADEMIC MANUSCRIPT — NetworkVisualizer mounts inside TopicContent */}
                                        <section className={`prose max-w-none ${isLight ? 'prose-gray' : 'prose-invert'}`}>
                                            <TopicContent topic={topic} mode="easy" />
                                        </section>

                                        {/* Lesson navigation — back to course lives in hero; bottom = prev / next only */}
                                        <nav className={`pt-12 pb-6 mt-8 border-t flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                            {topic.prev_topic_id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/topics/${topic.prev_topic_id}`)}
                                                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all text-left ${isLight ? 'bg-white border-gray-200 text-gray-700 hover:border-red-300' : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/40'}`}
                                                >
                                                    <ChevronLeft size={14} />
                                                    <span className="flex flex-col items-start gap-0.5 normal-case tracking-normal font-bold">
                                                        <span className="text-[8px] uppercase tracking-widest opacity-60">Previous</span>
                                                        <span className="text-xs line-clamp-1 max-w-[220px]">{topic.prev_topic_title || 'Previous lesson'}</span>
                                                    </span>
                                                </button>
                                            ) : <span />}
                                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end flex-1">
                                                {topic.next_topic_id ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/topics/${topic.next_topic_id}`)}
                                                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-right sm:ml-auto ${isLight ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                                    >
                                                        <span className="flex flex-col items-end gap-0.5 normal-case tracking-normal font-bold">
                                                            <span className="text-[8px] uppercase tracking-widest opacity-80">Next lesson</span>
                                                            <span className="text-xs line-clamp-1 max-w-[220px]">{topic.next_topic_title || 'Continue'}</span>
                                                        </span>
                                                        <ChevronRight size={14} />
                                                    </button>
                                                ) : (
                                                    <p className={`text-[10px] font-black uppercase tracking-widest text-right sm:ml-auto ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                                        Course complete
                                                    </p>
                                                )}
                                            </div>
                                        </nav>

                                        {/* MASTERY ANTHEM (Footer Reinforcement) */}
                                        {topic.song_url && (
                                            <section className={`pt-20 border-t ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                                                <div className="flex flex-col md:flex-row gap-12 items-center">
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-1 h-8 bg-amber-500 rounded-full" />
                                                            <h2 className={`text-3xl font-black uppercase italic tracking-tightest ${isLight ? 'text-gray-900' : ''}`}>Lesson song</h2>
                                                        </div>
                                                        <p className={`text-lg leading-relaxed font-medium italic ${isLight ? 'text-gray-500' : 'text-slate-400'}`}>
                                                            Listen to reinforce what you learned in this lesson.
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