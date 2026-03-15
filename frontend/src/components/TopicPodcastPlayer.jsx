import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, SkipForward, SkipBack,
    Headphones, Radio, Sparkles,
    Loader2, MessageCircle, User, Bot, Send
} from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

const SPEAKERS = {
    host: { name: "Dr. Aria (Sonia)", color: "indigo", label: "AI Host" },
    expert: { name: "Prof. Nova (Brian)", color: "amber", label: "AI Expert" }
};

export default function TopicPodcastPlayer({ topic }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [episode, setEpisode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSegment, setActiveSegment] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [question, setQuestion] = useState("");
    const [questionAnswer, setQuestionAnswer] = useState(null);
    const [askingQuestion, setAskingQuestion] = useState(false);
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        // Voice Auditor removed - Total Neural Lock active.
        console.log("%c[Neural-Engine] Studio Audio Lock v7.0 Active.", "color: #10b981; font-weight: bold;");
    }, []);

    const utteranceRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {

        // Cleanup function for stopping all audio
        const stopAllAudio = () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current = null;
            }
        };

        if (!isPlaying || !episode) {
            stopAllAudio();
            return;
        }

        const segment = episode.segments[activeSegment];
        if (!segment) {
            setIsPlaying(false);
            return;
        }


        const playCloudAudio = async (text, speakerType, retryCount = 0) => {
            try {
                // Fetch Neural TTS from Backend
                const response = await api.post("/ai/podcast/speech",
                    { text, speaker: speakerType },
                    { responseType: 'blob', timeout: 30000 }
                );

                if (!response.data || response.data.size < 500) {
                    throw new Error("Empty audio response");
                }

                console.log(`%c[Neural-Audio] High-fidelity stream active (${speakerType}).`, "color: #10b981; font-weight: bold;");
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

                audio.onerror = (err) => {
                    console.error("[Neural-Audio] Playback interrupted.", err);
                    URL.revokeObjectURL(url);
                    setIsPlaying(false);
                };

                await audio.play();
            } catch (err) {
                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
                console.error(`%c[Neural-Audio] Cloud Fetch Failed: ${errorMsg}`, "color: #ef4444; font-weight: bold;");
                
                if (retryCount < 1) {
                    console.warn("[Neural-Audio] Retrying high-fidelity synthesis...");
                    return playCloudAudio(text, speakerType, retryCount + 1);
                }

                setError("High-fidelity audio service temporarily unreachable. Trying to reconnect...");
                setIsPlaying(false);
            }
        };

        // EXCLUSIVE: We no longer fallback to browser robots. 100% human or silence.
        playCloudAudio(segment.text, segment.speaker);

        return stopAllAudio;
    }, [isPlaying, activeSegment, episode]);

    const generateEpisode = async () => {
        if (!topic) return;
        setLoading(true);
        setError(null);
        setEpisode(null);
        setActiveSegment(0);
        setIsPlaying(false);
        setQuestionAnswer(null);

        try {
            const res = await api.post("/ai/topics/podcast", {
                topicId: topic.id,
                topicTitle: topic.title
            });
            setEpisode(res.data.episode);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate podcast episode.");
        } finally {
            setLoading(false);
        }
    };

    // Make sure we stop speaking when user manually navigates segments
    const handleSegmentClick = (index) => {
        setActiveSegment(index);
    };

    const handleAskQuestion = async () => {
        if (!question.trim() || !topic) return;
        setAskingQuestion(true);
        setQuestionAnswer(null);
        try {
            const res = await api.post("/ai/topics/podcast/question", {
                topicTitle: topic.title,
                question: question.trim()
            });
            setQuestionAnswer(res.data.answer);
        } catch {
            setQuestionAnswer("I couldn't process that question. Please try again.");
        } finally {
            setAskingQuestion(false);
        }
    };

    const cardBg = isDark
        ? "bg-foreground/[0.02] border border-foreground/10 backdrop-blur-xl"
        : "bg-white border-indigo-100 shadow-xl shadow-indigo-500/5";
    const mutedText = isDark ? "text-foreground/50" : "text-slate-500";
    const primaryText = isDark ? "text-white" : "text-slate-900";

    return (
        <section className="max-w-6xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 mt-16 mb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-lg" />
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1">Interactive Studio</h3>
                    <h2 className={`text-3xl font-black ${primaryText} tracking-tight uppercase`}>Topic Podcast</h2>
                </div>
            </div>

            {!episode && !loading && (
                <div className={`rounded-[3rem] p-12 text-center flex flex-col items-center border ${cardBg}`}>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 shadow-lg' : 'bg-indigo-50 border-indigo-200'}`}>
                        <Headphones size={32} className="text-indigo-500" />
                    </div>
                    <h3 className={`text-2xl font-black uppercase tracking-[0.2em] mb-4 ${primaryText}`}>Audio Deep Dive</h3>
                    <p className={`mb-8 max-w-md mx-auto leading-relaxed font-medium ${mutedText}`}>
                        Generate a dual-host podcast episode explaining what {topic.title} is, when to use it, and how to use it. Listen while exploring the topic visualizer.
                    </p>
                    <button
                        onClick={generateEpisode}
                        className={`group relative px-10 py-4 font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden flex items-center gap-3 ${isDark ? 'bg-indigo-500 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'}`}
                    >
                        <Radio size={16} />
                        Generate AI Podcast
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/20 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                    {error && <p className="mt-4 text-xs font-bold text-red-500">{error}</p>}
                </div>
            )}

            {loading && (
                <div className={`rounded-[3rem] p-16 text-center border relative overflow-hidden ${cardBg}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${isDark ? "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" : "bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"} animate-shimmer`} />
                    <Loader2 size={40} className="text-indigo-500 animate-spin mx-auto mb-6" />
                    <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-indigo-400" : "text-indigo-600"} animate-pulse`}>
                        Synthesizing Studio Audio...
                    </p>
                    <p className={`text-xs mt-2 ${mutedText}`}>Analyzing "{topic.title}" mechanics and use cases.</p>
                </div>
            )}

            {episode && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Player Component */}
                    <div className={`lg:col-span-2 rounded-[3rem] border overflow-hidden flex flex-col ${cardBg}`}>
                        <div className={`px-10 py-8 border-b ${isDark ? "border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent" : "border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent"}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isDark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
                                    LIVE
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                                    {topic.title}
                                </span>
                            </div>
                            <h2 className={`text-2xl font-black tracking-tight ${primaryText}`}>
                                {episode.title}
                            </h2>
                            <p className={`mt-2 text-sm ${mutedText}`}>{episode.summary}</p>
                        </div>

                        <div className="px-10 py-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar flex-1">
                            {episode.segments?.map((seg, i) => {
                                const isHost = seg.speaker === "host";
                                const isActive = activeSegment === i;
                                return (
                                    <motion.div
                                        key={i}
                                        onClick={() => handleSegmentClick(i)}
                                        className={`flex gap-4 cursor-pointer transition-all rounded-3xl p-5 -mx-4
                                            ${isActive
                                                ? (isDark ? "bg-white/5 shadow-inner" : "bg-slate-50 shadow-sm border border-slate-100")
                                                : "hover:bg-white/[0.02]"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-sm font-black mt-0.5
                                            ${isHost
                                                ? (isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700")
                                                : (isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700")
                                            }`}
                                        >
                                            {isHost ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[11px] font-black uppercase tracking-widest
                                                    ${isHost
                                                        ? (isDark ? "text-indigo-400" : "text-indigo-600")
                                                        : (isDark ? "text-amber-400" : "text-amber-600")
                                                    }`}
                                                >
                                                    {isHost ? SPEAKERS.host.name : SPEAKERS.expert.name}
                                                </span>
                                                {isActive && isPlaying && (
                                                    <div className="flex gap-1 items-end h-3">
                                                        {[0, 1, 2, 3].map(d => (
                                                            <div key={d} className={`w-0.5 rounded-full ${isHost ? "bg-indigo-500" : "bg-amber-500"} animate-bounce`}
                                                                style={{ height: `${6 + d * 3}px`, animationDelay: `${d * 0.15}s` }} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-sm leading-relaxed ${isActive ? (isDark ? "text-white" : "text-slate-900 font-medium") : mutedText}`}>
                                                {seg.text}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Audio Controls */}
                        <div className={`px-10 py-6 border-t flex items-center gap-6 ${isDark ? "border-white/5 bg-black/20" : "border-slate-100 bg-slate-50/50"}`}>
                            <button
                                onClick={() => handleSegmentClick(Math.max(0, activeSegment - 1))}
                                disabled={activeSegment === 0}
                                className={`p-3 rounded-2xl transition-all disabled:opacity-20 ${isDark ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-200 text-slate-500 bg-white"}`}
                            >
                                <SkipBack size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsPlaying(!isPlaying);
                                }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center font-black transition-all shadow-lg active:scale-95
                                    ${isPlaying
                                        ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30"
                                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                                    } text-white`}
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            </button>
                            <button
                                onClick={() => handleSegmentClick(Math.min(episode.segments.length - 1, activeSegment + 1))}
                                disabled={activeSegment === episode.segments?.length - 1}
                                className={`p-3 rounded-2xl transition-all disabled:opacity-20 ${isDark ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-200 text-slate-500 bg-white"}`}
                            >
                                <SkipForward size={18} />
                            </button>

                            <div className="flex-1 flex items-center gap-4">
                                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                                    <motion.div
                                        animate={{ width: `${((activeSegment + 1) / episode.segments?.length) * 100}%` }}
                                        className="h-full bg-indigo-500 rounded-full"
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                                <span className={`text-[11px] font-black tabular-nums tracking-widest ${mutedText}`}>
                                    {episode?.segments?.length > 0 ? `${activeSegment + 1}/${episode.segments.length}` : "0/0"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ask a Question */}
                    <div className={`lg:col-span-1 rounded-[3rem] border p-8 flex flex-col ${cardBg}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${isDark ? 'bg-amber-500/10 border-amber-500/20 shadow-lg' : 'bg-amber-50 border-amber-200'}`}>
                            <MessageCircle size={20} className="text-amber-500" />
                        </div>
                        <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${primaryText}`}>Ask the Studio</h3>
                        <p className={`text-xs ${mutedText} mb-6 leading-relaxed font-medium`}>
                            Puzzled by a concept? Submit a question and the AI hosts will address it on air.
                        </p>

                        <div className="flex flex-col gap-4 mb-4 flex-1">
                            <textarea
                                rows={4}
                                placeholder={`Ask Dr. Aria about ${topic.title}...`}
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                className={`w-full rounded-2xl p-4 text-sm resize-none outline-none transition-all flex-1
                                    ${isDark
                                        ? "bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/40 focus:bg-white/10"
                                        : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
                                    }`}
                            />
                            <button
                                onClick={handleAskQuestion}
                                disabled={!question.trim() || askingQuestion}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40 shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                {askingQuestion ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Send Question</>}
                            </button>
                        </div>

                        <AnimatePresence>
                            {questionAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-6 rounded-2xl ${isDark ? "bg-indigo-500/5 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200"}`}
                                >
                                    <div className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                                        <Sparkles size={12} />
                                        Studio Response
                                    </div>
                                    <p className={`text-xs leading-relaxed ${isDark ? "text-white/80" : "text-slate-700 font-medium"} whitespace-pre-wrap`}>
                                        {questionAnswer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </section>
    );
}

