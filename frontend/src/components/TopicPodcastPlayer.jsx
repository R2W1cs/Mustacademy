import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Square, ChevronRight, BookOpen, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useTheme } from '../auth/ThemeContext';

// Dr. Nova voice — locked to server TTS, consistent across all browsers
const NOVA_VOICE = 'en-US-GuyNeural';

async function serverTTS(text, signal) {
    const response = await api.post('/tts', { text, voice: NOVA_VOICE }, { responseType: 'blob', signal });
    if (!response.data || response.data.size < 500) throw new Error('Invalid audio response');
    return URL.createObjectURL(response.data);
}

export default function InteractivePodcastPlayer({ topic }) {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    // Session phases: 'idle' | 'lesson' | 'qa'
    const [phase, setPhase] = useState('idle');
    const [lessonParagraphs, setLessonParagraphs] = useState([]);
    const [currentParagraphIdx, setCurrentParagraphIdx] = useState(0);
    const [transcript, setTranscript] = useState([]); // { role: 'nova'|'user', text: string }
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);
    const [error, setError] = useState(null);
    const [phaseOffset, setPhaseOffset] = useState(0);

    const audioRef = useRef(null);
    const currentBlobUrl = useRef(null);
    const recognitionRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const animFrameRef = useRef(null);

    // Wave animation loop
    useEffect(() => {
        const tick = () => {
            setPhaseOffset(p => p + (isSpeaking ? 0.04 : 0.01));
            animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [isSpeaking]);

    // Setup Speech Recognition
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
    }, [topic]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, isGenerating]);

    const stopAudio = useCallback(() => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current = null;
        }
        if (currentBlobUrl.current) {
            URL.revokeObjectURL(currentBlobUrl.current);
            currentBlobUrl.current = null;
        }
        setIsSpeaking(false);
    }, []);

    const playText = useCallback(async (text, onEnd) => {
        stopAudio();
        abortControllerRef.current = new AbortController();
        setIsSpeaking(true);
        try {
            const blobUrl = await serverTTS(text, abortControllerRef.current.signal);
            currentBlobUrl.current = blobUrl;
            const audio = new Audio(blobUrl);
            audioRef.current = audio;
            audio.onended = () => {
                URL.revokeObjectURL(blobUrl);
                currentBlobUrl.current = null;
                setIsSpeaking(false);
                if (onEnd) onEnd();
            };
            audio.onerror = () => {
                URL.revokeObjectURL(blobUrl);
                currentBlobUrl.current = null;
                setIsSpeaking(false);
                if (onEnd) onEnd();
            };
            await audio.play();
        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                console.error('[Dr. Nova] TTS error:', err);
            }
            setIsSpeaking(false);
        }
    }, [stopAudio]);

    // Play lesson paragraphs sequentially
    const playLessonFrom = useCallback(async (paragraphs, startIdx) => {
        if (startIdx >= paragraphs.length) {
            // Lesson done — move to Q&A
            setPhase('qa');
            return;
        }
        setCurrentParagraphIdx(startIdx);
        const para = paragraphs[startIdx];
        setTranscript(prev => [...prev, { role: 'nova', text: para }]);
        await playText(para, () => playLessonFrom(paragraphs, startIdx + 1));
    }, [playText]);

    const startSession = async () => {
        setIsLoadingLesson(true);
        setError(null);
        setTranscript([]);
        try {
            const res = await api.post('/ai/nova-lesson', { topicTitle: topic?.title });
            const paragraphs = res.data.paragraphs;
            if (!paragraphs || paragraphs.length === 0) throw new Error('No lesson content');
            setLessonParagraphs(paragraphs);
            setPhase('lesson');
            setIsLoadingLesson(false);
            await playLessonFrom(paragraphs, 0);
        } catch (err) {
            console.error('[Dr. Nova] Lesson generation failed:', err);
            setError('Failed to start session. Please try again.');
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
            const history = updatedTranscript.map(m => ({
                role: m.role === 'nova' ? 'assistant' : 'user',
                content: m.text
            }));
            const res = await api.post('/ai/interactive-podcast', {
                topicTitle: topic?.title,
                history
            });
            const reply = res.data.reply;
            setTranscript(prev => [...prev, { role: 'nova', text: reply }]);
            setIsGenerating(false);
            await playText(reply);
        } catch (err) {
            console.error('[Dr. Nova] Q&A error:', err);
            setError('Failed to get a response. Please try again.');
            setIsGenerating(false);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) { alert('Speech recognition not supported in this browser.'); return; }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInputValue('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Orb waveform lines
    const WaveLine = ({ amplitude, frequency, opacity, yOffset = 0 }) => {
        const W = 200, H = 80, mid = H / 2 + yOffset;
        const pts = 80;
        const activeAmp = isSpeaking ? amplitude : amplitude * 0.15;
        const d = Array.from({ length: pts + 1 }, (_, i) => {
            const x = (i / pts) * W;
            const env = Math.sin((i / pts) * Math.PI);
            const y = mid + activeAmp * env * Math.sin((i / pts) * frequency * Math.PI * 2 + phaseOffset);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');
        return <path d={d} fill="none" stroke="rgba(99,102,241,1)" strokeWidth="1.5" strokeLinecap="round" style={{ opacity }} />;
    };

    const lessonProgress = lessonParagraphs.length > 0
        ? Math.min(((currentParagraphIdx + (isSpeaking ? 0 : 1)) / lessonParagraphs.length) * 100, 100)
        : 0;

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
                    <div className="relative flex items-center justify-center w-9 h-9">
                        <div className={`absolute inset-0 rounded-full bg-indigo-500/20 ${isSpeaking ? 'animate-ping' : ''}`} />
                        <div className={`relative w-7 h-7 rounded-full border flex items-center justify-center ${
                            isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-600/30 border-indigo-500/50'
                        }`}>
                            <span className={`text-xs font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>N</span>
                        </div>
                    </div>
                    <div>
                        <p className={`font-semibold text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Dr. Nova</p>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Lesson Podcast</p>
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
                            {phase === 'lesson' ? 'LECTURE' : 'Q&A'}
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

            {/* Main body */}
            <div className="flex flex-col" style={{ height: '560px' }}>

                {/* Idle / Start screen */}
                {phase === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
                        {/* Orb */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full"
                                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
                            <div className="absolute w-24 h-24 rounded-full border border-indigo-500/20 animate-pulse" />
                            <div className="absolute w-32 h-32 rounded-full border border-indigo-500/10" />
                            <div className={`w-16 h-16 rounded-full border flex items-center justify-center shadow-lg ${
                                isLight
                                    ? 'border-indigo-300 bg-indigo-50 shadow-indigo-100'
                                    : 'border-indigo-400/40 bg-indigo-950/60 shadow-indigo-900/50'
                            }`}>
                                <span className={`text-2xl font-light ${isLight ? 'text-indigo-600' : 'text-indigo-200'}`}>N</span>
                            </div>
                        </div>

                        <div className="text-center max-w-sm">
                            <h3 className={`text-xl font-semibold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {topic?.title || 'Select a Topic'}
                            </h3>
                            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Dr. Nova will deliver a private lecture, then stay for your questions.
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
                                    Preparing lecture...
                                </>
                            ) : (
                                <>
                                    <ChevronRight size={16} />
                                    Begin Session
                                </>
                            )}
                        </button>

                        {error && <p className={`text-xs text-center ${isLight ? 'text-red-600' : 'text-red-400'}`}>{error}</p>}
                    </div>
                )}

                {/* Lesson + Q&A active */}
                {phase !== 'idle' && (
                    <>
                        {/* Orb visualizer */}
                        <div className="flex flex-col items-center pt-5 pb-2 gap-2">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                {isSpeaking && (
                                    <>
                                        <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-ping" />
                                        <div className="absolute w-20 h-20 rounded-full border border-indigo-500/30 animate-pulse" />
                                    </>
                                )}
                                <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-500 ${
                                    isSpeaking
                                        ? (isLight ? 'border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-200' : 'border-indigo-400/60 bg-indigo-950/80 shadow-lg shadow-indigo-500/30')
                                        : (isLight ? 'border-gray-200 bg-slate-50' : 'border-slate-700/60 bg-slate-900/60')
                                }`}>
                                    <span className={`text-xl font-light transition-colors ${isSpeaking ? (isLight ? 'text-indigo-600' : 'text-indigo-300') : (isLight ? 'text-slate-400' : 'text-slate-500')}`}>N</span>
                                </div>
                            </div>

                            {/* Waveform */}
                            <svg width="200" height="40" viewBox="0 0 200 80" className="-mt-1">
                                <WaveLine amplitude={16} frequency={3.5} opacity={0.9} yOffset={-10} />
                                <WaveLine amplitude={10} frequency={5} opacity={0.5} yOffset={0} />
                                <WaveLine amplitude={6} frequency={7} opacity={0.25} yOffset={6} />
                            </svg>

                            {/* Lesson progress bar */}
                            {phase === 'lesson' && lessonParagraphs.length > 0 && (
                                <div className="w-48 mt-1">
                                    <div className={`flex justify-between text-[10px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                                        <span>Lecture progress</span>
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

                        {/* Transcript */}
                        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {transcript.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'nova' && (
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 mt-0.5 shrink-0 ${
                                                isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-900/60 border-indigo-700/40'
                                            }`}>
                                                <span className={`text-[9px] font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>N</span>
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? (isLight
                                                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-br-none'
                                                    : 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/20 rounded-br-none')
                                                : (isLight
                                                    ? 'bg-slate-50 text-slate-800 border border-gray-200 rounded-bl-none'
                                                    : 'bg-slate-800/50 text-slate-200 border border-slate-700/30 rounded-bl-none')
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}

                                {isGenerating && (
                                    <motion.div
                                        key="thinking"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 mt-0.5 shrink-0 ${
                                            isLight ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-900/60 border-indigo-700/40'
                                        }`}>
                                            <span className={`text-[9px] font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>N</span>
                                        </div>
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

                                {phase === 'lesson' && !isGenerating && isSpeaking && (
                                    <motion.div
                                        key="lecturing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-center"
                                    >
                                        <span className={`text-xs italic ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>Dr. Nova is speaking...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className={`mx-5 mb-2 px-3 py-2 rounded-lg text-xs border ${
                                isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-950/40 border-red-900/40 text-red-400'
                            }`}>
                                {error}
                            </div>
                        )}

                        {/* Input dock */}
                        <div className={`px-5 pb-5 pt-2 border-t ${isLight ? 'border-gray-200' : 'border-slate-800/60'}`}>
                            {phase === 'lesson' && (
                                <p className={`text-xs text-center mb-3 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                                    Lecture in progress — questions unlock after Dr. Nova finishes.
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={phase === 'lesson' ? 'Listening to lecture...' : 'Ask Dr. Nova anything...'}
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

                                {isSpeaking ? (
                                    <button
                                        type="button"
                                        onClick={stopAudio}
                                        className={`p-3 rounded-xl border transition-all ${
                                            isLight
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                : 'bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30'
                                        }`}
                                    >
                                        <Square size={16} fill="currentColor" />
                                    </button>
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
