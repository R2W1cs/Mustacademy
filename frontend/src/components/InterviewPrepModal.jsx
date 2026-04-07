import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";
import {
    X, Mic, MicOff, Send, MoreHorizontal, CheckCircle2,
    AlertCircle, Briefcase, ChevronRight, Cpu, Code2,
    CloudIcon, Database, Terminal, UserSquare2, Timer,
    ShieldAlert, Zap, TrendingUp, DollarSign,
    Layers, Brain, Users, Star
} from "lucide-react";

// Static Tailwind color classes — dynamic interpolation stripped by JIT
const MODE_STYLE = {
    indigo: {
        icon: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
        sub:  'text-indigo-400/70',
        bar:  'group-hover:bg-indigo-500/50',
    },
    violet: {
        icon: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
        sub:  'text-violet-400/70',
        bar:  'group-hover:bg-violet-500/50',
    },
    emerald: {
        icon: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        sub:  'text-emerald-400/70',
        bar:  'group-hover:bg-emerald-500/50',
    },
    amber: {
        icon: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        sub:  'text-amber-400/70',
        bar:  'group-hover:bg-amber-500/50',
    },
};

const INTERVIEW_MODES = [
    {
        id: 'STANDARD',
        label: 'Standard Protocol',
        sublabel: 'Full 6-phase evaluation',
        description: 'Complete interview covering intro, experience, technical, high-pressure, behavioral, and closing phases.',
        icon: <Layers size={28} />,
        color: 'indigo',
    },
    {
        id: 'TECHNICAL',
        label: 'Technical Deep-Dive',
        sublabel: 'DSA · Systems · Architecture',
        description: 'Pure technical session. Algorithms, data structures, distributed systems, complexity analysis. No soft-skills.',
        icon: <Cpu size={28} />,
        color: 'violet',
    },
    {
        id: 'BEHAVIORAL',
        label: 'Behavioral Focus',
        sublabel: 'STAR · Leadership · Culture',
        description: 'STAR-method scenarios only. Leadership, conflict, teamwork, and career growth. No technical questions.',
        icon: <Users size={28} />,
        color: 'emerald',
    },
    {
        id: 'SYSTEM_DESIGN',
        label: 'System Design Round',
        sublabel: 'Scale · Architecture · Trade-offs',
        description: 'Design real-world distributed systems at scale. URL shorteners, chat apps, recommendation engines.',
        icon: <Brain size={28} />,
        color: 'amber',
    },
];

// Waveform configuration
const WAVEFORM_BARS = 40;


const ROLES = [
    { id: 1, title: "Junior Frontend Developer", icon: <Code2 size={24} /> },
    { id: 2, title: "Senior Frontend Developer", icon: <Code2 size={24} /> },
    { id: 3, title: "Junior Backend Developer", icon: <Terminal size={24} /> },
    { id: 4, title: "Senior Backend Developer", icon: <Terminal size={24} /> },
    { id: 5, title: "Full-Stack Engineer", icon: <Code2 size={24} /> },
    { id: 6, title: "Senior Software Architect", icon: <UserSquare2 size={24} /> },
    { id: 7, title: "AI / Machine Learning Engineer", icon: <Cpu size={24} /> },
    { id: 8, title: "DevOps / Cloud Engineer", icon: <CloudIcon size={24} /> },
    {
        id: 10,
        title: "Cybersecurity Specialist",
        icon: <ShieldAlert size={24} />,
        branches: [
            { id: 'red', title: "Red Team (Offensive)", icon: <Zap size={20} />, subRoles: ["Junior Pentester", "Senior Ethical Hacker", "Exploit Developer", "Red Team Lead"] },
            { id: 'blue', title: "Blue Team (Defensive)", icon: <ShieldAlert size={20} />, subRoles: ["SOC Analyst L1", "Senior Threat Hunter", "Incident Responder", "Security Architect"] }
        ]
    },
    { id: 9, title: "Custom Role", icon: <Briefcase size={24} /> }
];

const PHASES = ['INTRO', 'EXPERIENCE', 'TECHNICAL', 'HIGH_PRESSURE', 'BEHAVIORAL', 'CLOSING'];

// Cinematic opening animation variants — cycles randomly each session
const OPENING_VARIANTS = [
    {
        name: 'iris-bloom',
        initial: { opacity: 0, scale: 0.85, filter: 'blur(20px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 1.05, filter: 'blur(20px)' },
        transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
    {
        name: 'command-slide',
        initial: { opacity: 0, x: '100%' },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: '100%' },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
    {
        name: 'neural-fade',
        initial: { opacity: 0, y: 40, filter: 'blur(8px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -40, filter: 'blur(8px)' },
        transition: { duration: 0.6, ease: 'easeOut' },
    },
];

export default function InterviewPrepModal({ onClose, isPage = false }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [currentSidebarWidth, setCurrentSidebarWidth] = useState(() => {
        const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        return collapsed ? 80 : 256;
    });

    useEffect(() => {
        const handleToggle = (e) => {
            setCurrentSidebarWidth(e.detail.isCollapsed ? 80 : 256);
        };
        window.addEventListener('sidebarToggle', handleToggle);
        
        // v17.0 Audio Purity: Ensure total silence on unmount
        return () => {
            window.removeEventListener('sidebarToggle', handleToggle);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (textIntervalRef.current) {
                cancelAnimationFrame(textIntervalRef.current);
                textIntervalRef.current = null;
            }
        };
    }, []);

    // Pick a random opening variant once per mount
    const openingVariant = useRef(OPENING_VARIANTS[Math.floor(Math.random() * OPENING_VARIANTS.length)]).current;

    const [step, setStep] = useState('mode'); // 'mode' | 'role'
    const [selectedMode, setSelectedMode] = useState(null);
    const [interviewHistory, setInterviewHistory] = useState([]);
    const [isStarted, setIsStarted] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [customRole, setCustomRole] = useState("");
    const [phase, setPhase] = useState('INTRO');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    // Regenerated on every new interview start — prevents duplicate key violation
    const conversationIdRef = useRef(null);
    const getConversationId = () => {
        if (!conversationIdRef.current) {
            conversationIdRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = Math.random() * 16 | 0;
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
        }
        return conversationIdRef.current;
    };
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [scorecard, setScorecard] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedSubRole, setSelectedSubRole] = useState(null);
    const [revealedLength, setRevealedLength] = useState(0);
    const [audioData, setAudioData] = useState(new Array(WAVEFORM_BARS).fill(0));
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [micError, setMicError] = useState(null);

    // 3D Parallax Hooks
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
    const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
    const depthX = useTransform(mouseX, [-300, 300], [20, -20]);
    const depthY = useTransform(mouseY, [-300, 300], [20, -20]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    const [liveReaction, setLiveReaction] = useState("");
    const [attitude, setAttitude] = useState("Neutral");
    const [timeLeft, setTimeLeft] = useState(null);

    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);
    const timerRef = useRef(null);
    const inputRef = useRef("");
    const micRetryCountRef = useRef(0);
    const micErrorTimerRef = useRef(null);
    const speechSynthesisRef = useRef(window.speechSynthesis);

    const [phase_offset, setPhaseOffset] = useState(0);
    const [voiceIntensity, setVoiceIntensity] = useState(0);

    // v18.0 Absolute Close Protocol
    const handleClose = () => {
        // 1. Kill Audio Hardware
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = ""; // Clear buffer
            audioRef.current = null;
        }
        // 2. Kill Text Intervals
        if (textIntervalRef.current) {
            cancelAnimationFrame(textIntervalRef.current);
            textIntervalRef.current = null;
        }
        // 3. Kill Recognition
        if (recognitionRef.current) {
            try { 
                recognitionRef.current.onend = null;
                recognitionRef.current.stop(); 
            } catch (e) { }
        }
        // 4. Force Synthesis Silence
        if (speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel();
        }
        // 5. Reset State
        setIsSpeaking(false);
        setIsListening(false);
        if (onClose) onClose();
    };

    useEffect(() => {
        let frame;
        const animate = () => {
            setPhaseOffset(p => p + (isSpeaking ? 0.03 : isListening ? 0.02 : 0.01)); // Slower cinematic waves
            // Slow decay for voice intensity when not speaking
            if (!isSpeaking) setVoiceIntensity(prev => Math.max(0, prev - 0.1));
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [isSpeaking, isListening]);

    // Premium Voice Engine Loading (Male Voice Only for Boardroom)
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                // Filter out obviously female voices to enforce "man only"
                const maleVoices = availableVoices.filter(v => {
                    const name = v.name.toLowerCase();
                    const isEnglish = v.lang.includes("en-US") || v.lang.includes("en-GB");
                    const isFemale = name.includes("female") || name.includes("zira") || name.includes("aria") || name.includes("jenny") || name.includes("susan") || name.includes("stephanie");
                    return isEnglish && !isFemale;
                });

                // Top Tier Premium Male Voices
                const premiumMales = maleVoices.filter(v => v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online"));
                const topTierMaleNames = ["Christopher", "Eric", "Guy", "Andrew", "Brian", "Steffan", "Roger"];
                
                let premium = null;
                for (const name of topTierMaleNames) {
                    premium = premiumMales.find(v => v.name.includes(name));
                    if (premium) break;
                }

                // Priority: Microsoft Natural Male -> Google Male -> First available Male
                if (!premium) premium = premiumMales[0];
                if (!premium) premium = maleVoices.find(v => v.name.includes("Google") && v.name.toLowerCase().includes("male"));
                if (!premium) premium = maleVoices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark"));
                if (!premium) premium = maleVoices[0];
                if (!premium) premium = availableVoices.find(v => v.lang.includes("en-US")); // ultimate fallback

                setSelectedVoice(premium);
                console.log(`%c[Voice-Engine] Premium Male Profile Loaded: ${premium?.name}`, "color: #10b981; font-weight: bold;");
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        
        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);


    const WaveCore = ({ amplitude, frequency, opacity, color, strokeWidth = 1.5 }) => {
        const W = 800, H = 200, mid = H / 2;
        const points = 120;

        // Use voice intensity to scale amplitude realistically
        const activeAmplitude = isSpeaking ? (amplitude * (0.4 + voiceIntensity * 0.6)) : (amplitude * 0.2);

        const d = Array.from({ length: points + 1 }, (_, i) => {
            const x = (i / points) * W;
            // Center the wave energy more
            const normalizedX = (i / points);
            const envelope = Math.sin(normalizedX * Math.PI); // Smooth edges

            const noise = isSpeaking ? (Math.random() - 0.5) * activeAmplitude * 0.15 : 0;
            const y = mid + (activeAmplitude * envelope + noise) * Math.sin((i / points) * frequency * Math.PI * 2 + phase_offset);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        }).join(' ');
        return (
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity }}
            />
        );
    };


    // State Refs to prevent race conditions during timer callbacks
    const isListeningRef = useRef(isListening);
    const isSpeakingRef = useRef(isSpeaking);
    const loadingRef = useRef(loading);

    useEffect(() => {
        isListeningRef.current = isListening;
        isSpeakingRef.current = isSpeaking;
        loadingRef.current = loading;
        inputRef.current = input;
    }, [isListening, isSpeaking, loading, input]);

    // Body scroll locking for Simulation - Apply on mount and cleanup on unmount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        // [Nuclear Firewall] Native Web Speech API blocked. Neural backend only.

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (e) => {
                let currentTranscript = "";
                for (let i = 0; i < e.results.length; i++) {
                    currentTranscript += e.results[i][0].transcript;
                }

                if (currentTranscript.trim()) {
                    console.log("[Mic] Input:", currentTranscript);
                    setInput(currentTranscript);

                    if (timerRef.current) clearTimeout(timerRef.current);
                    timerRef.current = setTimeout(() => {
                        // Only auto-send if we actually have text and aren't already processing
                        if (currentTranscript.trim() && !loadingRef.current && !isSpeakingRef.current) {
                            handleSendMessage(currentTranscript);
                        }
                    }, 3000);
                }
            };

            recognitionRef.current.onstart = () => {
                micRetryCountRef.current = 0; // successful start — reset retry counter
                console.log("[Mic] Session Started");
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                console.log("[Mic] Session Ended");
                // Only restart if we intended to be listening and aren't inhibited by speaking/loading
                // We check the refs which are now updated immediately
                if (isListeningRef.current && !isSpeakingRef.current && !loadingRef.current) {
                    try { recognitionRef.current.start(); } catch (e) { }
                } else {
                    setIsListening(false);
                    isListeningRef.current = false;
                }
            };

            recognitionRef.current.onerror = (e) => {
                if (e.error === 'no-speech') return; // silence timeout — ignore, onend will handle restart

                console.error("[Mic] Engine Error:", e.error);
                setIsListening(false);
                isListeningRef.current = false;

                if (e.error === 'network') {
                    const MAX_RETRIES = 3;
                    if (micRetryCountRef.current < MAX_RETRIES) {
                        micRetryCountRef.current += 1;
                        console.warn(`[Mic] Network error — retrying (${micRetryCountRef.current}/${MAX_RETRIES}) in 2s...`);
                        setTimeout(() => {
                            if (!isSpeakingRef.current && !loadingRef.current && recognitionRef.current) {
                                try {
                                    recognitionRef.current.start();
                                    isListeningRef.current = true;
                                    setIsListening(true);
                                    setMicError(null);
                                } catch (_) {}
                            }
                        }, 2000);
                        return; // don't show error banner while retrying
                    }
                    // All retries exhausted
                    micRetryCountRef.current = 0;
                    setMicError('Mic offline — type your answer');
                } else {
                    setMicError(e.error);
                }

                // Auto-dismiss error banner after 4s
                if (micErrorTimerRef.current) clearTimeout(micErrorTimerRef.current);
                micErrorTimerRef.current = setTimeout(() => setMicError(null), 4000);
            };
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (timerRef.current) clearTimeout(timerRef.current);
            if (micErrorTimerRef.current) clearTimeout(micErrorTimerRef.current);
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isSpeaking) {
            interval = setInterval(() => {
                setAudioData(prev => prev.map(() => Math.random() * 100));
            }, 80);
        } else if (isListening) {
            interval = setInterval(() => {
                setAudioData(prev => prev.map(() => 5 + Math.random() * 10));
            }, 200);
        } else {
            setAudioData(new Array(WAVEFORM_BARS).fill(2));
        }
        return () => clearInterval(interval);
    }, [isSpeaking, isListening]);


    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading, revealedLength]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const countdown = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [timeLeft]);

    useEffect(() => {
        api.get('/ai/interview/history')
            .then(res => setInterviewHistory(res.data.sessions || []))
            .catch(() => {});
    }, []);

    const startInterview = async (roleTitle) => {
        let job = roleTitle;
        if (roleTitle === "Custom Role") job = customRole;
        if (selectedBranch && selectedSubRole) job = `${selectedSubRole} (${selectedBranch.title})`;

        if (!job || !String(job).trim()) return;

        // Fresh UUID on every start — prevents duplicate key violation on retry
        conversationIdRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });

        setIsStarted(true);
        setLoading(true);
        loadingRef.current = true;
        try {
            const res = await api.post("/ai/interview/start", {
                targetJob: job,
                conversationId: conversationIdRef.current,
                mode: selectedMode || 'STANDARD'
            });
            const reply = res.data.reply || "Connection established. Marcus Stering here. Ready when you are.";
            setMessages([{ sender: 'ai', text: String(reply) }]);
            setLoading(false);
            loadingRef.current = false;
            speak(String(reply));
        } catch (err) {
            console.error("Start Error:", err);
            const errorMsg = err.response?.data?.message || err.message;
            setMessages([{
                sender: 'ai',
                text: `Swain Protocol initialization failed. [REASON: ${errorMsg}]. Signal lost. Please verify Groq API connectivity.`
            }]);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    const handleSendMessage = async (text) => {
        const textToSend = typeof text === 'string' ? text : input;
        if (!textToSend || !String(textToSend).trim() || loading || scorecard) return;

        setMessages(prev => [...prev, { sender: 'user', text: String(textToSend) }]);
        setInput("");
        setLoading(true);
        loadingRef.current = true;
        setTimeLeft(null);
        if (timerRef.current) clearTimeout(timerRef.current);

        try {
            // Proceed with neural backend audio

            const res = await api.post("/ai/interview/chat", {
                message: textToSend,
                conversationId: conversationIdRef.current,
                currentPhase: phase,
                targetJob: selectedRole?.id === 9 ? customRole : selectedRole?.title
            });

            const reply = res.data.reply || "I encountered a processing error. Could you repeat that?";
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: String(reply),
                questions: res.data.suggested_questions,
                analytics: res.data.internal_analytics
            }]);

            setPhase(res.data.phase);
            setAnalytics(res.data.internal_analytics);

            if (res.data.live_reaction) {
                setLiveReaction(String(res.data.live_reaction));
                setTimeout(() => setLiveReaction(""), 4000);
            }
            if (res.data.attitude) setAttitude(String(res.data.attitude));
            if (res.data.is_timed || res.data.phase === 'HIGH_PRESSURE') setTimeLeft(60);
            if (res.data.scorecard) setScorecard(res.data.scorecard);

            speak(String(reply));
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { sender: 'ai', text: "Interruption detected. Please restate." }]);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    const parseProsody = (text) => {
        if (!text || typeof text !== 'string') return { cleanText: "", speed: 1.0 };
        let cleanText = text;

        // Clean voice markers for visual display but extract speed
        const speedMatch = cleanText.match(/\[SPEED:([\d.]+)\]/);
        const speed = speedMatch ? parseFloat(speedMatch[1]) : 1.0;

        const finalClean = cleanText.replace(/\[PAUSE\]/g, "").replace(/\[SPEED:[\d.]+\]/g, "");

        return { cleanText: finalClean, speed };
    };


    const audioRef = useRef(null);
    const textIntervalRef = useRef(null);

    const speak = async (text) => {
        if (!text || typeof text !== 'string') return;
        // Stop any existing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        // Stop any native speech synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const { cleanText } = parseProsody(text);
        if (!cleanText) return;

        try {
            // Stop recognition if it's active
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }

            // Clear any lingering intervals
            if (textIntervalRef.current) {
                cancelAnimationFrame(textIntervalRef.current);
                textIntervalRef.current = null;
            }

            // Neural cloud TTS only — consistent voice across all browsers
            executeCloudTTS(cleanText);

        } catch (err) {
            console.error("[Speak] Global Error:", err);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
    };

    const handleSpeechEnd = (fullText) => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setRevealedLength(fullText.length);
        if (!scorecard && !loadingRef.current) {
            setTimeout(() => {
                if (recognitionRef.current && !isListeningRef.current && !isSpeakingRef.current && !loadingRef.current) {
                    try { recognitionRef.current.start(); } catch (e) { }
                }
            }, 800);
        }
    };

    const executeCloudTTS = async (cleanText) => {
        try {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            setRevealedLength(0);
            console.log("%c[Neural-Audio] Marcus Sterling high-fidelity stream active.", "color: #3b82f6; font-weight: bold;");
            // Fetch Neural TTS from Backend
            const response = await api.post("/tts", 
                { text: cleanText, voice: "en-US-BrianNeural" },
                { responseType: 'blob' }
            );

            if (!response.data || response.data.size < 500) {
                throw new Error("Empty audio response from cloud");
            }

            const url = URL.createObjectURL(response.data);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onplay = () => syncAudioWithText(audio, cleanText);

            audio.onended = () => {
                handleSpeechEnd(cleanText);
                URL.revokeObjectURL(url);
            };

            audio.onerror = () => {
                console.error("[Neural-Audio] Playback failure.");
                setIsSpeaking(false);
                isSpeakingRef.current = false;
                URL.revokeObjectURL(url);
            };

            await audio.play();
        } catch (err) {
            console.error(`%c[Neural-Audio] Marcus Synthesis Failure: ${err.message}`, "color: #ef4444; font-weight: bold;");
            setIsSpeaking(false);
            isSpeakingRef.current = false;
        }
    };

    const syncAudioWithText = (audio, text) => {
        const words = text.split(' ').filter(w => w.trim().length > 0);
        const sync = () => {
            if (!audio || !audio.duration || audio.paused || audio.ended) return;
            const progress = audio.currentTime / audio.duration;
            const charTarget = Math.floor(progress * text.length);
            
            let currentLen = 0;
            let lastWordBoundary = 0;
            for (const word of words) {
                if (!word) continue;
                if (currentLen + word.length <= charTarget + 1) {
                    currentLen += word.length + 1;
                    lastWordBoundary = currentLen;
                } else break;
            }
            setRevealedLength(Math.min(lastWordBoundary, text.length));
            setVoiceIntensity(0.6 + Math.random() * 0.4);
            textIntervalRef.current = requestAnimationFrame(sync);
        };
        textIntervalRef.current = requestAnimationFrame(sync);
    };


    const getAttitudeColor = (att) => {
        switch (att) {
            case 'Aggressive': return 'text-red-500';
            case 'Skeptical': return 'text-amber-500';
            case 'Warm': return 'text-green-500';
            default: return 'text-indigo-500';
        }
    };

    const getPhaseProgress = () => ((PHASES.indexOf(phase) + 1) / PHASES.length) * 100;

    const toggleListening = () => {
        setMicError(null);
        if (isListening) {
            setIsListening(false);
            isListeningRef.current = false;
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
        } else {
            if (recognitionRef.current && !isSpeaking) {
                setIsListening(true);
                isListeningRef.current = true;
                try { recognitionRef.current.start(); } catch (e) { }
            }
        }
    };

    return (
        <div onMouseMove={handleMouseMove}>
            <AnimatePresence mode="wait">
                {!isStarted ? (
                    <motion.div
                        key="start"
                        initial={openingVariant.initial}
                        animate={openingVariant.animate}
                        exit={openingVariant.exit}
                        transition={openingVariant.transition}
                        style={{ left: currentSidebarWidth, width: `calc(100% - ${currentSidebarWidth}px)`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        className={`fixed top-0 right-0 bottom-0 z-[40] p-12 overflow-y-auto no-scrollbar flex flex-col items-center justify-center ${isDark ? 'bg-[#05070a]' : 'bg-white'}`}
                    >
                        <div className="absolute top-0 right-0 p-6">
                            <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="text-center mb-12">
                            <h2 className={`text-5xl font-black mb-2 tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'} uppercase`}>The Boardroom</h2>
                            <p className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>High-Fidelity Interview Simulation</p>
                            <div className="flex justify-center mb-8">
                                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-slate-900/50 shadow-2xl relative overflow-hidden">
                                    <Cpu className="text-indigo-500 animate-pulse" size={48} />
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-xl" />
                                </div>
                            </div>
                        </div>

                        {/* ── STEP 1: Mode Selector ── */}
                        {step === 'mode' ? (
                            <>
                                <p className={`text-[10px] font-black uppercase tracking-[0.5em] mb-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Select Interview Format</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 w-full max-w-3xl">
                                    {INTERVIEW_MODES.map((mode) => {
                                        const s = MODE_STYLE[mode.color] || MODE_STYLE.indigo;
                                        return (
                                            <motion.button
                                                key={mode.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { setSelectedMode(mode.id); setStep('role'); }}
                                                className={`p-7 rounded-2xl border text-left group relative overflow-hidden transition-all ${isDark
                                                    ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/70'
                                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${s.icon}`}>
                                                    {mode.icon}
                                                </div>
                                                <div className={`text-[8px] font-black uppercase tracking-[0.5em] mb-2 ${s.sub}`}>{mode.sublabel}</div>
                                                <h4 className={`text-base font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{mode.label}</h4>
                                                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{mode.description}</p>
                                                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-transparent ${s.bar} transition-all duration-300`} />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Past Sessions */}
                                {interviewHistory.filter(s => s.is_completed && s.scorecard).length > 0 && (
                                    <div className="w-full max-w-3xl mb-6">
                                        <div className={`text-[9px] font-black uppercase tracking-[0.5em] mb-4 flex items-center gap-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            <Star size={10} /> Past Sessions
                                        </div>
                                        <div className="space-y-2">
                                            {interviewHistory.filter(s => s.is_completed && s.scorecard).slice(0, 4).map((session) => {
                                                const sc = typeof session.scorecard === 'string' ? JSON.parse(session.scorecard) : session.scorecard;
                                                const score = sc?.technical_score ?? '—';
                                                const verdict = sc?.verdict || '—';
                                                const modeLabel = INTERVIEW_MODES.find(m => m.id === (session.mode || 'STANDARD'))?.label || 'Standard';
                                                const date = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                const verdictColor = verdict === 'Hire' ? 'text-emerald-400' : 'text-red-400';
                                                const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
                                                return (
                                                    <div key={session.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`text-xl font-black tabular-nums ${scoreColor}`}>{score}</div>
                                                            <div>
                                                                <div className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.target_job}</div>
                                                                <div className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{modeLabel} · {date}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`text-[10px] font-black uppercase tracking-wider ${verdictColor}`}>{verdict}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── STEP 2: Role Selector ── */
                            <>
                                <div className="flex items-center gap-4 mb-8 w-full max-w-3xl">
                                    <button
                                        onClick={() => { setStep('mode'); setSelectedRole(null); setSelectedBranch(null); setSelectedSubRole(null); }}
                                        className={`text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 transition-colors ${isDark ? 'text-slate-600 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-500'}`}
                                    >
                                        ← Change Mode
                                    </button>
                                    {selectedMode && (
                                        <div className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.4em] ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                                            {INTERVIEW_MODES.find(m => m.id === selectedMode)?.label}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                    {!selectedRole ? (
                                        ROLES.map((role) => (
                                            <button
                                                key={role.id}
                                                onClick={() => setSelectedRole(role)}
                                                className={`p-6 rounded-2xl border transition-all text-left group relative backdrop-blur-md overflow-hidden ${isDark
                                                    ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 shadow-lg'
                                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-indigo-50'}`}
                                            >
                                                <div className="flex flex-col h-full justify-between">
                                                    <div className="mb-4">
                                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                            {role.branches ? 'Strategic Division' : 'Standard Protocol'}
                                                        </div>
                                                        <h4 className={`text-base font-bold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{role.title}</h4>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/20">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>View Dossier</span>
                                                        <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-indigo-500' : 'text-indigo-400'}`} />
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 group-hover:from-indigo-500/[0.03] transition-colors pointer-events-none" />
                                            </button>
                                        ))
                                    ) : selectedRole.branches && !selectedBranch ? (
                                        <div className="col-span-full space-y-8 py-10">
                                            <button onClick={() => setSelectedRole(null)} className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 mb-4 flex items-center gap-2 tracking-[0.3em]">← RE-INITIALIZE ROLES</button>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-10 text-center">Division Selection</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                                {selectedRole.branches.map(branch => (
                                                    <button key={branch.id} onClick={() => setSelectedBranch(branch)} className={`p-8 rounded-2xl border transition-all text-left flex flex-col justify-between group backdrop-blur-md ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                                        <div className="mb-8">
                                                            <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>DIVISION</div>
                                                            <div className={`text-xl font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>{branch.title}</div>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/10">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Initialize Protocol</span>
                                                            <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-indigo-500' : 'text-indigo-400'}`} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : selectedBranch && !selectedSubRole ? (
                                        <div className="col-span-full space-y-8 py-10">
                                            <button onClick={() => setSelectedBranch(null)} className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 mb-4 flex items-center gap-2 tracking-[0.3em]">← RETURN TO DIVISIONS</button>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.3em] mb-10 text-center">Neural Profile Selection</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {selectedBranch.subRoles.map(sub => (
                                                    <button key={sub} onClick={() => setSelectedSubRole(sub)} className={`p-6 rounded-2xl border transition-all text-center relative group overflow-hidden ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                                        <div className={`text-[11px] font-black uppercase tracking-[0.25em] relative z-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub}</div>
                                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500/0 group-hover:bg-indigo-500/50 transition-all duration-300" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="col-span-full py-16 px-10 rounded-[4rem] bg-indigo-600/5 border border-indigo-500/20 text-center backdrop-blur-xl">
                                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-8">
                                                <CheckCircle2 className="text-indigo-400" size={32} />
                                            </div>
                                            <h3 className="text-3xl font-black text-white uppercase tracking-[0.4em] mb-4">PROFILE LOCKED</h3>
                                            <p className="text-sm font-bold text-indigo-400 uppercase tracking-[0.3em] mb-10">{selectedSubRole || selectedRole.title}</p>
                                            <button onClick={() => { setSelectedRole(null); setSelectedBranch(null); setSelectedSubRole(null); }} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 underline tracking-[0.3em] transition-all">ABORT & RE-CALIBRATE</button>
                                        </div>
                                    )}
                                </div>
                                {selectedRole?.id === 9 && (
                                    <input type="text" value={customRole} onChange={(e) => setCustomRole(String(e.target.value))} placeholder="Define your custom trajectory..." className={`w-full mb-8 max-w-3xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-gray-50 border-gray-100 text-slate-900'} border rounded-xl px-6 py-4 font-bold focus:border-indigo-500 outline-none`} />
                                )}
                                <button
                                    onClick={() => startInterview(selectedSubRole || selectedRole?.title)}
                                    disabled={!selectedRole || (selectedRole.id === 9 && !customRole.trim()) || (selectedRole.branches && !selectedSubRole)}
                                    className="w-full max-w-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/30 uppercase tracking-[0.5em] text-xs disabled:opacity-30"
                                >
                                    Initialize Swain System
                                </button>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="session"
                        initial={openingVariant.initial}
                        animate={openingVariant.animate}
                        exit={openingVariant.exit}
                        transition={openingVariant.transition}
                        style={{ left: currentSidebarWidth, width: `calc(100% - ${currentSidebarWidth}px)`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        className={`${isDark ? 'bg-[#05070a]' : 'bg-white'} fixed top-0 right-0 bottom-0 z-[40] flex flex-col md:flex-row overflow-hidden no-scrollbar`}
                    >
                        {/* Realistic Command Center Sidebar */}
                        <div className={`w-full md:w-[45%] h-full ${isDark ? 'bg-slate-900/10' : 'bg-slate-50/50'} p-12 flex flex-col items-center justify-between border-r ${isDark ? 'border-indigo-500/10' : 'border-gray-200'} relative shadow-2xl z-20`}>
                            {/* Boardroom LEFT PANEL — calm wave visualization */}
                            <div className="w-full flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">LIVE · SIM-01</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em]">{selectedRole?.title}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {timeLeft !== null && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-indigo-400">
                                            <Timer size={12} className="animate-spin-slow" />
                                            <span className="text-xs font-black">{timeLeft}s</span>
                                        </div>
                                    )}
                                    <button onClick={handleClose} className="p-2 rounded-xl text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Phase progress — ultra-minimal */}
                            <div className="w-full mb-8">
                                <div className="h-[2px] w-full bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
                                        animate={{ width: `${getPhaseProgress()}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Phase {PHASES.indexOf(phase) + 1}/6</span>
                                    <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">{phase}</span>
                                </div>
                            </div>

                            {/* ── WAVE CORE — full-width calm visualization ── */}
                            <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden">
                                {/* Ambient glow bloom */}
                                <div
                                    className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none transition-all duration-1000"
                                    style={{
                                        background: isSpeaking
                                            ? 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.18) 0%, transparent 70%)'
                                            : isListening
                                                ? 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.12) 0%, transparent 70%)'
                                                : 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.04) 0%, transparent 70%)',
                                    }}
                                />

                                {/* Live reaction tooltip */}
                                <AnimatePresence>
                                    {micError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-2xl bg-red-950/90 border border-red-500/30 text-[10px] font-black text-red-400 uppercase tracking-widest backdrop-blur-md whitespace-nowrap z-10"
                                        >
                                            {micError}
                                        </motion.div>
                                    )}
                                    {!micError && liveReaction && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-[10px] font-black text-amber-400 uppercase tracking-widest backdrop-blur-md whitespace-nowrap z-10"
                                        >
                                            {liveReaction}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Full-width smooth wave SVG */}
                                <svg
                                    viewBox="0 0 800 200"
                                    preserveAspectRatio="none"
                                    className="w-full"
                                    style={{ height: '220px' }}
                                >
                                    <defs>
                                        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={isSpeaking ? "#6366f1" : "#334155"} stopOpacity="0" />
                                            <stop offset="50%" stopColor={isSpeaking ? "#818cf8" : isListening ? "#34d399" : "#475569"} stopOpacity="1" />
                                            <stop offset="100%" stopColor={isSpeaking ? "#6366f1" : "#334155"} stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={isSpeaking ? "#4f46e5" : "#1e293b"} stopOpacity="0" />
                                            <stop offset="50%" stopColor={isSpeaking ? "#6366f1" : isListening ? "#10b981" : "#334155"} stopOpacity="0.6" />
                                            <stop offset="100%" stopColor={isSpeaking ? "#4f46e5" : "#1e293b"} stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#0f172a" stopOpacity="0" />
                                            <stop offset="50%" stopColor={isSpeaking ? "#c7d2fe" : isListening ? "#6ee7b7" : "#64748b"} stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Layer 3 — deepest, slowest */}
                                    <WaveCore amplitude={isSpeaking ? 28 : isListening ? 10 : 5} frequency={0.6} opacity={1} color="url(#waveGrad2)" strokeWidth={1} />
                                    {/* Layer 2 — mid */}
                                    <WaveCore amplitude={isSpeaking ? 22 : isListening ? 8 : 4} frequency={1} opacity={1} color="url(#waveGrad1)" strokeWidth={1.5} />
                                    {/* Layer 1 — top, sharpest */}
                                    <WaveCore amplitude={isSpeaking ? 14 : isListening ? 5 : 2.5} frequency={1.6} opacity={1} color="url(#waveGrad3)" strokeWidth={1} />
                                </svg>

                                {/* State label */}
                                <div className="mt-10 flex flex-col items-center gap-3">
                                    <motion.div
                                        animate={{
                                            boxShadow: isSpeaking
                                                ? '0 0 24px rgba(99,102,241,0.4)'
                                                : isListening
                                                    ? '0 0 24px rgba(16,185,129,0.3)'
                                                    : 'none'
                                        }}
                                        transition={{ duration: 0.8 }}
                                        className={`px-8 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-700 ${isSpeaking
                                            ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/30'
                                            : isListening
                                                ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/30'
                                                : 'bg-slate-900/30 text-slate-600 border-slate-800'
                                            }`}
                                    >
                                        {isSpeaking ? 'Transmitting' : isListening ? 'Listening' : 'Standby'}
                                    </motion.div>

                                    <div className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-700 ${getAttitudeColor(attitude)}`}>
                                        Interviewer: Marcus Sterling ({attitude})
                                    </div>
                                </div>
                            </div>

                            {/* Bottom metadata row */}
                            <div className="w-full flex items-center justify-between pt-6 border-t border-slate-900">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-indigo-500 animate-ping' : 'bg-slate-800'}`} />
                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">AES-256</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Neural Sync · 99.8%</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-emerald-500 animate-ping' : 'bg-slate-800'}`} />
                                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Uplink</span>
                                </div>
                            </div>
                        </div>

                        {/* Panoramic Chat Interface */}
                        <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#070b14]' : 'bg-white'} relative z-10 shadow-lg`}>
                            {scorecard ? (
                                <div className="flex-1 p-24 flex flex-col items-center justify-center text-center">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="w-40 h-40 rounded-full bg-indigo-600/10 border-4 border-indigo-600 flex flex-col items-center justify-center mb-10 shadow-lg"
                                    >
                                        <span className="text-sm font-black text-indigo-400 uppercase tracking-widest">Score</span>
                                        <span className="text-6xl font-black text-indigo-500">{scorecard.technical_score}</span>
                                    </motion.div>
                                    <h2 className="text-6xl font-black mb-6 uppercase tracking-tighter text-white">{scorecard.level} - {scorecard.verdict}</h2>
                                    <div className="flex gap-12 mb-16 justify-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-2"><DollarSign size={20} /></div>
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Market Valuation</span>
                                            <span className="text-white font-black text-xs">{scorecard.salary_band}</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-2"><TrendingUp size={20} /></div>
                                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Trajectory</span>
                                            <span className="text-white font-black text-xs">{scorecard.promotion_readiness}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 max-w-xl mb-16 italic border-l-4 border-indigo-500/50 pl-10 text-lg leading-relaxed text-left">"{scorecard.summary}"</p>
                                    <button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-500 text-white px-16 py-6 rounded-2xl font-black uppercase tracking-[0.5em] text-sm shadow-2xl transition-all hover:scale-105 active:scale-95">Secure Session & Exit</button>
                                </div>
                            ) : (
                                <>
                                    <div className={`p-10 border-b ${isDark ? 'border-slate-800/50' : 'border-gray-100'} flex justify-between items-center bg-slate-950/20 backdrop-blur-md`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                                                <UserSquare2 className="text-indigo-400" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-sm uppercase tracking-[0.3em] text-white">SWAIN PANEL</h3>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Real-Time Behavioral Analysis Active</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Ultra-Low Latency Mode</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 relative">
                                        {/* Cinematic Background Detail */}
                                        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
                                            <Cpu size={400} />
                                        </div>

                                        {messages.map((m, i) => {
                                            const isAI = m.sender === 'ai';
                                            const isLastAI = isAI && i === messages.length - 1;
                                            const showCursor = isLastAI && isSpeaking;

                                            const userStyles = isDark ? 'bg-slate-900/60 text-white border-slate-800' : 'bg-slate-100 text-slate-900 border-gray-200';
                                            const aiStyles = isDark ? 'bg-indigo-600/5 text-slate-200 border-indigo-500/10' : 'bg-indigo-50 text-indigo-900 border-indigo-100';
                                            const bubbleStyles = m.sender === 'user' ? userStyles : aiStyles;

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: isAI ? -20 : 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className={`max-w-[80%] p-8 rounded-[2rem] text-[15px] font-medium leading-[1.8] ${bubbleStyles} border backdrop-blur-sm shadow-xl`}>
                                                        {isLastAI && isSpeaking
                                                            ? String(m.text || "").replace(/\[PAUSE\]|\[SPEED:[\d.]+\]/g, "").substring(0, revealedLength)
                                                            : String(m.text || "").replace(/\[PAUSE\]|\[SPEED:[\d.]+\]/g, "")
                                                        }
                                                        {showCursor && <span className="inline-block w-2 h-5 ml-2 bg-indigo-500 animate-pulse align-middle" />}
                                                    </div>
                                                    <span className="mt-3 text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">{isAI ? 'MARCUS STERLING' : 'CANDIDATE UPLINK'}</span>
                                                </motion.div>
                                            );
                                        })}
                                        {loading && (
                                            <div className="flex items-center gap-4 text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] ml-4">
                                                <div className="flex gap-1">
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                </div>
                                                Synthesizing Seniority Signals
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-12 bg-slate-950/40 border-t border-slate-900">
                                        <div className="relative group flex items-center gap-4 bg-slate-950 p-4 rounded-[2.5rem] border border-slate-800 shadow-lg transition-all focus-within:border-indigo-500/50 focus-within:shadow-lg">
                                            <button
                                                onClick={toggleListening}
                                                className={`p-6 rounded-[1.5rem] transition-all duration-300 ${isListening ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-indigo-400 border border-slate-800'}`}
                                            >
                                                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                                            </button>
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(String(e.target.value))}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder={loading ? "Analyzing telemetry..." : "Command your response..."}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-white text-lg font-bold placeholder:text-slate-700"
                                                disabled={loading}
                                            />
                                            <button
                                                onClick={() => handleSendMessage()}
                                                disabled={!String(input || "").trim() || loading}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-[1.5rem] shadow-2xl transition-all disabled:opacity-20 hover:scale-105 active:scale-95"
                                            >
                                                <Send size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

