import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Play, Pause, Info, Search, Loader2, Sparkles, Send,
    SkipBack, SkipForward, Film, Volume2, BookOpen, Cpu, Database,
    Network, Code, Binary, Brain, Globe, Shield, GitBranch, ChevronDown
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

// CS history chapters with icons and cover images (using Unsplash for a rich look)
const CS_CHAPTERS = [
    {
        id: "origins",
        title: "Chapter I — Origins of Computing",
        subtitle: "1940s–1960s",
        description: "Vacuum tubes, Turing machines, and the birth of the digital age.",
        icon: Binary,
        gradient: "from-amber-900/80 to-amber-600/40",
        color: "#F59E0B",
        coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        keywords: ["turing", "algorithm", "binary", "logic", "machine", "computer", "history", "boolean", "assembly"],
    },
    {
        id: "systems",
        title: "Chapter II — Systems & Architecture",
        subtitle: "1960s–1980s",
        description: "Operating systems, memory models, and the layered machine.",
        icon: Cpu,
        gradient: "from-blue-900/80 to-blue-600/40",
        color: "#3B82F6",
        coverUrl: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=800&q=80",
        keywords: ["os", "operating", "architecture", "memory", "cpu", "process", "hardware", "kernel", "cache", "register"],
    },
    {
        id: "data",
        title: "Chapter III — The Data Structures Era",
        subtitle: "1970s–1990s",
        description: "Arrays, trees, graphs — the fundamental vocabulary of computation.",
        icon: Database,
        gradient: "from-emerald-900/80 to-emerald-600/40",
        color: "#10B981",
        coverUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        keywords: ["array", "tree", "graph", "stack", "queue", "linked", "list", "hash", "heap", "data structure", "sort", "search", "bst"],
    },
    {
        id: "networks",
        title: "Chapter IV — Networks & The Internet",
        subtitle: "1980s–2000s",
        description: "TCP/IP, protocols, and the wiring of the world.",
        icon: Network,
        gradient: "from-violet-900/80 to-violet-600/40",
        color: "#8B5CF6",
        coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
        keywords: ["network", "internet", "tcp", "ip", "http", "protocol", "dns", "routing", "packet", "web", "socket"],
    },
    {
        id: "software",
        title: "Chapter V — Software Engineering",
        subtitle: "1990s–2010s",
        description: "Methodologies, design patterns, and the art of building at scale.",
        icon: Code,
        gradient: "from-rose-900/80 to-rose-600/40",
        color: "#F43F5E",
        coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        keywords: ["agile", "scrum", "pattern", "design", "oop", "solid", "refactor", "software", "testing", "version", "git", "ci", "cd"],
    },
    {
        id: "databases",
        title: "Chapter VI — Databases & Storage",
        subtitle: "1970s–Present",
        description: "Relational algebra, SQL, NoSQL, and the modern data landscape.",
        icon: Database,
        gradient: "from-cyan-900/80 to-cyan-600/40",
        color: "#06B6D4",
        coverUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        keywords: ["sql", "database", "relational", "nosql", "query", "schema", "normalization", "index", "transaction", "acid", "olap", "oltp", "warehouse"],
    },
    {
        id: "ai",
        title: "Chapter VII — Intelligence & AI",
        subtitle: "2000s–Present",
        description: "Machine learning, neural networks, and the emergence of artificial minds.",
        icon: Brain,
        gradient: "from-fuchsia-900/80 to-fuchsia-600/40",
        color: "#D946EF",
        coverUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
        keywords: ["ai", "machine learning", "neural", "deep learning", "nlp", "model", "training", "inference", "gpt", "intelligence"],
    },
    {
        id: "security",
        title: "Chapter VIII — Security & Cryptography",
        subtitle: "1970s–Present",
        description: "Cyphers, protocols, and the ongoing war for digital trust.",
        icon: Shield,
        gradient: "from-red-900/80 to-red-600/40",
        color: "#EF4444",
        coverUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
        keywords: ["security", "crypto", "encryption", "hash", "rsa", "tls", "ssl", "vulnerability", "attack", "firewall", "authentication"],
    },
];

// Assign topic to a chapter based on keyword matching
function getChapterForTopic(topic) {
    const titleLower = topic.title?.toLowerCase() || "";
    for (const chapter of CS_CHAPTERS) {
        if (chapter.keywords.some(kw => titleLower.includes(kw))) {
            return chapter.id;
        }
    }
    return "software"; // default chapter
}

// Generate a deterministic color based on topic id for cover images
function getTopicCoverImage(topic) {
    const chapterId = getChapterForTopic(topic);
    const ch = CS_CHAPTERS.find(c => c.id === chapterId);
    return ch?.coverUrl || CS_CHAPTERS[0].coverUrl;
}

const SPEAKERS = {
    host: { name: "Narrator", label: "Voice Over" },
    expert: { name: "Expert", label: "Interviewee" }
};

export default function CsDocumentary() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [topics, setTopics] = useState([]);
    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [expandedChapter, setExpandedChapter] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const [masterclassEpisodes, setMasterclassEpisodes] = useState([]);
    const [mcTitle, setMcTitle] = useState("");
    const [mcTheme, setMcTheme] = useState("");
    const [generatingMasterclass, setGeneratingMasterclass] = useState(false);

    const intervalRef = useRef(null);

    useEffect(() => {
        const loadTopics = async () => {
            try {
                const res = await api.get("/courses/topics/all");
                setTopics(res.data || []);
            } catch { /* fallback */ }
        };
        const loadMasterclass = async () => {
            try {
                const res = await api.get("/ai/masterclass/all");
                setMasterclassEpisodes(res.data || []);
            } catch { /* fallback */ }
        };
        loadTopics();
        loadMasterclass();
    }, []);

    // Voice Pre-loading
    useEffect(() => {
        // [Nuclear Firewall] Web Speech API natively blocked. Neural backend API only.
    }, []);

    const audioRef = useRef(null);

    // Audio Playback Engine (Neural TTS)
    useEffect(() => {
        const stopAudio = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };

        if (!isPlaying || !episode) { stopAudio(); return; }

        const playSegment = async () => {
            const segment = episode.segments[activeSegment];
            if (!segment) return;

            try {
                // Fetch Neural TTS from Backend
                const response = await api.post("/ai/podcast/speech",
                    { text: segment.text, speaker: segment.speaker },
                    { responseType: 'blob' }
                );

                const url = URL.createObjectURL(response.data);
                const audio = new Audio(url);
                audioRef.current = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    if (activeSegment < episode.segments.length - 1) {
                        setActiveSegment(prev => prev + 1);
                    } else {
                        setIsPlaying(false);
                    }
                };

                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    // Minimal fallback
                    if (activeSegment < episode.segments.length - 1) setActiveSegment(prev => prev + 1);
                    else setIsPlaying(false);
                };

                await audio.play();
            } catch (err) {
                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
                console.error(`%c[Neural-Audio] Documentary Synthesis Failure: ${errorMsg}`, "color: #ef4444; font-weight: bold;");
                
                // STRICT: No robotic fallback. Wait and try next segment or stop.
                setTimeout(() => {
                    if (activeSegment < episode.segments.length - 1) {
                        setActiveSegment(prev => prev + 1);
                    } else {
                        setIsPlaying(false);
                    }
                }, 1500); 
            }
        };

        playSegment();

        return stopAudio;
    }, [isPlaying, activeSegment, episode]);

    const generateStory = async (topic) => {
        setLoading(true);
        setError(null);
        setEpisode(null);
        setActiveSegment(0);
        setIsPlaying(false);
        try {
            const res = await api.post("/ai/topics/podcast", {
                topicId: topic.id,
                topicTitle: topic.title
            });
            setEpisode({ ...res.data.episode, topicImage: getTopicCoverImage(topic) });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate story.");
        } finally {
            setLoading(false);
        }
    };

    const generateMasterclass = async () => {
        if (!mcTitle || !mcTheme) return;
        setGeneratingMasterclass(true);
        setError(null);
        try {
            await api.post("/ai/masterclass/generate", {
                title: mcTitle, theme: mcTheme, partNumber: masterclassEpisodes.length + 1
            });
            setMcTitle(""); setMcTheme("");
            const res = await api.get("/ai/masterclass/all");
            setMasterclassEpisodes(res.data || []);
        } catch { setError("Failed to synthesize Original Series."); }
        finally { setGeneratingMasterclass(false); }
    };

    const playMasterclass = async (ep) => {
        setLoading(true);
        setEpisode(null);
        setError(null);
        try {
            const res = await api.get(`/ai/masterclass/episode/${ep.id}`);
            setEpisode(res.data);
            setActiveSegment(0);
        } catch { setError("Failed to load archived episode."); }
        finally { setLoading(false); }
    };

    // Filter topics and group into chapters
    const filteredTopics = topics.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chapteredTopics = CS_CHAPTERS.map(chapter => ({
        ...chapter,
        topics: filteredTopics.filter(t => getChapterForTopic(t) === chapter.id)
    })).filter(ch => ch.topics.length > 0);

    // Inline search results when searching
    const isSearching = searchQuery.trim().length > 0;

    const netflixRed = "#E50914";
    const themeBg = isDark ? "bg-[#141414] text-white" : "bg-white text-[#141414]";

    return (
        <div className={`min-h-screen ${themeBg} pb-20 font-sans`}>

            {/* HERO SECTION */}
            <div className="relative w-full h-[60vh] min-h-[460px] flex items-end overflow-hidden">
                <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#e5e5e5]'}`}>
                    {/* Cinematic strip backdrop */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                            linear-gradient(90deg, transparent 0%, transparent 49%, rgba(229,9,20,0.15) 50%, transparent 51%),
                            linear-gradient(0deg, transparent 0%, transparent 69%, rgba(229,9,20,0.05) 70%, transparent 71%)
                        `,
                        backgroundSize: "80px 80px"
                    }} />
                    <div className="absolute inset-0 opacity-40" style={{
                        backgroundImage: 'radial-gradient(ellipse at 65% 20%, #E50914 0%, transparent 50%)'
                    }} />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#141414] via-[#141414]/60' : 'from-white via-white/60'} to-transparent`} />
                </div>

                <div className="relative z-10 w-full px-6 md:px-12 pb-14">
                    <div className="flex items-center gap-2 mb-3">
                        <Film size={14} style={{ color: netflixRed }} />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: netflixRed }}>
                            An AI Original Series
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-3 tracking-tighter drop-shadow-lg leading-none">
                        CS DOCUMENTARY
                    </h1>
                    <p className={`text-base md:text-lg max-w-xl font-medium mb-8 drop-shadow-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        The complete story of computer science — from vacuum tubes to neural networks. Select any topic to generate your AI-narrated story.
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => {
                                if (filteredTopics.length > 0) {
                                    generateStory(filteredTopics[0]);
                                }
                            }}
                            className="bg-white text-black px-7 py-3 rounded flex items-center gap-2 font-bold hover:bg-white/90 transition-all text-sm uppercase tracking-wider"
                        >
                            <Play size={18} fill="currentColor" />
                            Watch Story
                        </button>
                        <button
                            onClick={() => setShowAbout(true)}
                            className={`px-7 py-3 rounded flex items-center gap-2 font-bold transition-all text-sm uppercase tracking-wider backdrop-blur-md ${isDark ? 'bg-zinc-800/60 text-white hover:bg-zinc-800' : 'bg-gray-200/80 text-black hover:bg-gray-300'}`}
                        >
                            <Info size={18} />
                            About Series
                        </button>
                    </div>
                </div>
            </div>

            {/* ============ NETFLIX-STYLE ABOUT MODAL ============ */}
            <AnimatePresence>
                {showAbout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
                        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
                        onClick={() => setShowAbout(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                            onClick={e => e.stopPropagation()}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
                            style={{ backgroundColor: '#141414', color: 'white' }}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowAbout(false)}
                                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 transition-all text-white"
                                style={{ backdropFilter: 'blur(8px)' }}
                            >
                                ✕
                            </button>

                            {/* Hero backdrop */}
                            <div className="relative h-56 md:h-72 overflow-hidden rounded-t-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80"
                                    alt="CS Documentary"
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0" style={{
                                    background: 'linear-gradient(to top, #141414 0%, #141414aa 40%, transparent 100%)'
                                }} />
                                {/* Series logo in hero */}
                                <div className="absolute bottom-6 left-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Film size={14} style={{ color: '#E50914' }} />
                                        <span className="text-[9px] font-black tracking-[0.4em] uppercase" style={{ color: '#E50914' }}>An AI Original Series</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-lg leading-none">CS DOCUMENTARY</h2>
                                </div>
                            </div>

                            {/* Content body */}
                            <div className="px-6 pb-8 pt-2 space-y-6">

                                {/* Meta row */}
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-green-400 font-bold">98% Match</span>
                                    <span className="border border-white/30 px-1.5 py-0.5 text-[11px] font-bold text-white/70 rounded">G</span>
                                    <span className="text-white/60">2024</span>
                                    <span className="border border-white/20 px-1.5 py-0.5 text-[10px] rounded text-white/50">HD</span>
                                    <span className="border border-white/20 px-1.5 py-0.5 text-[10px] rounded text-white/50">AI Audio</span>
                                    <div className="flex gap-2 ml-auto flex-wrap">
                                        <button
                                            onClick={() => { setShowAbout(false); if (filteredTopics.length > 0) { generateStory(filteredTopics[0]); } }}
                                            className="flex items-center gap-2 px-5 py-2 rounded font-bold text-sm text-black bg-white hover:bg-white/90 transition-all"
                                        >
                                            <Play size={16} fill="currentColor" /> Play
                                        </button>
                                    </div>
                                </div>

                                {/* Synopsis */}
                                <div>
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        <span className="font-bold text-white">CS DOCUMENTARY</span> is an AI-powered, narrated series that takes you through the complete history and science of computing — from Charles Babbage's mechanical engines and Alan Turing's theoretical machines, through the operating system revolution, the internet era, and into modern artificial intelligence and cybersecurity.
                                    </p>
                                    <p className="text-sm text-white/60 leading-relaxed mt-3">
                                        Each episode is a deep-dive audio story, narrated by an AI voice cast, exploring real concepts through the lens of human drama, technological breakthroughs, and the ideas that changed the world. Pick any topic, press play, and let the story unfold.
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                {/* Cast / creators */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-white/40 text-xs">Narrated by </span>
                                        <span className="text-white/80">AI Voice Cast</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 text-xs">Created by </span>
                                        <span className="text-white/80">CS Roadmap AI</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 text-xs">Genres: </span>
                                        <span className="text-white/80">Education · Science · Drama</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40 text-xs">Language: </span>
                                        <span className="text-white/80">English</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                {/* Chapters overview */}
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Series Overview</h3>
                                    <div className="space-y-3">
                                        {CS_CHAPTERS.map((ch, i) => {
                                            const Icon = ch.icon;
                                            return (
                                                <div key={ch.id} className="flex items-start gap-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                                                    <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: ch.color + '22' }}>
                                                        <Icon size={16} style={{ color: ch.color }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-sm text-white">{ch.title}</span>
                                                        </div>
                                                        <p className="text-xs text-white/50 leading-relaxed">{ch.description}</p>
                                                        <span className="inline-block mt-1 text-[10px] font-bold" style={{ color: ch.color }}>{ch.subtitle}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ERROR BOUNDARY */}
            {error && (
                <div className="px-6 md:px-12 mt-4">
                    <div className="p-4 rounded border-l-4" style={{ backgroundColor: isDark ? '#2b0b0b' : '#ffeaeb', borderColor: netflixRed, color: isDark ? 'white' : 'black' }}>
                        <span className="font-bold">Error:</span> {error}
                    </div>
                </div>
            )}

            {/* PLAYER SECTION */}
            <AnimatePresence>
                {(episode || loading) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mx-6 md:mx-12 my-10 relative overflow-hidden rounded-xl border ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'}`}
                    >
                        {loading ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center">
                                <Loader2 size={48} className="animate-spin mb-6" style={{ color: netflixRed }} />
                                <h2 className="text-2xl font-bold tracking-tight mb-2">Synthesizing Story...</h2>
                                <p className={isDark ? "text-gray-400" : "text-gray-600"}>Architecting narrative, composing voices, setting the scene.</p>
                            </div>
                        ) : episode ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3">
                                {/* Left Panel — Story Cover + Controls */}
                                <div className={`lg:col-span-1 border-b lg:border-b-0 lg:border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'} flex flex-col overflow-hidden`}>
                                    {/* Cover Image */}
                                    {episode.topicImage && (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={episode.topicImage}
                                                alt={episode.title}
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                                            <div className="absolute bottom-3 left-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: netflixRed, color: 'white' }}>
                                                    Now Streaming
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-8 flex-1">
                                        <h2 className="text-2xl font-black mb-3 tracking-tight">{episode.title}</h2>
                                        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{episode.summary}</p>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: netflixRed, color: 'white' }}>
                                                    {isPlaying
                                                        ? <Pause size={20} fill="currentColor" onClick={() => setIsPlaying(false)} />
                                                        : <Play size={20} fill="currentColor" onClick={() => { setIsPlaying(true); }} />
                                                    }
                                                </div>
                                                <span className="font-bold uppercase text-xs tracking-widest">
                                                    {isPlaying ? "Live Narration" : "Story Standby"}
                                                </span>
                                            </div>

                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                                                <motion.div
                                                    animate={{ width: `${((activeSegment + 1) / (episode.segments?.length || 1)) * 100}%` }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: netflixRed }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Scene {activeSegment + 1} of {episode.segments?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel — Script */}
                                <div className="p-10 lg:col-span-2 h-[480px] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-6">
                                        {episode.segments?.map((seg, i) => {
                                            const isActive = activeSegment === i;
                                            const isHost = seg.speaker === 'host';
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => setActiveSegment(i)}
                                                    className={`transition-all duration-300 cursor-pointer ${isActive ? 'opacity-100 scale-[1.01]' : 'opacity-35 hover:opacity-60'}`}
                                                >
                                                    <div className="font-bold text-xs uppercase tracking-widest mb-1" style={{ color: isActive ? netflixRed : (isDark ? '#555' : '#bbb') }}>
                                                        {isHost ? 'Narrator' : 'Expert'}
                                                    </div>
                                                    <p className={`text-xl lg:text-2xl font-medium leading-relaxed ${isActive ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-600' : 'text-gray-300')}`}>
                                                        "{seg.text}"
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BROWSE SECTION */}
            <div className="px-6 md:px-12 space-y-10">

                {/* Search Bar — icon integrated inside */}
                <div className="flex items-center justify-between pt-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight">Browse Episodes</h2>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${searchFocused || searchQuery ? 'w-72 md:w-96' : 'w-48'} ${isDark ? 'border-white/15 bg-zinc-900 focus-within:border-white/30' : 'border-black/10 bg-gray-100 focus-within:border-black/20'}`}
                        style={{ transition: 'width 0.3s ease' }}>
                        <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="bg-transparent outline-none w-full text-sm font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Inline search results */}
                {isSearching && (
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {filteredTopics.length} result{filteredTopics.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredTopics.map((t, idx) => (
                                <EpisodeCard
                                    key={t.id}
                                    topic={t}
                                    idx={idx}
                                    isDark={isDark}
                                    netflixRed={netflixRed}
                                    onPlay={() => { generateStory(t); }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Chapters — collapsed by default, expandable */}
                {!isSearching && (
                    <div className="space-y-6 pb-12">
                        {chapteredTopics.map((chapter) => {
                            const isExpanded = expandedChapter === chapter.id;
                            const ChapterIcon = chapter.icon;
                            return (
                                <motion.div
                                    key={chapter.id}
                                    className={`rounded-xl overflow-hidden border ${isDark ? 'border-zinc-800 bg-[#181818]' : 'border-gray-200 bg-white'}`}
                                    layout
                                >
                                    {/* Chapter Header */}
                                    <button
                                        onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                                        className="w-full text-left"
                                    >
                                        <div className="relative h-24 overflow-hidden">
                                            <img
                                                src={chapter.coverUrl}
                                                alt={chapter.title}
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                            <div className={`absolute inset-0 bg-gradient-to-r ${chapter.gradient}`} />
                                            <div className="absolute inset-0 flex items-center px-6 gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: chapter.color + '33', border: `1px solid ${chapter.color}55` }}>
                                                    <ChapterIcon size={20} style={{ color: chapter.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{chapter.subtitle}</p>
                                                    <h3 className="text-lg font-black text-white tracking-tight leading-tight">{chapter.title}</h3>
                                                    <p className="text-xs text-white/60 mt-0.5 hidden md:block">{chapter.description}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white/80" style={{ backgroundColor: chapter.color + '33', border: `1px solid ${chapter.color}44` }}>
                                                        {chapter.topics.length} episode{chapter.topics.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                        <ChevronDown size={20} className="text-white" />
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Chapter Episodes */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-5">
                                                    <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x">
                                                        {chapter.topics.map((t, idx) => (
                                                            <EpisodeCard
                                                                key={t.id}
                                                                topic={t}
                                                                idx={idx}
                                                                isDark={isDark}
                                                                netflixRed={netflixRed}
                                                                chapterColor={chapter.color}
                                                                coverUrl={chapter.coverUrl}
                                                                onPlay={() => { generateStory(t); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}

                        {/* Uncategorized fallback */}
                        {(() => {
                            const uncategorized = filteredTopics.filter(t => {
                                const chId = getChapterForTopic(t);
                                const ch = chapteredTopics.find(c => c.id === chId);
                                return !ch;
                            });
                            if (uncategorized.length === 0) return null;
                            const isExpanded = expandedChapter === "__other__";
                            return (
                                <motion.div
                                    className={`rounded-xl overflow-hidden border ${isDark ? 'border-zinc-800 bg-[#181818]' : 'border-gray-200 bg-white'}`}
                                    layout
                                >
                                    <button
                                        onClick={() => setExpandedChapter(isExpanded ? null : "__other__")}
                                        className="w-full text-left"
                                    >
                                        <div className={`flex items-center justify-between px-6 py-5 ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <BookOpen size={18} style={{ color: netflixRed }} />
                                                <div>
                                                    <h3 className="font-black text-base">More Episodes</h3>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{uncategorized.length} stories</p>
                                                </div>
                                            </div>
                                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                                <ChevronDown size={18} />
                                            </motion.div>
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-5">
                                                    <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x">
                                                        {uncategorized.map((t, idx) => (
                                                            <EpisodeCard
                                                                key={t.id}
                                                                topic={t}
                                                                idx={idx}
                                                                isDark={isDark}
                                                                netflixRed={netflixRed}
                                                                onPlay={() => { window.speechSynthesis.speak(new SpeechSynthesisUtterance("")); generateStory(t); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })()}
                    </div>
                )}

                {/* Originals Studio */}
                <div className="pt-4 pb-12">
                    <h2 className="text-xl md:text-2xl font-black mb-5">Produce an Original Story</h2>
                    <div className={`p-8 border rounded-xl flex flex-col md:flex-row gap-6 ${isDark ? 'border-zinc-800 bg-[#181818]' : 'border-gray-200 bg-white shadow-sm'}`}>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: netflixRed }}>Story Title</label>
                                <input
                                    type="text"
                                    value={mcTitle}
                                    onChange={e => setMcTitle(e.target.value)}
                                    placeholder="e.g. Volume 1: The Compiler"
                                    className={`w-full p-3 rounded-lg font-medium text-sm outline-none transition-all ${isDark ? 'bg-zinc-800 focus:bg-zinc-700' : 'bg-gray-100 focus:bg-gray-200'}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: netflixRed }}>Central Hypothesis</label>
                                <input
                                    type="text"
                                    value={mcTheme}
                                    onChange={e => setMcTheme(e.target.value)}
                                    placeholder="e.g. How abstraction built the modern world"
                                    className={`w-full p-3 rounded-lg font-medium text-sm outline-none transition-all ${isDark ? 'bg-zinc-800 focus:bg-zinc-700' : 'bg-gray-100 focus:bg-gray-200'}`}
                                />
                            </div>
                        </div>
                        <div className="flex items-end justify-end">
                            <button
                                onClick={generateMasterclass}
                                disabled={generatingMasterclass || !mcTitle || !mcTheme}
                                className="px-10 py-4 font-bold rounded-lg flex items-center justify-center gap-2 uppercase tracking-widest text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                                style={{ backgroundColor: netflixRed }}
                            >
                                {generatingMasterclass ? <Loader2 className="animate-spin" size={20} /> : <Film size={20} />}
                                {generatingMasterclass ? "Producing..." : "Produce Story"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Archived Originals */}
                {masterclassEpisodes.length > 0 && (
                    <div className="pt-2 pb-16">
                        <h2 className="text-xl md:text-2xl font-black mb-5 flex items-center gap-2">
                            <span style={{ color: netflixRed }}>CS</span> Series Archive
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x">
                            {masterclassEpisodes.map(ep => (
                                <div
                                    key={ep.id}
                                    onClick={() => playMasterclass(ep)}
                                    className={`shrink-0 w-72 h-44 rounded-xl relative flex flex-col justify-end p-5 border transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer snap-start shadow-xl
                                    ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="absolute top-3 left-3 flex gap-1 items-center">
                                        <span className="w-1 h-3 rounded-full" style={{ backgroundColor: netflixRed }} />
                                        <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: netflixRed }}>Original Story</span>
                                    </div>
                                    <div className={`text-[10px] font-bold mb-1 opacity-60`}>PART {ep.part_number}</div>
                                    <h3 className="font-bold text-sm lg:text-base leading-tight">{ep.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// Reusable Episode Card
function EpisodeCard({ topic, idx, isDark, netflixRed, chapterColor, coverUrl, onPlay }) {
    const imgUrl = coverUrl || getTopicCoverImage(topic);
    const accentColor = chapterColor || netflixRed;

    return (
        <motion.div
            onClick={onPlay}
            whileHover={{ scale: 1.04, y: -4 }}
            className={`shrink-0 w-52 rounded-lg overflow-hidden cursor-pointer snap-start border
                ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} shadow-md`}
        >
            {/* Cover image */}
            <div className="relative h-28 overflow-hidden">
                <img
                    src={imgUrl}
                    alt={topic.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {/* Episode number */}
                <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: accentColor + 'cc', color: 'white' }}>
                    EP. {String(idx + 1).padStart(2, '0')}
                </span>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: netflixRed }}>
                        <Play size={16} fill="white" color="white" />
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="p-3">
                <h3 className={`font-bold text-xs leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {topic.title}
                </h3>
                <p className="text-[10px] mt-1 font-medium uppercase tracking-wider" style={{ color: accentColor }}>
                    Watch Story
                </p>
            </div>
        </motion.div>
    );
}
