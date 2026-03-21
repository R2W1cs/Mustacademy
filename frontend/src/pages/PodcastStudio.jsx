import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Play, Pause, Info, Search, Loader2, Sparkles, Send,
    SkipBack, SkipForward, Film, Volume2, BookOpen, Cpu, Database,
    Network, Code, Binary, Brain, Globe, Shield, GitBranch, ChevronDown, X
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

export default function CsPodcastStudio() {
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

    const audioRef = useRef(null);

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

    // Audio Playback Engine (Upgraded to Neural Backend with Pre-fetching)
    useEffect(() => {
        const stopAudio = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };

        if (!isPlaying || !episode) { stopAudio(); return; }

        const playSegment = async () => {
            const currentIdx = activeSegment;
            const segment = episode.segments[currentIdx];
            if (!segment) return;

            const speaker = segment.speaker; // 'host' or 'expert'
            
            try {
                const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : 'https://mustacademy-backend.onrender.com/api');
                
                // Pre-fetch next segment immediately
                const nextIdx = currentIdx + 1;
                if (nextIdx < episode.segments.length) {
                    const nextSeg = episode.segments[nextIdx];
                    const nextUrl = `${apiBase}/ai/podcast/speech?text=${encodeURIComponent(nextSeg.text)}&speaker=${nextSeg.speaker}`;
                    
                    // Simple pre-fetch: Create a background audio element to start buffering
                    const preFetchAudio = new Audio();
                    preFetchAudio.preload = "auto";
                    preFetchAudio.src = nextUrl;
                    
                    window._podcastAudioCache = window._podcastAudioCache || {};
                    window._podcastAudioCache[nextIdx] = nextUrl;
                }

                // Play current segment
                let url;
                if (window._podcastAudioCache && window._podcastAudioCache[currentIdx]) {
                    url = window._podcastAudioCache[currentIdx];
                } else {
                    url = `${apiBase}/ai/podcast/speech?text=${encodeURIComponent(segment.text)}&speaker=${speaker}`;
                }

                const audio = new Audio(url);
                audioRef.current = audio;

                audio.onended = () => {
                    if (window._podcastAudioCache) delete window._podcastAudioCache[currentIdx];
                    if (activeSegment < episode.segments.length - 1) {
                        setActiveSegment(prev => prev + 1);
                    } else {
                        setIsPlaying(false);
                    }
                };

                audio.onerror = () => {
                    if (activeSegment < episode.segments.length - 1) setActiveSegment(prev => prev + 1);
                    else setIsPlaying(false);
                };

                await audio.play();
            } catch (err) {
                console.error("[Podcast-Audio] Neural Synthesis Failure:", err.message);
                setTimeout(() => {
                    if (activeSegment < episode.segments.length - 1) {
                        setActiveSegment(prev => prev + 1);
                    } else {
                        setIsPlaying(false);
                    }
                }, 500); // Reduced fallback delay
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
            setIsPlaying(true);
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
            setIsPlaying(true);
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
                    <h1 className="text-5xl md:text-8xl font-black mb-3 tracking-tighter drop-shadow-lg leading-none uppercase">
                        Podcast Studio
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
                            Listen to Latest
                        </button>
                        <button
                            onClick={() => setShowAbout(true)}
                            className={`px-7 py-3 rounded flex items-center gap-2 font-bold transition-all text-sm uppercase tracking-wider backdrop-blur-md ${isDark ? 'bg-zinc-800/60 text-white hover:bg-zinc-800' : 'bg-gray-200/80 text-black hover:bg-gray-300'}`}
                        >
                            <Info size={18} />
                            About Studio
                        </button>
                    </div>
                </div>
            </div>

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
                            <div className="grid grid-cols-1 lg:grid-cols-3 relative">
                                <button 
                                    onClick={() => setEpisode(null)}
                                    className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-black/10 transition-all"
                                >
                                    <X size={20} />
                                </button>
                                {/* Left Panel — Cover + Controls */}
                                <div className={`lg:col-span-1 border-b lg:border-b-0 lg:border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'} flex flex-col overflow-hidden`}>
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
                                                Now Playing
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1">
                                        <h2 className="text-2xl font-black mb-3 tracking-tight">{episode.title}</h2>
                                        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Part of the CS Roadmap AI Masterclass Series.</p>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: netflixRed, color: 'white' }}>
                                                    {isPlaying
                                                        ? <Pause size={20} fill="currentColor" onClick={() => setIsPlaying(false)} />
                                                        : <Play size={20} fill="currentColor" onClick={() => setIsPlaying(true)} />
                                                    }
                                                </div>
                                                <span className="font-bold uppercase text-xs tracking-widest">
                                                    {isPlaying ? "Neural Voice Active" : "Paused"}
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
                                                Segment {activeSegment + 1} of {episode.segments?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel — Script */}
                                <div className="p-10 lg:col-span-2 bg-black/5">
                                    <div className="space-y-6">
                                        {episode.segments?.map((seg, i) => {
                                            const isActive = activeSegment === i;
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => setActiveSegment(i)}
                                                    className={`transition-all duration-300 cursor-pointer ${isActive ? 'opacity-100 scale-[1.01]' : 'opacity-35 hover:opacity-60'}`}
                                                >
                                                    <div className="font-bold text-xs uppercase tracking-widest mb-1" style={{ color: isActive ? netflixRed : (isDark ? '#555' : '#bbb') }}>
                                                        {seg.speaker === 'host' ? 'Dr. Aria' : 'Dr. Nova'}
                                                    </div>
                                                    <p className={`text-xl lg:text-2xl font-medium leading-relaxed ${isActive ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-600' : 'text-gray-400')}`}>
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

                <div className="flex items-center justify-between pt-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight">Browse Episodes</h2>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${searchFocused || searchQuery ? 'w-72 md:w-96' : 'w-48'} ${isDark ? 'border-white/15 bg-zinc-900 focus-within:border-white/30' : 'border-black/10 bg-gray-100 focus-within:border-black/20'}`}
                        style={{ transition: 'width 0.3s ease' }}>
                        <Search size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="bg-transparent outline-none w-full text-sm font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>

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

                {!isSearching && (
                    <div className="space-y-6 pb-12">
                        {chapteredTopics.map((chapter) => {
                            const isExpanded = expandedChapter === chapter.id;
                            return (
                                <motion.div key={chapter.id} className={`rounded-xl overflow-hidden border ${isDark ? 'border-zinc-800 bg-[#181818]' : 'border-gray-200 bg-white'}`} layout>
                                    <button onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)} className="w-full text-left">
                                        <div className="relative h-24 overflow-hidden">
                                            <img src={chapter.coverUrl} alt={chapter.title} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-gradient-to-r ${chapter.gradient}`} />
                                            <div className="absolute inset-0 flex items-center px-6 gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: chapter.color + '33', border: `1px solid ${chapter.color}55` }}>
                                                    <chapter.icon size={20} style={{ color: chapter.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{chapter.subtitle}</p>
                                                    <h3 className="text-lg font-black text-white tracking-tight leading-tight">{chapter.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white/80" style={{ backgroundColor: chapter.color + '33', border: `1px solid ${chapter.color}44` }}>
                                                        {chapter.topics.length} episodes
                                                    </span>
                                                    <ChevronDown size={20} className={`text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-5 overflow-hidden">
                                                <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
                                                    {chapter.topics.map((t, idx) => (
                                                        <EpisodeCard key={t.id} topic={t} idx={idx} isDark={isDark} netflixRed={netflixRed} chapterColor={chapter.color} onPlay={() => { generateStory(t); }} />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
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

                {/* Archive List */}
                {masterclassEpisodes.length > 0 && (
                    <div className="pt-2 pb-16">
                        <h2 className="text-xl md:text-2xl font-black mb-5">Archive</h2>
                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x">
                            {masterclassEpisodes.map(ep => (
                                <div
                                    key={ep.id}
                                    onClick={() => playMasterclass(ep)}
                                    className={`shrink-0 w-72 h-44 rounded-xl relative flex flex-col justify-end p-5 border transition-all duration-300 hover:scale-105 cursor-pointer snap-start shadow-xl
                                    ${isDark ? 'bg-zinc-900 border-zinc-800 focus:ring-2 focus:ring-red-600' : 'bg-white border-gray-200'}`}
                                >
                                    <div className="absolute top-3 left-3 flex gap-1 items-center">
                                        <span className="w-1 h-3 rounded-full" style={{ backgroundColor: netflixRed }} />
                                        <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: netflixRed }}>Original Series</span>
                                    </div>
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
            <div className="relative h-28 overflow-hidden">
                <img src={imgUrl} alt={topic.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded" style={{ backgroundColor: accentColor + 'cc', color: 'white' }}>
                    EP. {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: netflixRed }}>
                        <Play size={16} fill="white" color="white" />
                    </div>
                </div>
            </div>
            <div className="p-3">
                <h3 className={`font-bold text-xs leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{topic.title}</h3>
                <p className="text-[10px] mt-1 font-medium uppercase tracking-wider" style={{ color: accentColor }}>Listen Now</p>
            </div>
        </motion.div>
    );
}
