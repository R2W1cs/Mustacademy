import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Zap, FileText, GraduationCap, Sparkles,
    Mic, VolumeX, Volume2, Target, RefreshCw, Check,
    Upload, Trash2, BookOpen, File, FileCode, ChevronDown,
    Brain, Send, Play
} from "lucide-react";
import api from "../api/axios";
import Markdown from "markdown-to-jsx";
import AlgoVizBlock from "./AlgoVizBlock";

// ─── CODE EXECUTION BLOCK ────────────────────────────────────────────────────
const CodeBlock = ({ children, language }) => {
    const [output, setOutput] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [steps, setSteps] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [mode, setMode] = useState('idle'); // 'idle' | 'run' | 'step'

    const code = Array.isArray(children) ? children.join('') : String(children || '');
    const lang = (language || '').replace('language-', '').replace('lang-', '').toLowerCase();
    const isRunnable = !lang || lang === 'js' || lang === 'javascript';

    const runCode = () => {
        const logs = [];
        const capture = (type) => (...args) =>
            logs.push({ type, text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
        const [oLog, oErr, oWarn] = [console.log, console.error, console.warn];
        console.log = capture('log'); console.error = capture('error'); console.warn = capture('warn');
        try { new Function(code)(); } // eslint-disable-line no-new-func
        catch (e) { logs.push({ type: 'error', text: `${e.name}: ${e.message}` }); }
        finally { console.log = oLog; console.error = oErr; console.warn = oWarn; }
        setOutput(logs); setHasRun(true); setMode('run');
    };

    const runStepped = () => {
        const collected = [];
        // eslint-disable-next-line no-new-func
        const __step__ = (label, state) => collected.push({ label: String(label), state: state ?? {} });
        try { new Function('__step__', code)(__step__); } // eslint-disable-line no-new-func
        catch (e) { collected.push({ label: `Error: ${e.message}`, state: {} }); }
        if (collected.length === 0) {
            collected.push({ label: 'No __step__() calls found in code', state: {} });
        }
        setSteps(collected);
        setStepIndex(0);
        setMode('step');
    };

    const currentStep = steps[stepIndex];

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-white/10 text-left font-mono" style={{ background: '#0d1117' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5" style={{ background: '#161b22' }}>
                <span className="text-[11px] text-slate-500">{lang || 'code'}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigator.clipboard.writeText(code)} className="text-[10px] text-slate-600 hover:text-slate-400 px-2 py-0.5 transition-colors">copy</button>
                    {isRunnable && (
                        <>
                            <button onClick={runCode} className="flex items-center gap-1.5 text-[11px] bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-700/40 px-3 py-1 rounded-md transition-all">
                                <Play size={10} /> Run
                            </button>
                            <button onClick={runStepped} className="flex items-center gap-1.5 text-[11px] bg-indigo-900/50 hover:bg-indigo-800/60 text-indigo-400 border border-indigo-700/40 px-3 py-1 rounded-md transition-all">
                                <Zap size={10} /> Step
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto p-4">
                <pre className="text-sm text-slate-300 leading-6 m-0 whitespace-pre">
                    {code.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                            <span className="select-none text-slate-700 w-8 text-right mr-4 shrink-0 text-xs leading-6">{i + 1}</span>
                            <span>{line || ' '}</span>
                        </div>
                    ))}
                </pre>
            </div>

            {/* Standard run output */}
            {mode === 'run' && hasRun && (
                <div className="border-t border-white/5" style={{ background: '#0a0e15' }}>
                    <div className="px-4 py-1.5 border-b border-white/5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Output</span>
                    </div>
                    <div className="p-4 text-sm min-h-[32px] space-y-1">
                        {output.length === 0
                            ? <span className="text-slate-600 text-xs italic">No output</span>
                            : output.map((o, i) => (
                                <div key={i} className={o.type === 'error' ? 'text-red-400' : o.type === 'warn' ? 'text-amber-300' : 'text-emerald-300/80'}>
                                    {o.type === 'error' ? '✗ ' : o.type === 'warn' ? '⚠ ' : '▸ '}{o.text}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Step-through UI */}
            {mode === 'step' && steps.length > 0 && (
                <div className="border-t border-white/5" style={{ background: '#0a0e15' }}>
                    {/* Step header */}
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Stepper</span>
                        <span className="text-[9px] font-mono text-indigo-400 ml-auto">{stepIndex + 1} / {steps.length}</span>
                    </div>
                    {/* Step controls */}
                    <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5">
                        <button onClick={() => setStepIndex(0)} disabled={stepIndex === 0} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 transition-all text-[10px] font-bold">↩</button>
                        <button onClick={() => setStepIndex(i => Math.max(0, i - 1))} disabled={stepIndex === 0} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 transition-all text-[10px] font-bold">← Prev</button>
                        <button onClick={() => setStepIndex(i => Math.min(steps.length - 1, i + 1))} disabled={stepIndex >= steps.length - 1} className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-20 transition-all text-[10px] font-bold px-3">Next →</button>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden ml-2">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${steps.length > 1 ? (stepIndex / (steps.length - 1)) * 100 : 100}%` }} />
                        </div>
                    </div>
                    {/* Step label + state */}
                    <div className="p-4">
                        <div className="text-indigo-300 font-bold text-sm mb-3">
                            ▸ {currentStep?.label}
                        </div>
                        {currentStep?.state && Object.keys(currentStep.state).length > 0 && (
                            <div className="rounded-lg border border-white/5 overflow-hidden" style={{ background: '#060810' }}>
                                <div className="px-3 py-1 border-b border-white/5 text-[9px] text-slate-600 font-bold uppercase tracking-widest">State</div>
                                <div className="p-3 space-y-1">
                                    {Object.entries(currentStep.state).map(([k, v]) => (
                                        <div key={k} className="flex items-start gap-3 text-xs">
                                            <span className="text-slate-500 font-bold shrink-0 min-w-[80px]">{k}:</span>
                                            <span className="text-emerald-300/80 font-mono break-all">
                                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── ASCII DIAGRAM ────────────────────────────────────────────────────────────
const AsciiDiagram = ({ children }) => {
    const raw = Array.isArray(children) ? children.join('') : String(children || '');
    const lines = raw.split('\n');
    const firstLine = lines[0]?.trim() || '';
    const isDirective = /^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|stateDiagram)/i.test(firstLine);
    const title = isDirective ? firstLine.replace(/^(graph\s+|flowchart\s+)/i, '') : 'DIAGRAM';
    const content = isDirective ? lines.slice(1).join('\n') : raw;

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-cyan-500/20" style={{ background: '#060d14' }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/15" style={{ background: '#091320' }}>
                <div className="flex gap-1.5">
                    {['bg-red-500/50','bg-yellow-500/50','bg-green-500/50'].map((c,i) => <div key={i} className={`w-2 h-2 rounded-full ${c}`} />)}
                </div>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400/60">◈ {title}</span>
            </div>
            <div className="px-5 py-4 overflow-x-auto">
                <pre className="text-[12px] leading-relaxed text-cyan-300/75 whitespace-pre m-0" style={{ fontFamily: "'Cascadia Code','Fira Code','Courier New',monospace" }}>
                    {content}
                </pre>
            </div>
        </div>
    );
};

const MarkdownCode = ({ children, className }) => {
    const lang = (className || '').replace('lang-', '').replace('language-', '');
    if (lang === 'algo-viz') return <AlgoVizBlock>{children}</AlgoVizBlock>;
    if (lang === 'mermaid') return <AsciiDiagram>{children}</AsciiDiagram>;
    return <CodeBlock language={lang}>{children}</CodeBlock>;
};

// ─── FILE ICON ────────────────────────────────────────────────────────────────
const FileIcon = ({ type }) => {
    if (type === 'pdf') return <span className="text-red-400"><FileText size={16} /></span>;
    if (type === 'pptx') return <span className="text-orange-400"><File size={16} /></span>;
    if (type === 'docx') return <span className="text-blue-400"><FileText size={16} /></span>;
    return <span className="text-slate-400"><FileCode size={16} /></span>;
};

const formatBytes = (b) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(0)}KB` : `${(b/1048576).toFixed(1)}MB`;

// ─── Topic type classifier ────────────────────────────────────────────────────
const THEORETICAL_PATTERNS = /waterfall|agile|scrum|kanban|sdlc|lifecycle|life.?cycle|methodology|process model|requirements|rup\b|spiral model|incremental|prototype|feasibility|uml|use.?case|gantt|project.?management|change.?management|risk.?management|quality.?assurance|software.?testing\s*methodolog|ieee|cmmi|devops.?culture/i;

function isTheoreticalTopic(title = '') {
    return THEORETICAL_PATTERNS.test(title);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TopicNotebook = ({ topic, isDark }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [rightTab, setRightTab] = useState("notes"); // 'notes' | 'vault' | 'missions'
    const [resources, setResources] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeMission, setActiveMission] = useState(null);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sessionStatus, setSessionStatus] = useState("idle");
    const [lectureExpanded, setLectureExpanded] = useState(true);

    const scrollRef = useRef(null);
    const audioRef = useRef(new Audio());
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const saveTimeout = useRef(null);
    const lastSpokenRef = useRef(-1);
    const pendingSpeech = useRef("");
    const fileInputRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);


    // ── Auto-scroll ──
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    // ── Audio priming ──
    useEffect(() => {
        const prime = async () => {
            if (sessionStatus === "active") return;
            const silent = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
            audioRef.current.src = silent;
            try {
                await audioRef.current.play();
                synthesisRef.current.getVoices();
                setSessionStatus("active");
                if (pendingSpeech.current) { speakResponse(pendingSpeech.current); pendingSpeech.current = ""; }
                window.removeEventListener('click', prime);
                window.removeEventListener('keydown', prime);
            } catch { /* blocked — will retry on next interaction */ }
        };
        window.addEventListener('click', prime);
        window.addEventListener('keydown', prime);
        return () => { window.removeEventListener('click', prime); window.removeEventListener('keydown', prime); };
    }, [sessionStatus]);

    // ── Auto-speak latest AI message ──
    useEffect(() => {
        if (!messages.length) return;
        const last = messages[messages.length - 1];
        if (last.sender === 'ai' && voiceEnabled && lastSpokenRef.current < messages.length - 1) {
            const t = setTimeout(() => { speakResponse(last.text); lastSpokenRef.current = messages.length - 1; }, 600);
            return () => clearTimeout(t);
        }
    }, [messages.length, voiceEnabled]);

    // ── STT ──
    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (e) => {
            const t = Array.from(e.results).map(r => r[0].transcript).join('');
            setInput(t);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => { if (t.trim()) { sendMessage(t); stopListening(); } }, 1500);
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
    }, []);

    // ── Initial fetch + auto-start masterclass ──
    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            // Load note & resources in parallel
            try {
                const [noteRes, resourcesRes] = await Promise.all([
                    api.get(`/courses/topics/${topic.id}/note`),
                    api.get(`/courses/topics/${topic.id}/resources`),
                ]);
                if (!cancelled) {
                    setNote(noteRes.data.content || "");
                    setResources(resourcesRes.data || []);
                }
            } catch { /* silent */ }

            // Auto-start masterclass (direct API call — no stale closure risk)
            if (!cancelled) {
                setLoading(true);
                const theoretical = isTheoreticalTopic(topic.title);
                const masterclassMsg = theoretical
                    ? `MASTERCLASS PROTOCOL — ${topic.title}. ` +
                      `Write a COMPLETE standalone lesson (minimum 800 words) directly in your reply. ` +
                      `This is a theoretical/process topic — do NOT include code blocks or algorithm visualizers. ` +
                      `You MUST include: ` +
                      `1) A process/flow diagram using ASCII box-drawing chars (┌─┐│└─┘→) showing the phases or flow of ${topic.title}. ` +
                      `2) A comparison table (e.g. advantages vs disadvantages, or phase breakdown with deliverables). ` +
                      `Also explain: the real-world context (which companies/projects use this and why), ` +
                      `the key phases or principles, common pitfalls, and when to choose this over alternatives. ` +
                      `Do NOT say "provided below". Do NOT summarize. Write the full content in your reply.`
                    : `MASTERCLASS PROTOCOL — ${topic.title}. ` +
                      `Write a COMPLETE standalone lesson (minimum 800 words) directly in your reply. ` +
                      `You MUST include ALL THREE or the response is invalid: ` +
                      `1) An interactive algorithm visualizer in a \`\`\`algo-viz block (NOT mermaid, NOT json — exactly algo-viz) showing how ${topic.title} works step by step. ` +
                      `2) Complete runnable JavaScript code (30+ lines, realistic scenario, with console.log showing output and __step__() calls for Step-Through mode). ` +
                      `3) A markdown table showing time/space complexity per operation. ` +
                      `Also explain: the real-world hook (how is this used at Netflix/Google RIGHT NOW?), ` +
                      `the one mental model analogy that makes it click, step-by-step mechanics, ` +
                      `when to use vs when NOT to use, and the mistake 90% of students make. ` +
                      `Do NOT say "provided below". Do NOT summarize. Write the full content in your reply.`;
                try {
                    const res = await api.post("/ai/chat", { message: masterclassMsg, topicId: topic.id });
                    if (!cancelled) {
                        const reply = res.data.reply || "Synthesis complete.";
                        if (res.data.goal) setActiveMission({ title: "Mission", description: res.data.goal.description, tasks: ["Complete the protocol"] });
                        setMessages([{ sender: 'ai', text: reply, id: Date.now() + '-ai', suggested: res.data.suggested_questions }]);
                    }
                } catch {
                    if (!cancelled) setMessages([{ sender: 'ai', text: "Neural link interrupted. Please retry.", id: Date.now() + '-err' }]);
                } finally {
                    if (!cancelled) setLoading(false);
                }
            }
        };

        init();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic.id]);

    // ── Auto-save note ──
    useEffect(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            if (!note) return;
            setIsSaving(true);
            try { await api.post(`/courses/topics/${topic.id}/note`, { content: note }); }
            catch { /* silent */ }
            finally { setTimeout(() => setIsSaving(false), 800); }
        }, 2000);
        return () => clearTimeout(saveTimeout.current);
    }, [note, topic.id]);

    // ── TTS ──
    const killAudio = useCallback(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.src = "";
        setIsSpeaking(false);
    }, []);

    const speakResponse = useCallback(async (text) => {
        if (!text || !voiceEnabled) return;
        const clean = text
            .replace(/```[\s\S]*?```/g, " [code block] ")
            .replace(/\*\*/g, "").replace(/###?\s/g, "")
            .replace(/`([^`]+)`/g, "$1").replace(/\n+/g, " ").trim();
        if (sessionStatus !== "active") { pendingSpeech.current = clean; return; }
        killAudio();
        try {
            setIsSpeaking(true);
            const res = await api.post('/tts', { text: clean, voice: 'en-US-AvaNeural' }, { responseType: 'blob' });
            if (!res.data || res.data.size < 500) throw new Error('Invalid audio');
            const url = URL.createObjectURL(res.data);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => { killAudio(); URL.revokeObjectURL(url); };
            audio.onerror = () => { killAudio(); URL.revokeObjectURL(url); };
            await audio.play().catch(() => {});
        } catch { killAudio(); }
    }, [voiceEnabled, sessionStatus, killAudio]);

    // ── Listening ──
    const stopListening = () => {
        try { recognitionRef.current?.stop(); } catch {}
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) { stopListening(); return; }
        killAudio();
        try { recognitionRef.current.start(); setIsListening(true); } catch {}
    };

    // ── Send message ──
    const sendMessage = useCallback(async (overrideText = null, { silent = false } = {}) => {
        const text = typeof overrideText === 'string' ? overrideText : input;
        if (!text.trim() || loading) return;
        killAudio();

        if (!silent) {
            setMessages(prev => {
                if (prev.at(-1)?.text === text && prev.at(-1)?.sender === 'user') return prev;
                return [...prev, { sender: 'user', text, id: Date.now() + '-user' }];
            });
        }
        setInput(""); setLoading(true);

        try {
            const res = await api.post("/ai/chat", { message: text, topicId: topic.id });
            const reply = res.data.reply || "Synthesis complete.";

            const missionMatch = reply.match(/```json\s*({[\s\S]*?"type":\s*"mission"[\s\S]*?})\s*```/);
            if (missionMatch) { try { setActiveMission(JSON.parse(missionMatch[1])); } catch {} }
            if (res.data.goal) setActiveMission({ title: "Mission", description: res.data.goal.description, tasks: ["Complete the protocol"] });

            setMessages(prev => {
                if (prev.at(-1)?.text === reply && prev.at(-1)?.sender === 'ai') return prev;
                return [...prev, { sender: 'ai', text: reply, id: Date.now() + '-ai', suggested: res.data.suggested_questions }];
            });
        } catch {
            setMessages(prev => [...prev, { sender: 'ai', text: "Neural link interrupted. Please retry.", id: Date.now() + '-err' }]);
        } finally { setLoading(false); }
    }, [input, loading, topic.id, killAudio]);

    const initiateSynthesis = useCallback((force = false) => {
        if (force) setMessages([]);
        sendMessage(
            `MASTERCLASS PROTOCOL — ${topic.title}. ` +
            `Write a COMPLETE standalone lesson (minimum 800 words) directly in your reply. ` +
            `You MUST include ALL THREE or the response is invalid: ` +
            `1) A visual ASCII diagram in a \`\`\`mermaid block showing how ${topic.title} works (use box-drawing chars ┌─┐│└─┘→). ` +
            `2) Complete runnable JavaScript code (30+ lines, realistic scenario, with console.log showing output). ` +
            `3) A markdown table showing time/space complexity per operation. ` +
            `Also explain: the real-world hook (how is this used at Netflix/Google RIGHT NOW?), ` +
            `the one mental model analogy that makes it click, step-by-step mechanics, ` +
            `when to use vs when NOT to use, and the mistake 90% of students make. ` +
            `Do NOT say "provided below". Do NOT summarize. Write the full content in your reply.`,
            { silent: true }
        );
    }, [topic.title, sendMessage]);

    // ── File upload ──
    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}...`);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await api.post(`/courses/topics/${topic.id}/resources`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResources(prev => [res.data.resource, ...prev]);
            toast.success(`${file.name} added to vault.`, { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed.', { id: toastId });
        } finally { setUploading(false); }
    };

    const handleDeleteResource = async (resourceId) => {
        try {
            await api.delete(`/courses/topics/${topic.id}/resources/${resourceId}`);
            setResources(prev => prev.filter(r => r.id !== resourceId));
            toast.success("Resource removed from vault.");
        } catch {
            toast.error("Could not delete resource.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    // ── Styles ──
    const c = {
        bg: isDark ? 'bg-[#09090b]' : 'bg-slate-50',
        card: isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-slate-200',
        border: isDark ? 'border-white/[0.06]' : 'border-slate-200',
        text: isDark ? 'text-slate-200' : 'text-slate-800',
        sub: isDark ? 'text-slate-500' : 'text-slate-400',
        input: isDark ? 'bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
        badge: isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-red-50 border-red-200 text-red-600',
        accent: isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-[#c01636] hover:bg-red-700',
        accentText: isDark ? 'text-indigo-400' : 'text-[#c01636]',
    };

    // ── Render ──
    return (
        <div className={`flex flex-col h-[calc(100vh-120px)] w-full rounded-[2rem] border overflow-hidden ${c.bg} ${c.border} shadow-2xl`}>

            {/* ── HEADER ── */}
            <div className={`flex items-center justify-between px-6 py-3.5 border-b ${c.border} shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/15' : 'bg-red-50'}`}>
                        <Brain size={18} className={c.accentText} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${c.sub}`}>Research Notebook</p>
                        <h2 className={`text-sm font-bold leading-tight ${c.text}`}>{topic.title}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${c.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-indigo-400' : 'bg-red-500'}`} />
                        Live Session
                    </div>
                    <button onClick={() => setVoiceEnabled(v => !v)} className={`p-2 rounded-xl transition-all ${voiceEnabled ? c.accentText : c.sub} hover:bg-white/5`}>
                        {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <button onClick={() => initiateSynthesis(true)} className={`p-2 rounded-xl ${c.sub} hover:${c.accentText} transition-all`} title="Regenerate">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── LEFT: LECTURE + CHAT ── */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar" ref={scrollRef}>

                        {messages.length === 0 && !loading && (
                            <div className={`flex flex-col items-center justify-center h-full gap-4 opacity-20 ${c.sub}`}>
                                <Sparkles size={48} />
                                <p className="text-xs font-bold uppercase tracking-widest">Initializing masterclass…</p>
                            </div>
                        )}

                        {messages.map((m, i) => {
                            const isLecture = i === 0 && m.sender === 'ai';
                            const isAI = m.sender === 'ai';

                            if (isLecture) return (
                                <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                    {/* LECTURE DOCUMENT CARD */}
                                    <div className={`rounded-2xl border overflow-hidden ${c.card}`}>
                                        {/* Card header */}
                                        <div className={`flex items-center justify-between px-5 py-3 border-b ${c.border} ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-500/15' : 'bg-red-50'}`}>
                                                    <GraduationCap size={14} className={c.accentText} />
                                                </div>
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${c.sub}`}>Dr. Nova · Masterclass</p>
                                                    <p className={`text-[11px] font-bold ${c.text}`}>{topic.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isSpeaking && (
                                                    <div className="flex gap-0.5 items-end h-4">
                                                        {[1,2,3,4,5].map(j => (
                                                            <motion.div key={j} animate={{ height: [3,10,3] }} transition={{ repeat: Infinity, duration: 0.5, delay: j*0.08 }} className={`w-0.5 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-red-500'}`} />
                                                        ))}
                                                    </div>
                                                )}
                                                <button onClick={() => speakResponse(m.text)} className={`p-1.5 rounded-lg hover:bg-white/5 ${c.sub} transition-colors`}><Volume2 size={13} /></button>
                                                <button onClick={() => setLectureExpanded(v => !v)} className={`p-1.5 rounded-lg hover:bg-white/5 ${c.sub} transition-all ${lectureExpanded ? '' : 'rotate-180'}`}><ChevronDown size={13} /></button>
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <AnimatePresence>
                                            {lectureExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className={`px-6 py-5 prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''} text-[13px] leading-relaxed`}>
                                                        <Markdown options={{ overrides: { code: MarkdownCode } }}>{m.text}</Markdown>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Divider after lecture */}
                                    {messages.length > 1 && (
                                        <div className={`flex items-center gap-3 mt-5 ${c.sub}`}>
                                            <div className={`h-px flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <MessageSquare size={9} /> Q&A Session
                                            </span>
                                            <div className={`h-px flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
                                        </div>
                                    )}
                                </motion.div>
                            );

                            // Regular chat bubbles
                            return (
                                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-[12px] leading-relaxed ${
                                        isAI
                                            ? `${c.card} border ${c.text} rounded-tl-sm`
                                            : `${isDark ? 'bg-indigo-600' : 'bg-[#c01636]'} text-white rounded-tr-sm`
                                    }`}>
                                        {isAI ? (
                                            <>
                                                <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''} text-[12px]`}>
                                                    <Markdown options={{ overrides: { code: MarkdownCode } }}>{m.text}</Markdown>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                                    <button onClick={() => speakResponse(m.text)} className={`p-1.5 rounded-lg hover:bg-white/5 ${c.sub} transition-colors`}><Volume2 size={12} /></button>
                                                    {m.suggested?.map((q, qi) => (
                                                        <button key={qi} onClick={() => sendMessage(q)} className={`text-[10px] px-2.5 py-1 rounded-lg border ${c.badge} hover:opacity-80 transition-all truncate max-w-[160px]`}>{q}</button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <p>{m.text}</p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {loading && (
                            <div className="flex justify-start">
                                <div className={`px-5 py-4 rounded-2xl rounded-tl-sm border ${c.card}`}>
                                    <div className="flex gap-1.5 items-center">
                                        {[0,1,2].map(i => (
                                            <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
                                                className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-red-500'}`} />
                                        ))}
                                        <span className={`ml-2 text-[11px] ${c.sub}`}>Dr. Nova is thinking…</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mission card */}
                        {activeMission && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className={`p-5 rounded-2xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <Target size={16} className={c.accentText} />
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${c.accentText}`}>{activeMission.title}</p>
                                </div>
                                <p className={`text-[12px] mb-4 ${c.text}`}>{activeMission.description}</p>
                                <div className="space-y-2">
                                    {activeMission.tasks?.map((t, i) => (
                                        <div key={i} className={`flex items-center gap-2.5 text-[11px] ${c.sub}`}>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeMission.completed ? (isDark ? 'bg-indigo-500 border-indigo-500' : 'bg-red-500 border-red-500') : c.border}`}>
                                                {activeMission.completed && <Check size={10} className="text-white" />}
                                            </div>
                                            {t}
                                        </div>
                                    ))}
                                </div>
                                {!activeMission.completed && (
                                    <button onClick={() => { setActiveMission(p => ({...p, completed: true})); sendMessage("Mission complete!"); }}
                                        className={`mt-4 w-full py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest ${c.accent} transition-all`}>
                                        Mark Complete
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* ── INPUT BAR ── */}
                    <div className={`px-5 pb-5 pt-3 border-t ${c.border} shrink-0`}>
                        <div className="flex gap-2 items-end">
                            <div className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl border ${c.input} transition-all focus-within:ring-2 ${isDark ? 'focus-within:ring-indigo-500/40' : 'focus-within:ring-red-500/30'}`}>
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Ask Dr. Nova anything…"
                                    className="flex-1 bg-transparent text-[13px] outline-none"
                                />
                                <button onClick={toggleListening} className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white' : `${c.sub} hover:text-current`}`}>
                                    <Mic size={15} />
                                </button>
                            </div>
                            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                                className={`p-3.5 rounded-2xl text-white ${c.accent} transition-all disabled:opacity-30 shadow-lg`}>
                                <Send size={16} />
                            </button>
                        </div>

                        {/* Vault resources active indicator */}
                        {resources.length > 0 && (
                            <p className={`mt-2 text-[10px] ${c.sub} flex items-center gap-1.5`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {resources.length} vault resource{resources.length > 1 ? 's' : ''} active in AI context
                            </p>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: TOOLS PANEL ── */}
                <div className={`w-[360px] border-l ${c.border} flex flex-col shrink-0`}>

                    {/* Tab bar */}
                    <div className={`flex border-b ${c.border} shrink-0`}>
                        {[
                            { id: 'notes', icon: <BookOpen size={13} />, label: 'Notes' },
                            { id: 'vault', icon: <Upload size={13} />, label: 'Vault' },
                            { id: 'missions', icon: <Target size={13} />, label: 'Missions' },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setRightTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                                    rightTab === tab.id
                                        ? `${c.accentText} ${isDark ? 'border-indigo-500' : 'border-[#c01636]'}`
                                        : `${c.sub} border-transparent hover:border-current`
                                }`}>
                                {tab.icon}{tab.label}
                                {tab.id === 'vault' && resources.length > 0 && (
                                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-100 text-red-600'}`}>{resources.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── NOTES TAB ── */}
                    {rightTab === 'notes' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className={`flex items-center justify-between px-5 py-3 border-b ${c.border}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${c.sub}`}>Personal Notes</span>
                                <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase ${c.sub}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? (isDark ? 'bg-indigo-400 animate-pulse' : 'bg-red-400 animate-pulse') : 'bg-emerald-500'}`} />
                                    {isSaving ? 'Saving…' : 'Saved'}
                                </div>
                            </div>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder={`Your notes on ${topic.title}…\n\nJot down key concepts, personal insights, or questions to revisit.`}
                                className={`flex-1 resize-none p-5 text-[13px] leading-relaxed bg-transparent outline-none no-scrollbar ${c.text} placeholder:${c.sub}`}
                            />
                        </div>
                    )}

                    {/* ── VAULT TAB ── */}
                    {rightTab === 'vault' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className={`px-5 py-3 border-b ${c.border}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${c.sub}`}>Upload Resources</p>
                                <p className={`text-[11px] mt-0.5 ${c.sub} opacity-70`}>PDF, PPTX, DOCX, TXT — AI uses these as context</p>
                            </div>

                            {/* Dropzone */}
                            <div className="px-4 py-4 shrink-0">
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                                        isDragging
                                            ? `${isDark ? 'border-indigo-400 bg-indigo-500/10' : 'border-red-400 bg-red-50'}`
                                            : `${isDark ? 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.02]' : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30'}`
                                    }`}>
                                    {uploading ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                <RefreshCw size={20} className={c.accentText} />
                                            </motion.div>
                                            <p className={`text-[11px] font-bold ${c.accentText}`}>Processing file…</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} className={isDragging ? c.accentText : c.sub} />
                                            <p className={`text-[11px] font-bold ${isDragging ? c.accentText : c.text}`}>
                                                {isDragging ? 'Drop to upload' : 'Drop file or click to browse'}
                                            </p>
                                            <p className={`text-[10px] ${c.sub}`}>PDF · PPTX · DOCX · TXT — up to 20MB</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden"
                                    accept=".pdf,.pptx,.docx,.txt,.md"
                                    onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ''; }} />
                            </div>

                            {/* Resource list */}
                            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
                                {resources.length === 0 ? (
                                    <div className={`flex flex-col items-center justify-center py-10 gap-2 ${c.sub} opacity-40`}>
                                        <FileText size={28} />
                                        <p className="text-[11px] font-bold uppercase tracking-wide">No resources yet</p>
                                        <p className="text-[10px] text-center">Upload your lecture slides or notes — Dr. Nova will use them when answering questions.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${c.sub} mb-1`}>{resources.length} Active Resource{resources.length > 1 ? 's' : ''}</p>
                                        {resources.map(r => (
                                            <motion.div key={r.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border ${c.card} group`}>
                                                <div className="shrink-0"><FileIcon type={r.file_type} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[12px] font-semibold truncate ${c.text}`}>{r.title}</p>
                                                    <p className={`text-[10px] ${c.sub}`}>{r.file_type.toUpperCase()} · {formatBytes(r.file_size || 0)}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active in AI context" />
                                                    <button onClick={() => handleDeleteResource(r.id)}
                                                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${c.sub} hover:text-red-400 hover:bg-red-500/10`}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── MISSIONS TAB ── */}
                    {rightTab === 'missions' && (
                        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
                            {activeMission ? (
                                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target size={16} className={c.accentText} />
                                        <p className={`text-[11px] font-black uppercase tracking-wider ${c.accentText}`}>{activeMission.title}</p>
                                    </div>
                                    <p className={`text-[12px] mb-4 leading-relaxed ${c.text}`}>{activeMission.description}</p>
                                    <div className="space-y-2.5">
                                        {activeMission.tasks?.map((t, i) => (
                                            <div key={i} className={`flex items-center gap-3 text-[12px] ${activeMission.completed ? `line-through ${c.sub}` : c.text}`}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${activeMission.completed ? (isDark ? 'bg-indigo-500 border-indigo-500' : 'bg-red-500 border-red-500') : c.border}`}>
                                                    {activeMission.completed && <Check size={10} className="text-white" />}
                                                </div>
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                    {!activeMission.completed && (
                                        <button onClick={() => { setActiveMission(p => ({...p, completed: true})); sendMessage("Mission complete. Ready for next challenge."); }}
                                            className={`mt-5 w-full py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest ${c.accent} transition-all shadow-lg`}>
                                            Complete Mission
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className={`flex flex-col items-center justify-center h-full gap-3 ${c.sub} opacity-30`}>
                                    <Zap size={36} />
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-center">No active mission<br />Keep asking questions!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopicNotebook;
