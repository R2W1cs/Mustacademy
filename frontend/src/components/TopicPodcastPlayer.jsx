import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Square, Pause, Play, ChevronRight, BookOpen, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useTheme } from '../auth/ThemeContext';
import { playStreamingTtsQueued, prefetchTts } from '../utils/streamingTts';

// Two distinct podcast voices — must stay different
const ARIA_VOICE = 'en-US-JennyNeural';  // Dr. Aria (host)
const NOVA_VOICE = 'en-US-BrianNeural';  // Dr. Nova (expert)

const voiceForSpeaker = (speaker) =>
    (speaker === 'host' || speaker === 'aria') ? ARIA_VOICE : NOVA_VOICE;

const labelForSpeaker = (speaker) => {
    if (speaker === 'host' || speaker === 'aria') return 'Dr. Aria';
    if (speaker === 'user') return 'You';
    return 'Dr. Nova';
};

const initialForSpeaker = (speaker) => {
    if (speaker === 'host' || speaker === 'aria') return 'A';
    if (speaker === 'user') return 'Y';
    return 'N';
};

export default function InteractivePodcastPlayer({ topic }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // Session phases: 'idle' | 'lesson' | 'qa'
    const [phase, setPhase] = useState('idle');
    const [segments, setSegments] = useState([]); // { speaker: 'host'|'expert', text }
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
    const [activeSpeaker, setActiveSpeaker] = useState(null);
    const [transcript, setTranscript] = useState([]); // { role: 'host'|'expert'|'user'|'nova', text }
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);
    const [error, setError] = useState(null);
    const [phaseOffset, setPhaseOffset] = useState(0);

    const audioRef = useRef(null);
    const recognitionRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const animFrameRef = useRef(null);
    const pausedRef = useRef(false);
    const ttsControlRef = useRef(null);

    useEffect(() => {
        const tick = () => {
            setPhaseOffset((p) => p + (isSpeaking ? 0.04 : 0.01));
            animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isSpeaking]);

    const stopAudio = useCallback(() => {
        pausedRef.current = false;
        setIsPaused(false);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        ttsControlRef.current?.stop?.();
        ttsControlRef.current = null;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            try { audioRef.current.load(); } catch { /* ignore */ }
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current = null;
        }
        setIsSpeaking(false);
        setActiveSpeaker(null);
    }, []);

    // Hard-stop when leaving the podcast tab / page
    useEffect(() => () => { stopAudio(); }, [stopAudio]);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onresult = (e) => {
                setInputValue(e.results[0][0].transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
        return () => stopAudio();
    }, [topic, stopAudio]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, isGenerating]);

    const pauseAudio = useCallback(() => {
        if (!audioRef.current && !ttsControlRef.current) return;
        pausedRef.current = true;
        ttsControlRef.current?.pause?.();
        audioRef.current?.pause();
        setIsSpeaking(false);
        setIsPaused(true);
    }, []);

    const resumeAudio = useCallback(async () => {
        if (!audioRef.current && !ttsControlRef.current) return;
        pausedRef.current = false;
        setIsPaused(false);
        setIsSpeaking(true);
        try {
            if (ttsControlRef.current?.resume) ttsControlRef.current.resume();
            else if (audioRef.current) await audioRef.current.play();
        } catch {
            setIsSpeaking(false);
            setIsPaused(true);
            pausedRef.current = true;
        }
    }, []);

    const playText = useCallback(async (text, speaker, onEnd, next = null) => {
        stopAudio();
        abortControllerRef.current = new AbortController();
        pausedRef.current = false;
        setIsPaused(false);
        setIsSpeaking(true);
        setActiveSpeaker(speaker);

        const voice = voiceForSpeaker(speaker);
        if (next?.text) prefetchTts(next.text, voiceForSpeaker(next.speaker));

        ttsControlRef.current = playStreamingTtsQueued(text, voice, {
            audioRef,
            signal: abortControllerRef.current.signal,
            onEnded: () => {
                if (pausedRef.current) return;
                ttsControlRef.current = null;
                setIsSpeaking(false);
                setActiveSpeaker(null);
                if (onEnd) onEnd();
            },
            onError: () => {
                if (pausedRef.current) return;
                ttsControlRef.current = null;
                setIsSpeaking(false);
                setIsPaused(false);
                setActiveSpeaker(null);
                setError('Voice playback failed. Tap play again, or continue with the transcript.');
            },
        });
    }, [stopAudio]);

    const playSegmentsFrom = useCallback(async (list, startIdx) => {
        if (startIdx >= list.length) {
            setPhase('qa');
            return;
        }
        setCurrentSegmentIdx(startIdx);
        const seg = list[startIdx];
        const role = seg.speaker === 'host' ? 'host' : 'expert';
        setTranscript((prev) => [...prev, { role, text: seg.text }]);
        const next = list[startIdx + 1] || null;
        await playText(seg.text, role, () => playSegmentsFrom(list, startIdx + 1), next);
    }, [playText]);

    const normalizeSegments = (raw) => {
        const list = Array.isArray(raw) ? raw : [];
        return list
            .map((seg, i) => {
                const s = String(seg.speaker || '').toLowerCase();
                let speaker = 'expert';
                if (s === 'host' || s === 'aria' || s.includes('aria') || s === 'leo') speaker = 'host';
                else if (s === 'expert' || s === 'nova' || s.includes('nova') || s === 'aris') speaker = 'expert';
                else speaker = i % 2 === 0 ? 'host' : 'expert';
                return { speaker, text: String(seg.text || '').trim() };
            })
            .filter((seg) => seg.text.length > 0);
    };

    const startSession = async () => {
        setIsLoadingLesson(true);
        setError(null);
        setTranscript([]);
        setSegments([]);
        try {
            // Dual-host conversation (Aria + Nova) — not the solo nova-lesson lecture
            const res = await api.post('/ai/topics/podcast', {
                topicId: topic?.id,
                topicTitle: topic?.title,
            });
            const episode = res.data?.episode || res.data;
            const cleaned = normalizeSegments(episode?.segments);
            if (!cleaned.length) throw new Error('No podcast segments');

            // Guarantee we actually alternate if the model returned one speaker only
            const hosts = cleaned.filter((s) => s.speaker === 'host').length;
            const experts = cleaned.filter((s) => s.speaker === 'expert').length;
            const balanced = (hosts === 0 || experts === 0)
                ? cleaned.map((seg, i) => ({ ...seg, speaker: i % 2 === 0 ? 'host' : 'expert' }))
                : cleaned;

            setEpisodeTitle(episode?.title || topic?.title || 'Podcast');
            setSegments(balanced);
            setPhase('lesson');
            setIsLoadingLesson(false);
            await playSegmentsFrom(balanced, 0);
        } catch (err) {
            console.error('[Podcast] Generation failed:', err);
            setError('Failed to start the Aria × Nova podcast. Please try again.');
            setIsLoadingLesson(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isGenerating || isSpeaking) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        stopAudio();

        const updatedTranscript = [...transcript, { role: 'user', text: userMsg }];
        setTranscript(updatedTranscript);
        setIsGenerating(true);
        setError(null);

        try {
            const history = updatedTranscript.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.role === 'user' ? m.text : `${labelForSpeaker(m.role)}: ${m.text}`,
            }));
            const res = await api.post('/ai/interactive-podcast', {
                topicTitle: topic?.title,
                history,
            });
            const reply = res.data.reply;
            setTranscript((prev) => [...prev, { role: 'nova', text: reply }]);
            setIsGenerating(false);
            await playText(reply, 'expert');
        } catch (err) {
            console.error('[Podcast] Q&A error:', err);
            setError('Failed to get a response. Please try again.');
            setIsGenerating(false);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser.');
            return;
        }
        if (isListening) recognitionRef.current.stop();
        else {
            setInputValue('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const WaveLine = ({ amplitude, frequency, opacity, yOffset = 0, color = 'rgba(99,102,241,1)' }) => {
        const W = 200; const H = 80; const mid = H / 2 + yOffset;
        const pts = 80;
        const activeAmp = isSpeaking ? amplitude : amplitude * 0.15;
        const d = Array.from({ length: pts + 1 }, (_, i) => {
            const x = (i / pts) * W;
            const env = Math.sin((i / pts) * Math.PI);
            const y = mid + activeAmp * env * Math.sin((i / pts) * frequency * Math.PI * 2 + phaseOffset);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');
        return <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" style={{ opacity }} />;
    };

    const lessonProgress = segments.length > 0
        ? Math.min(((currentSegmentIdx + (isSpeaking ? 0 : 1)) / segments.length) * 100, 100)
        : 0;

    const speakingLabel = activeSpeaker === 'host'
        ? 'Dr. Aria is speaking…'
        : activeSpeaker === 'expert' || activeSpeaker === 'nova'
            ? 'Dr. Nova is speaking…'
            : null;

    const waveColor = activeSpeaker === 'host' ? 'rgba(244,63,94,1)' : 'rgba(99,102,241,1)';

    return (
        <div
            className={`mt-8 rounded-2xl overflow-hidden border shadow-xl ${
                isLight ? 'border-gray-200 bg-white' : 'border-slate-800'
            }`}
            style={isLight
                ? { background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)' }
                : { background: 'linear-gradient(145deg, #0c0f1a 0%, #0f1420 50%, #0a0d18 100%)' }}
        >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isLight ? 'border-gray-200' : 'border-slate-800/60'}`}>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                            isLight ? 'bg-rose-50 border-white text-rose-600' : 'bg-rose-500/20 border-slate-900 text-rose-300'
                        }`}>A</div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                            isLight ? 'bg-indigo-50 border-white text-indigo-600' : 'bg-indigo-500/20 border-slate-900 text-indigo-300'
                        }`}>N</div>
                    </div>
                    <div>
                        <p className={`font-semibold text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Dr. Aria × Dr. Nova
                        </p>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                            {episodeTitle || 'Two-host lesson podcast'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {phase !== 'idle' && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            phase === 'lesson'
                                ? (isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30')
                                : (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30')
                        }`}>
                            {phase === 'lesson' ? <BookOpen size={11} /> : <MessageSquare size={11} />}
                            {phase === 'lesson' ? 'DIALOGUE' : 'Q&A'}
                        </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        isLight ? 'bg-slate-50 border-gray-200' : 'bg-slate-800/60 border-slate-700/40'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-pulse' : isGenerating ? 'bg-amber-400 animate-pulse' : isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
                        <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            {isSpeaking ? 'SPEAKING' : isGenerating ? 'THINKING' : isListening ? 'LISTENING' : 'IDLE'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col" style={{ height: '560px' }}>
                {phase === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${
                                isLight ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                            }`}>
                                <span className="text-xl font-light">A</span>
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>×</span>
                            <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${
                                isLight ? 'border-indigo-200 bg-indigo-50 text-indigo-600' : 'border-indigo-400/40 bg-indigo-950/60 text-indigo-200'
                            }`}>
                                <span className="text-xl font-light">N</span>
                            </div>
                        </div>

                        <div className="text-center max-w-sm">
                            <h3 className={`text-xl font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {topic?.title || 'Select a Topic'}
                            </h3>
                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Hear a real conversation: Dr. Aria asks the practical questions, Dr. Nova answers with depth — two different voices.
                            </p>
                        </div>

                        <button
                            onClick={startSession}
                            disabled={isLoadingLesson}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                                isLight ? 'shadow-indigo-200' : 'shadow-indigo-900/50'
                            }`}
                        >
                            {isLoadingLesson ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Writing dialogue…
                                </>
                            ) : (
                                <>
                                    <ChevronRight size={16} />
                                    Start Aria × Nova Podcast
                                </>
                            )}
                        </button>

                        {error && <p className={`text-xs text-center ${isLight ? 'text-red-600' : 'text-red-400'}`}>{error}</p>}
                    </div>
                )}

                {phase !== 'idle' && (
                    <>
                        <div className="flex flex-col items-center pt-5 pb-2 gap-2">
                            <div className="relative w-28 h-20 flex items-center justify-center gap-3">
                                <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                                    activeSpeaker === 'host'
                                        ? (isLight ? 'border-rose-400 bg-rose-50 scale-110 shadow-lg' : 'border-rose-400 bg-rose-950/80 scale-110 shadow-lg')
                                        : (isLight ? 'border-gray-200 bg-slate-50' : 'border-slate-700 bg-slate-900/60')
                                }`}>
                                    <span className={`text-sm font-bold ${activeSpeaker === 'host' ? (isLight ? 'text-rose-600' : 'text-rose-300') : (isLight ? 'text-slate-400' : 'text-slate-500')}`}>A</span>
                                </div>
                                <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                                    activeSpeaker === 'expert' || activeSpeaker === 'nova'
                                        ? (isLight ? 'border-indigo-400 bg-indigo-50 scale-110 shadow-lg' : 'border-indigo-400 bg-indigo-950/80 scale-110 shadow-lg')
                                        : (isLight ? 'border-gray-200 bg-slate-50' : 'border-slate-700 bg-slate-900/60')
                                }`}>
                                    <span className={`text-sm font-bold ${activeSpeaker === 'expert' || activeSpeaker === 'nova' ? (isLight ? 'text-indigo-600' : 'text-indigo-300') : (isLight ? 'text-slate-400' : 'text-slate-500')}`}>N</span>
                                </div>
                            </div>

                            <svg width="200" height="40" viewBox="0 0 200 80" className="-mt-1">
                                <WaveLine amplitude={16} frequency={3.5} opacity={0.9} yOffset={-10} color={waveColor} />
                                <WaveLine amplitude={10} frequency={5} opacity={0.5} yOffset={0} color={waveColor} />
                                <WaveLine amplitude={6} frequency={7} opacity={0.25} yOffset={6} color={waveColor} />
                            </svg>

                            {phase === 'lesson' && segments.length > 0 && (
                                <div className="w-48 mt-1">
                                    <div className={`flex justify-between text-[10px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                                        <span>Dialogue progress</span>
                                        <span>{Math.round(lessonProgress)}%</span>
                                    </div>
                                    <div className={`h-0.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                                        <motion.div
                                            className="h-full bg-indigo-500 rounded-full"
                                            animate={{ width: `${lessonProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {transcript.map((msg, idx) => {
                                    const isUser = msg.role === 'user';
                                    const isAria = msg.role === 'host' || msg.role === 'aria';
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isUser && (
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 mt-0.5 shrink-0 ${
                                                    isAria
                                                        ? (isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-900/60 border-rose-700/40 text-rose-300')
                                                        : (isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-900/60 border-indigo-700/40 text-indigo-400')
                                                }`}>
                                                    <span className="text-[9px] font-bold">{initialForSpeaker(msg.role)}</span>
                                                </div>
                                            )}
                                            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                                                isUser
                                                    ? (isLight
                                                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-br-none'
                                                        : 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/20 rounded-br-none')
                                                    : isAria
                                                        ? (isLight
                                                            ? 'bg-rose-50/80 text-slate-800 border border-rose-100 rounded-bl-none'
                                                            : 'bg-rose-950/30 text-slate-200 border border-rose-900/30 rounded-bl-none')
                                                        : (isLight
                                                            ? 'bg-slate-50 text-slate-800 border border-gray-200 rounded-bl-none'
                                                            : 'bg-slate-800/50 text-slate-200 border border-slate-700/30 rounded-bl-none')
                                            }`}>
                                                {!isUser && (
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                                                        isAria ? (isLight ? 'text-rose-500' : 'text-rose-400') : (isLight ? 'text-indigo-500' : 'text-indigo-400')
                                                    }`}>
                                                        {labelForSpeaker(msg.role)}
                                                    </p>
                                                )}
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {isGenerating && (
                                    <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                        <div className={`rounded-xl rounded-bl-none px-4 py-3 border ${
                                            isLight ? 'bg-slate-50 border-gray-200' : 'bg-slate-800/50 border-slate-700/30'
                                        }`}>
                                            <div className="flex gap-1.5 items-center">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {phase === 'lesson' && !isGenerating && speakingLabel && (
                                    <motion.div key="lecturing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                                        <span className={`text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>{speakingLabel}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>

                        {error && (
                            <div className={`mx-5 mb-2 px-3 py-2 rounded-lg text-xs border ${
                                isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-950/40 border-red-900/40 text-red-400'
                            }`}>
                                {error}
                            </div>
                        )}

                        <div className={`px-5 pb-5 pt-2 border-t ${isLight ? 'border-gray-200' : 'border-slate-800/60'}`}>
                            {phase === 'lesson' && (
                                <p className={`text-xs text-center mb-3 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                                    Dialogue in progress — questions unlock after Aria & Nova finish.
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={phase === 'lesson' ? 'Listening to Aria × Nova…' : 'Ask Dr. Nova anything…'}
                                        disabled={isGenerating || isSpeaking || phase === 'lesson'}
                                        className={`w-full rounded-xl pl-4 pr-12 py-3 text-sm outline-none transition-all
                                            focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                                            disabled:opacity-40 disabled:cursor-not-allowed ${
                                            isLight
                                                ? 'bg-white border border-gray-200 text-slate-900 placeholder-slate-400'
                                                : 'bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-600'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        disabled={isGenerating || isSpeaking || phase === 'lesson'}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                                            isListening
                                                ? 'bg-red-500/20 text-red-400 animate-pulse'
                                                : (isLight
                                                    ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                    : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50')
                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                    >
                                        {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                                    </button>
                                </div>

                                {isSpeaking || isPaused ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={isPaused ? resumeAudio : pauseAudio}
                                            className={`p-3 rounded-xl border transition-all ${
                                                isLight
                                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                                                    : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/30'
                                            }`}
                                            title={isPaused ? 'Resume from where you left off' : 'Pause'}
                                        >
                                            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopAudio}
                                            className={`p-3 rounded-xl border transition-all ${
                                                isLight
                                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    : 'bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30'
                                            }`}
                                            title="Stop"
                                        >
                                            <Square size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isGenerating || phase === 'lesson'}
                                        className={`p-3 rounded-xl transition-all bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-indigo-600 shadow-lg ${
                                            isLight ? 'shadow-indigo-200' : 'shadow-indigo-900/40'
                                        }`}
                                    >
                                        <Send size={16} />
                                    </button>
                                )}
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
