import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Play, Pause, Info, Search, Loader2, Sparkles, Send,
    SkipBack, SkipForward, Film, Volume2, BookOpen, Cpu, Database,
    Network, Code, Binary, Brain, Globe, Shield, GitBranch, ChevronDown, X,
    MessageCircle
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
    const [videoFailed, setVideoFailed] = useState(false);

    const [masterclassEpisodes, setMasterclassEpisodes] = useState([]);
    const [mcTitle, setMcTitle] = useState("");
    const [mcTheme, setMcTheme] = useState("");
    const [generatingMasterclass, setGeneratingMasterclass] = useState(false);

    const [isAudioPrimed, setIsAudioPrimed] = useState(false);
    const audioRef = useRef(null);

    // Q&A state
    const [qaMessages, setQaMessages] = useState([]);
    const [qaInput, setQaInput] = useState('');
    const [qaLoading, setQaLoading] = useState(false);
    const qaEndRef = useRef(null);

    // Prime Audio Engine on First Interaction
    useEffect(() => {
        const primeAudio = async () => {
            if (isAudioPrimed) return;
            const silent = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ");
            try {
                await silent.play();
                setIsAudioPrimed(true);
                window.removeEventListener('click', primeAudio);
                window.removeEventListener('keydown', primeAudio);
            } catch (e) {
                console.warn("[Podcast-Studio] Priming awaiting interaction...");
            }
        };
        window.addEventListener('click', primeAudio);
        window.addEventListener('keydown', primeAudio);
        return () => {
            window.removeEventListener('click', primeAudio);
            window.removeEventListener('keydown', primeAudio);
        };
    }, [isAudioPrimed]);

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
        };

        if (!isPlaying || !episode) { stopAudio(); return; }

        const playSegment = async () => {
            if (!episode) return;
            
            // If it's a video episode, we don't handle neural segments. 
            // The video component handles its own playback.
            if (episode.video_url && !videoFailed) {
                return;
            }

            const currentIdx = activeSegment;
            const segments = episode.segments || [];
            const segment = segments[currentIdx];
            if (!segment) return;

            const speaker = segment.speaker; // 'host' or 'expert'
            
            try {
                const apiBase = (import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : 'https://mustacademy-backend.onrender.com/api')).replace('/api', '');
                
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

                const fallbackToServerTTS = async () => {
                    console.warn(`[Podcast-Audio] Neural fallback triggered for ${speaker}. Using server TTS.`);
                    try {
                        const voice = speaker === 'host' ? 'en-US-GuyNeural' : 'en-US-GuyNeural';
                        const resp = await api.post('/tts', { text: segment.text, voice }, { responseType: 'blob' });
                        if (!resp.data || resp.data.size < 500) throw new Error('Empty TTS response');
                        const blobUrl = URL.createObjectURL(resp.data);
                        const fallbackAudio = new Audio(blobUrl);
                        audioRef.current = fallbackAudio;
                        fallbackAudio.onended = () => {
                            URL.revokeObjectURL(blobUrl);
                            if (activeSegment < episode.segments.length - 1) setActiveSegment(prev => prev + 1);
                            else setIsPlaying(false);
                        };
                        fallbackAudio.onerror = () => {
                            URL.revokeObjectURL(blobUrl);
                            if (activeSegment < episode.segments.length - 1) setActiveSegment(prev => prev + 1);
                            else setIsPlaying(false);
                        };
                        await fallbackAudio.play();
                    } catch (ttsErr) {
                        console.error("[Podcast-Audio] Server TTS fallback failed:", ttsErr);
                        if (activeSegment < episode.segments.length - 1) setActiveSegment(prev => prev + 1);
                        else setIsPlaying(false);
                    }
                };

                audio.onended = () => {
                    if (window._podcastAudioCache) delete window._podcastAudioCache[currentIdx];
                    if (activeSegment < episode.segments.length - 1) {
                        setActiveSegment(prev => prev + 1);
                    } else {
                        setIsPlaying(false);
                    }
                };

                audio.onerror = () => {
                    fallbackToServerTTS();
                };

                try {
                    await audio.play();
                } catch (err) {
                    if (err.name === 'AbortError' || err.message.includes('interrupted')) {
                        console.warn("[Podcast-Audio] Playback aborted intentionally.");
                    } else {
                        console.error("[Podcast-Audio] Neural Synthesis Failure:", err.message);
                        fallbackToServerTTS();
                    }
                }
            } catch (generalErr) {
                console.error("[Podcast-Audio] General segment error:", generalErr.message);
            }
        };

        playSegment();

        return stopAudio;
    }, [isPlaying, activeSegment, episode, videoFailed]);

    const generateStory = async (topic) => {
        setLoading(true);
        setError(null);
        setEpisode(null);
        setActiveSegment(0);
        setIsPlaying(false);
        setVideoFailed(false);
        setQaMessages([]);
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

    const askQuestion = async () => {
        if (!qaInput.trim() || qaLoading || !episode) return;
        const q = qaInput.trim();
        setQaInput('');
        const userMsg = { role: 'user', text: q };
        setQaMessages(prev => [...prev, userMsg]);
        setQaLoading(true);
        setTimeout(() => qaEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        try {
            const res = await api.post('/ai/topics/podcast/question', {
                topicTitle: episode.title || episode.topic_title || 'this topic',
                question: q,
                history: [...qaMessages, userMsg]
            });
            setQaMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch {
            setQaMessages(prev => [...prev, { role: 'ai', text: 'Connection interrupted. Please try again.' }]);
        } finally {
            setQaLoading(false);
            setTimeout(() => qaEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
        setVideoFailed(false);
        setQaMessages([]);
        try {
            const res = await api.get(`/ai/masterclass/episode/${ep.id}`);
            setEpisode(res.data);
            setActiveSegment(0);
            setIsPlaying(true);
        } catch { setError("Failed to load archived episode."); }
        finally { setLoading(false); }
    };

    // Load default episode (Chapter 1) once masterclass loads
    useEffect(() => {
        if (masterclassEpisodes.length > 0 && !episode && !loading) {
            setEpisode(masterclassEpisodes[0]);
        }
    }, [masterclassEpisodes]);

    // Filter topics and group into chapters
    const filteredTopics = topics.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chapteredTopics = CS_CHAPTERS.map(chapter => ({
        ...chapter,
        topics: filteredTopics.filter(t => {
            const chId = getChapterForTopic(t);
            // Extra check for Machine Learning in Origins
            if (chId === 'origins' && t.title?.toLowerCase().includes('machine learning')) return false;
            return chId === chapter.id;
        })
    })).filter(ch => ch.topics.length > 0);

    // Filtered result for specialized ML chapter if not caught
    const aiChapter = chapteredTopics.find(c => c.id === 'ai');
    if (aiChapter) {
        const mlTopics = filteredTopics.filter(t => t.title?.toLowerCase().includes('machine learning') && !aiChapter.topics.includes(t));
        aiChapter.topics = [...new Set([...aiChapter.topics, ...mlTopics])];
    }

    // Inline search results when searching
    const isSearching = searchQuery.trim().length > 0;

    const netflixRed = "#E50914";
    const themeBg = isDark ? "bg-[#141414] text-white" : "bg-white text-[#141414]";

    return (
        <div className={`min-h-screen ${themeBg} pb-20 font-sans`}>

            {/* HERO SECTION */}
            <div className="relative w-full h-[65vh] min-h-[500px] flex items-end overflow-hidden">
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
                    {/* VIDEO BACKGROUND PREVIEW (If Chapter 1 exists) */}
                    {masterclassEpisodes[0]?.video_url && (
                        <div className="absolute inset-0 opacity-30 pointer-events-none">
                            <video 
                                src={masterclassEpisodes[0].video_url.startsWith('http') ? masterclassEpisodes[0].video_url : `${(import.meta.env.VITE_API_URL || '').replace('/api', '')}${masterclassEpisodes[0].video_url}`}
                                autoPlay muted loop playsInline
                                className="w-full h-full object-cover grayscale brightness-50"
                            />
                        </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#141414] via-[#141414]/60' : 'from-white via-white/60'} to-transparent`} />
                </div>

                <div className="relative z-10 w-full px-6 md:px-12 pb-14">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} style={{ color: netflixRed }} />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: netflixRed }}>
                            Must Academy Original Series
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black mb-3 tracking-tighter drop-shadow-lg leading-none uppercase max-w-4xl">
                        {masterclassEpisodes[0]?.title || "The Masterclass"}
                    </h1>
                    <p className={`text-base md:text-lg max-w-2xl font-medium mb-8 drop-shadow-md leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {masterclassEpisodes[0]?.summary || "The complete story of computer science — from vacuum tubes to neural networks. A premium AI-narrated cinematic experience."}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => {
                                if (masterclassEpisodes.length > 0) {
                                    playMasterclass(masterclassEpisodes[0]);
                                }
                            }}
                            className="bg-white text-black px-10 py-4 rounded flex items-center gap-2 font-black hover:bg-white/90 transition-all text-sm uppercase tracking-widest"
                        >
                            <Play size={18} fill="currentColor" />
                            Start Series
                        </button>
                        <button
                            onClick={() => setShowAbout(true)}
                            className={`px-8 py-4 rounded flex items-center gap-2 font-black transition-all text-sm uppercase tracking-widest backdrop-blur-md ${isDark ? 'bg-zinc-800/60 text-white hover:bg-zinc-800' : 'bg-gray-200/80 text-black hover:bg-gray-300'}`}
                        >
                            <Info size={18} />
                            Details
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
                        ) : episode ? (() => {
                            const isMasterclass = !!episode.video_url && !videoFailed;
                            const hasSegments = episode.segments && episode.segments.length > 0;
                            const isFullVideo = isMasterclass && !hasSegments;

                            return (
                                <div className={`grid grid-cols-1 ${!isFullVideo ? 'lg:grid-cols-3' : ''} relative`}>
                                <button 
                                    onClick={() => setEpisode(null)}
                                    className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-black/10 transition-all text-white"
                                >
                                    <X size={20} />
                                </button>
                                {/* Left Panel — Cover + Controls */}
                                <div className={`${isFullVideo ? 'lg:col-span-3' : 'lg:col-span-1'} border-b lg:border-b-0 ${!isFullVideo ? 'lg:border-r' : ''} ${isDark ? 'border-zinc-800' : 'border-gray-200'} flex flex-col overflow-hidden`}>
                                    <div className={`relative ${isFullVideo ? 'h-[500px] md:h-[650px]' : 'h-48 lg:h-80'} overflow-hidden bg-black flex items-center justify-center`}>
                                        {episode.video_url && !videoFailed ? (
                                            <video
                                                src={episode.video_url.startsWith('http') ? episode.video_url : `${(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')}${episode.video_url}`}
                                                controls
                                                autoPlay
                                                className="w-full h-full object-contain"
                                                poster={episode.topicImage || episode.thumbnail_url}
                                                onError={(e) => {
                                                    console.warn("[Podcast-Studio] Video source failed:", e.target.src);
                                                    setVideoFailed(true);
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <img
                                                    src={episode.topicImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"}
                                                    alt={episode.title}
                                                    className="w-full h-full object-cover opacity-60"
                                                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl animate-pulse">
                                                        <Volume2 size={32} />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="absolute bottom-3 left-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: netflixRed, color: 'white' }}>
                                                {episode.video_url ? 'Masterclass' : 'Audio Mastery'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1">
                                        <h2 className="text-2xl font-black mb-3 tracking-tight leading-tight uppercase italic">{episode.title}</h2>
                                        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {episode.chapter_number ? `Chapter ${episode.chapter_number} — ` : ""}
                                            {episode.video_url && !videoFailed ? "Video Masterclass Series" : "Part of the CS Roadmap AI Masterclass Series."}
                                        </p>

                                        {(!episode.video_url || videoFailed) && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style={{ backgroundColor: netflixRed, color: 'white' }}>
                                                        {isPlaying
                                                            ? <Pause size={20} fill="currentColor" onClick={() => setIsPlaying(false)} />
                                                            : <Play size={20} fill="currentColor" onClick={() => setIsPlaying(true)} />
                                                        }
                                                    </div>
                                                    <span className="font-bold uppercase text-[10px] tracking-widest">
                                                        {isPlaying ? "Neural Engine Streaming" : "Paused"}
                                                    </span>
                                                </div>

                                                <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                                                    <motion.div
                                                        animate={{ width: `${((activeSegment + 1) / (episode.segments?.length || 1)) * 100}%` }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: netflixRed }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    Synaptic Segment {activeSegment + 1} / {episode.segments?.length || 0}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Panel — Script */}
                                {!isFullVideo && (
                                    <div className="p-10 lg:col-span-2 bg-black/10 overflow-y-auto no-scrollbar h-auto max-h-[80vh]">
                                        {hasSegments ? (
                                            <div className="space-y-8">
                                                {episode.segments.map((seg, i) => {
                                                    const isActive = activeSegment === i;
                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            onClick={() => setActiveSegment(i)}
                                                            className={`transition-all duration-300 cursor-pointer p-4 rounded-2xl ${isActive ? 'bg-white/5 opacity-100' : 'opacity-25 hover:opacity-50'}`}
                                                        >
                                                            <div className="font-black text-[9px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{ color: isActive ? netflixRed : (isDark ? '#555' : '#bbb') }}>
                                                                {seg.speaker === 'host' ? 'Dr. Aria' : 'Dr. Nova'}
                                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                                                            </div>
                                                            <p className={`text-lg lg:text-xl font-medium leading-loose ${isActive ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-600' : 'text-gray-400')}`}>
                                                                "{seg.text}"
                                                            </p>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-40">
                                                <Film size={48} className="mb-4" />
                                                <h4 className="text-xl font-black uppercase italic tracking-tighter">Audio Primary</h4>
                                                <p className="text-sm mt-2">Listen to the neural narration while exploring the syllabus.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })() : null}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Q&A PANEL — appears when episode is active */}
            <AnimatePresence>
                {episode && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className={`mx-6 md:mx-12 mb-10 rounded-xl border overflow-hidden ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'}`}
                    >
                        {/* Header */}
                        <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                            <MessageCircle size={16} style={{ color: netflixRed }} />
                            <span className="font-black text-xs uppercase tracking-[0.3em]">Ask About This Episode</span>
                            <span className={`text-[10px] ml-auto font-medium ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
                                Dr. Nova answers your questions
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
                            {qaMessages.length === 0 && (
                                <p className={`text-sm text-center py-6 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>
                                    Ask anything about <span className="font-bold">{episode.title || 'this episode'}</span> — concepts, code, or deeper context.
                                </p>
                            )}
                            {qaMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'ai' && (
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5 font-black text-[10px]"
                                            style={{ backgroundColor: netflixRed, color: 'white' }}>N</div>
                                    )}
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'text-white rounded-br-sm font-medium'
                                            : `rounded-bl-sm ${isDark ? 'bg-zinc-800 text-zinc-100' : 'bg-white text-gray-800 border border-gray-200'}`
                                    }`} style={msg.role === 'user' ? { backgroundColor: netflixRed } : {}}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {qaLoading && (
                                <div className="flex justify-start">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-3 font-black text-[10px]"
                                        style={{ backgroundColor: netflixRed, color: 'white' }}>N</div>
                                    <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? 'bg-zinc-800' : 'bg-white border border-gray-200'}`}>
                                        <div className="flex gap-1.5 items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={qaEndRef} />
                        </div>

                        {/* Input */}
                        <div className={`flex items-center gap-3 px-4 py-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                            <input
                                type="text"
                                value={qaInput}
                                onChange={e => setQaInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askQuestion()}
                                placeholder="Ask Dr. Nova about this episode..."
                                className={`flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-all ${isDark
                                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-600/50'
                                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-red-400'}`}
                            />
                            <button
                                onClick={askQuestion}
                                disabled={!qaInput.trim() || qaLoading}
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ backgroundColor: netflixRed, color: 'white' }}
                            >
                                {qaLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BROWSE SECTION */}
            <div className="px-6 md:px-12 space-y-16">

                {/* OFFICIAL SERIES LIST — grouped by chapter */}
                {masterclassEpisodes.length > 0 && (() => {
                    // Group episodes by chapter_number
                    const chaptersMap = {};
                    masterclassEpisodes.forEach(ep => {
                        const ch = ep.chapter_number ?? 1;
                        if (!chaptersMap[ch]) chaptersMap[ch] = [];
                        chaptersMap[ch].push(ep);
                    });
                    const chapterNums = Object.keys(chaptersMap).sort((a, b) => Number(a) - Number(b));

                    return (
                        <div className="pt-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                                <h2 className="text-2xl font-black tracking-tight uppercase italic">The Masterclass Series</h2>
                            </div>

                            <div className="space-y-12">
                                {chapterNums.map(chNum => {
                                    const eps = chaptersMap[chNum].sort((a, b) => a.part_number - b.part_number);
                                    return (
                                        <div key={chNum}>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Chapter {chNum}
                                            </p>
                                            <div className="space-y-3">
                                                {eps.map((ep, idx) => (
                                                    <div
                                                        key={ep.id}
                                                        onClick={() => playMasterclass(ep)}
                                                        className={`flex items-center gap-6 p-4 rounded-2xl border cursor-pointer group transition-all
                                                            ${isDark
                                                                ? 'border-white/5 bg-zinc-900/60 hover:bg-zinc-800 hover:border-red-600/30'
                                                                : 'border-gray-100 bg-white hover:border-red-300 hover:shadow-sm'}`}
                                                    >
                                                        {/* Part Number */}
                                                        <span className={`text-3xl font-black w-10 text-center shrink-0 ${isDark ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-gray-200 group-hover:text-gray-400'} transition-colors`}>
                                                            {ep.part_number ?? idx + 1}
                                                        </span>

                                                        {/* Thumbnail */}
                                                        <div className="relative shrink-0 w-28 h-16 rounded-xl overflow-hidden bg-zinc-800">
                                                            <img
                                                                src={ep.thumbnail_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&q=80"}
                                                                alt={ep.title}
                                                                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                                                    <Play size={14} fill="black" className="text-black ml-0.5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-black text-sm uppercase tracking-tight truncate ${isDark ? 'text-white' : 'text-black'}`}>
                                                                {ep.title}
                                                            </h4>
                                                            <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                {ep.summary}
                                                            </p>
                                                        </div>

                                                        {/* Play indicator */}
                                                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Play size={20} className="text-red-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-white/5 pt-16">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase italic">Topic Masterclasses</h2>
                        <p className={`text-xs mt-1 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Generate on-demand deep dives for your entire curriculum.</p>
                    </div>
                    <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all ${searchFocused || searchQuery ? 'w-full md:w-96' : 'w-full md:w-64'} ${isDark ? 'border-white/10 bg-zinc-900 focus-within:border-red-600/50' : 'border-black/5 bg-gray-50'}`}
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
                    <div className="pt-4">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {filteredTopics.length} result{filteredTopics.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                    <div className="space-y-8 pb-20">
                        {chapteredTopics.map((chapter) => {
                            const isExpanded = expandedChapter === chapter.id;
                            return (
                                <motion.div key={chapter.id} className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${isExpanded ? 'ring-2 ring-red-600/20' : ''} ${isDark ? 'border-white/5 bg-[#181818]' : 'border-gray-100 bg-white shadow-sm'}`} layout>
                                    <button onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)} className="w-full text-left">
                                        <div className="relative h-28 overflow-hidden">
                                            <img src={chapter.coverUrl} alt={chapter.title} className="w-full h-full object-cover" />
                                            <div className={`absolute inset-0 bg-gradient-to-r ${chapter.gradient}`} />
                                            <div className="absolute inset-0 flex items-center px-8 gap-6">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                                                    <chapter.icon size={24} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">{chapter.subtitle}</p>
                                                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight uppercase italic">{chapter.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black px-4 py-2 rounded-full text-white/90 bg-white/10 border border-white/10 uppercase tracking-widest">
                                                        {chapter.topics.length} episodes
                                                    </span>
                                                    <div className={`p-2 rounded-full bg-white/10 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <ChevronDown size={20} className="text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-8 overflow-hidden">
                                                <div className="flex gap-6 overflow-x-auto pb-4 pt-4 no-scrollbar snap-x">
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
            
            {/* DETAILS MODAL */}
            <AnimatePresence>
                {showAbout && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto no-scrollbar">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAbout(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className={`relative w-full max-w-4xl overflow-hidden rounded-xl border shadow-2xl flex flex-col ${isDark ? 'bg-[#181818] border-white/10' : 'bg-white border-gray-200'}`}
                        >
                            <button 
                                onClick={() => setShowAbout(false)}
                                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* HERO HEADER */}
                            <div className="relative w-full h-[400px] overflow-hidden shrink-0">
                                <img 
                                    src={masterclassEpisodes[0]?.topicImage || CS_CHAPTERS[0].coverUrl} 
                                    className="w-full h-full object-cover"
                                    alt="Series Hero"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />
                                
                                <div className="absolute bottom-12 left-12 right-12">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles size={16} className="text-red-600" />
                                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/70">Original Series</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-8 text-white">
                                        {masterclassEpisodes[0]?.title || "The Masterclass"}
                                    </h2>
                                    
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => { playMasterclass(masterclassEpisodes[0]); setShowAbout(false); }}
                                            className="bg-white text-black px-10 py-3 rounded font-black flex items-center gap-2 hover:bg-white/90 transition-all text-sm uppercase tracking-widest"
                                        >
                                            <Play size={20} fill="black" /> Play
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white transition-all cursor-pointer">
                                                <Sparkles size={18} />
                                            </div>
                                            <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white transition-all cursor-pointer">
                                                <Info size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CONTENT AREA */}
                            <div className="p-12 space-y-12">
                                {/* Grid Meta + Synopsis */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center gap-3 text-sm font-bold text-green-500">
                                            <span>98% Match</span>
                                            <span className="text-white/50 border border-white/20 px-1.5 py-0.5 text-[10px] rounded">Ultra HD</span>
                                            <span className="text-white/50">2026</span>
                                        </div>
                                        <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Before the silicon chip, before the transistor, there was a dream of universal logic. <strong>The Architect's Legacy</strong> traces the lineage of human thought—from the physical mechanical looms of the industrial revolution to the abstract mathematical breakthroughs that birthed the digital age. Deconstruct the minds of Babbage, Lovelace, and Turing to understand not just how computers work, but why they exist.
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="text-xs">
                                            <span className="text-white/40">Cast: </span>
                                            <span className="text-white/80">Dr. Aria, Dr. Nova</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-white/40">Genres: </span>
                                            <span className="text-white/80">Educational, Cinematic, AI-Narrated</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-white/40">This series is: </span>
                                            <span className="text-white/80">Provocative, Intellectual, Visionary</span>
                                        </div>
                                    </div>
                                </div>

                                {/* EPISODES LIST */}
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black tracking-tight uppercase italic">Episodes</h3>
                                        <span className="text-sm font-bold opacity-50">Chapter 1: The Machine Era</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {masterclassEpisodes.map((ep, i) => (
                                            <div 
                                                key={ep.id}
                                                onClick={() => { playMasterclass(ep); setShowAbout(false); }}
                                                className={`group flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg transition-all border border-transparent hover:border-white/10 ${isDark ? 'hover:bg-[#333]' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className="text-2xl font-black text-white/30 group-hover:text-white transition-colors w-8 shrink-0">
                                                    {i + 1}
                                                </span>
                                                <div className="relative w-full md:w-40 h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                                                    <img src={ep.thumbnail_url || ep.topicImage || CS_CHAPTERS[0].coverUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play size={24} fill="white" className="text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-black uppercase tracking-tight">{ep.title}</h4>
                                                        <span className="text-xs font-bold opacity-50">12m</span>
                                                    </div>
                                                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {ep.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* MORE LIKE THIS / THEMES */}
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase italic mb-8">More Like This</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['Abstraction', 'Logic Substrates', 'Universal Machines'].map(theme => (
                                            <div key={theme} className={`p-6 rounded-lg border transition-all ${isDark ? 'bg-[#2f2f2f] border-white/5 hover:border-white/20' : 'bg-gray-100'}`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest">{theme}</h4>
                                                </div>
                                                <p className="text-[10px] opacity-50 leading-relaxed italic">Deep exploration of the underlying principles of computational reality.</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
