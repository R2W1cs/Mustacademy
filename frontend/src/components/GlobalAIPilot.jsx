import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, ChevronDown, Zap, Clock, ArrowRight, ChevronRight, Activity, Play, Pause, CheckCircle2 } from 'lucide-react';
import api, { getApiUrl } from '../api/axios';
import { useTheme } from '../auth/ThemeContext';
import { usePlan } from '../auth/PlanContext';

const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function GlobalAIPilot() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [isOpen, setIsOpen] = useState(false);
    const [missionExpanded, setMissionExpanded] = useState(false);
    const {
        plan, refreshPlan, openBuilder, activeBlockIndex, timeLeft, isRunning, toggleTimer, completeBlock
    } = usePlan();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [activeTab, setActiveTab] = useState('chat'); // chat | plan | history
    const [history, setHistory] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(() => {
        const saved = localStorage.getItem('mentorConversationId');
        if (saved) return saved;
        const newId = crypto.randomUUID();
        localStorage.setItem('mentorConversationId', newId);
        return newId;
    });

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        refreshPlan();
    }, [refreshPlan]);

    // Blocks for mission strip
    const schedule = plan?.schedule || [];
    const currentBlock = activeBlockIndex !== null ? schedule[activeBlockIndex] : null;
    const progressPct = schedule.length > 0 ? Math.round((schedule.filter(b => b.completed_at).length / schedule.length) * 100) : 0;
    const nextBlockIdx = schedule.findIndex((b, i) => i > (activeBlockIndex || -1) && !b.completed_at);
    const nextBlock = nextBlockIdx !== -1 ? schedule[nextBlockIdx] : null;

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 250);
    }, [isOpen]);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await api.get('/ai/chat/sessions');
            setHistory(res.data || []);
        } catch { /* silence */ }
    }, []);

    const resumeSession = async (convId) => {
        setLoading(true);
        try {
            const res = await api.get(`/ai/chat/session/${convId}`);
            const sessionMessages = res.data.map(m => ({
                role: m.role === 'assistant' ? 'ai' : 'user',
                text: m.message
            }));
            setMessages(sessionMessages);
            setCurrentConversationId(convId);
            localStorage.setItem('mentorConversationId', convId);
            setActiveTab('chat');
        } catch (err) {
            console.error("Failed to resume session", err);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        const newId = crypto.randomUUID();
        setCurrentConversationId(newId);
        localStorage.setItem('mentorConversationId', newId);
        setMessages([]);
        setActiveTab('chat');
    };

    useEffect(() => {
        if (isOpen && activeTab === 'history') fetchHistory();
    }, [isOpen, activeTab, fetchHistory]);

    const handleOpen = () => {
        setIsOpen(true);
        setHasUnread(false);
        if (activeTab === 'history') fetchHistory();
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setLoading(true);

        try {
            // Add a placeholder message for the AI
            setMessages(prev => [...prev, { role: 'ai', text: '' }]);

            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/ai/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: text,
                    conversationId: currentConversationId
                })
            });

            if (!response.ok) throw new Error('Stream connection failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            let historyRefreshed = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.content) {
                                accumulatedResponse += parsed.content;
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = { role: 'ai', text: accumulatedResponse };
                                    return next;
                                });

                                // Trigger history refresh as soon as we get the first chunk
                                if (!historyRefreshed) {
                                    fetchHistory();
                                    historyRefreshed = true;
                                }
                            }
                        } catch (e) {
                            console.warn("Stream parse error", e);
                        }
                    }
                }
            }

        } catch (err) {
            console.error("Stream Error", err);
            setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'ai', text: 'Intelligence feed interrupted. Please retry.' };
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex items-end gap-3">

            {/* ===== FLOATING MISSION STRIP (Left of icon) ===== */}
            <AnimatePresence>
                {currentBlock && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`rounded-2xl border shadow-2xl overflow-hidden cursor-pointer select-none ${isDark
                            ? 'bg-[#0a0e1a]/95 border-indigo-500/20 shadow-indigo-900/20'
                            : 'bg-white border-red-100 shadow-red-200/30'
                            }`}
                        style={{ backdropFilter: 'blur(24px)', maxWidth: missionExpanded ? 340 : 220 }}
                        onClick={() => setMissionExpanded(!missionExpanded)}
                    >
                        {/* Compact strip */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20' : 'bg-red-50'}`}>
                                <Activity size={14} className={isDark ? "text-indigo-500" : "text-red-500"} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400/60' : 'text-red-400'}`}>Active</p>
                                <p className={`text-[11px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentBlock.action}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                <Clock size={10} className={timeLeft < 300 ? 'text-red-400' : (isDark ? 'text-indigo-500' : 'text-red-600')} />
                                <span className={`text-[11px] font-black tabular-nums ${timeLeft < 300 ? 'text-red-400' : (isDark ? 'text-indigo-300' : 'text-red-700')}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <ChevronRight size={12} className={`transition-transform shrink-0 ${missionExpanded ? 'rotate-90' : ''} ${isDark ? 'text-slate-500' : 'text-slate-300'}`} />
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                            {missionExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`px-4 pb-4 pt-1 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                        {/* Progress */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Progress</span>
                                            <span className={`text-[10px] font-black ${isDark ? 'text-indigo-400' : 'text-red-600'}`}>{progressPct}%</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className={`h-full rounded-full transition-all ${isDark ? 'bg-indigo-500' : 'bg-red-600'}`} style={{ width: `${progressPct}%` }} />
                                        </div>

                                        {/* Session list */}
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                            {schedule.map((b, i) => {
                                                const done = !!b.completed_at;
                                                const active = b === currentBlock;
                                                return (
                                                    <div key={i} className="space-y-1">
                                                        <div className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-[10px] transition-all ${active ? (isDark ? 'bg-indigo-500/10 text-indigo-300 font-black' : 'bg-red-50 text-red-700 font-black')
                                                            : done ? (isDark ? 'text-slate-600 line-through' : 'text-slate-300 line-through')
                                                                : (isDark ? 'text-slate-500' : 'text-slate-400')
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-emerald-500' : active ? (isDark ? 'bg-indigo-500 shadow-lg' : 'bg-red-500 shadow-lg') : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`} />
                                                            <span className="truncate flex-1">{b.action}</span>
                                                            <span className="shrink-0 tabular-nums">{b.duration}m</span>
                                                        </div>
                                                        {active && b.sub_tasks?.length > 0 && (
                                                            <div className="pl-6 space-y-1 pb-1">
                                                                {b.sub_tasks.map((st, si) => (
                                                                    <div key={si} className={`flex items-center gap-1.5 text-[8px] ${isDark ? 'text-indigo-400/50' : 'text-red-400'}`}>
                                                                        <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                                                                        <span className="truncate">{st}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Next */}
                                        {nextBlock && (
                                            <div className={`flex items-center gap-2 mt-3 pt-2 border-t text-[9px] ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                                                <ArrowRight size={9} />
                                                <span>Next: <strong className={isDark ? 'text-slate-300' : 'text-slate-600'}>{nextBlock.action}</strong> ({nextBlock.duration}m)</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== CHAT PANEL ===== */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.92, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`w-[360px] rounded-[2rem] border shadow-2xl flex flex-col overflow-hidden ${isDark
                            ? 'bg-[#070b14]/98 border-indigo-500/20 shadow-indigo-900/30'
                            : 'bg-white border-red-100 shadow-red-200/40'
                            }`}
                        style={{ height: 600, maxHeight: '85vh', backdropFilter: 'blur(32px)' }}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                    <Bot size={18} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#070b14] animate-pulse" />
                                </div>
                                <div>
                                    <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Pilot</h3>
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                                        {plan ? 'Protocol Active' : 'Ready to Forge'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`flex p-1 rounded-xl shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                    <button
                                        onClick={() => setActiveTab('plan')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'plan' ? (isDark ? 'bg-indigo-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-sm') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}
                                    >
                                        Plan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('chat')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? (isDark ? 'bg-indigo-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-sm') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}
                                    >
                                        Chat
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? (isDark ? 'bg-indigo-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-sm') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}
                                    >
                                        History
                                    </button>
                                </div>
                                <button onClick={() => setIsOpen(false)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        </div>

                        {/* TAB CONTENT: PLAN */}
                        {activeTab === 'plan' && (
                            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
                                {schedule.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 py-12 opacity-80">
                                        <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                            <Activity size={32} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>No Active Plan</p>
                                            <p className={`text-[10px] mt-2 mb-6 max-w-[200px] mx-auto leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Initialize your cognitive strategy to begin session tracking.
                                            </p>
                                            <button onClick={openBuilder} className={`mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'}`}>
                                                <Zap size={14} fill="currentColor" />
                                                Forge Daily Protocol
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Active Block Focus */}
                                        {currentBlock && (
                                            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-white/5 border-indigo-500/20 shadow-lg shadow-indigo-900/20' : 'bg-red-50/50 border-red-100'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-indigo-400/80' : 'text-red-700'}`}>Current Focus</span>
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tabular-nums ${isDark ? 'bg-indigo-600 text-white' : 'bg-white text-red-600 shadow-sm'}`}>
                                                        <Clock size={10} />
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                </div>
                                                <h4 className={`text-lg font-black italic uppercase tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentBlock.action}</h4>

                                                {/* Subtasks */}
                                                <div className="space-y-2 mb-6">
                                                    {currentBlock.sub_tasks?.map((st, si) => (
                                                        <div key={si} className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-indigo-500/40' : 'bg-red-200'}`} />
                                                            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{st}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Controls */}
                                                <div className="flex gap-3">
                                                    <button onClick={toggleTimer} className={`flex-1 py-3 rounded-2xl flex items-center justify-center transition-all ${isRunning ? 'bg-slate-800 text-white' : (isDark ? 'bg-indigo-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg')}`}>
                                                        {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                                    </button>
                                                    <button onClick={completeBlock} className={`px-5 py-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-red-700 shadow-sm'}`}>
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB CONTENT: CHAT */}
                        {activeTab === 'chat' && (
                            <>
                                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center gap-3 py-6 opacity-60">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                                <Bot size={22} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Pilot Ready</p>
                                                <p className={`text-[10px] mt-1 mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Ask me anything or initialize your session strategy.
                                                </p>
                                                {!plan && (
                                                    <button onClick={openBuilder} className={`mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500' : 'bg-red-600 text-white shadow-xl shadow-red-100 hover:bg-red-700'}`}>
                                                        <Zap size={14} fill="currentColor" />
                                                        Forge Daily Protocol
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                            {msg.role === 'ai' && (
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                                    <Bot size={12} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                                </div>
                                            )}
                                            <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed font-medium whitespace-pre-wrap ${msg.role === 'user' ? (isDark ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-red-600 text-white rounded-br-none')
                                                : isDark ? 'bg-white/5 text-slate-200 border border-white/5 rounded-bl-none'
                                                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                                }`}>{msg.text}</div>
                                        </motion.div>
                                    ))}

                                    {loading && (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                                <Bot size={12} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                            </div>
                                            <div className="flex gap-1 py-2">
                                                {[0, 1, 2].map(i => (
                                                    <motion.span key={i} className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-red-400'}`}
                                                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className={`px-4 pb-4 pt-3 border-t shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                    <div className={`flex items-end gap-2 rounded-xl border px-3 py-2 transition-all ${isDark
                                        ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/40'
                                        : 'bg-slate-50 border-gray-200 focus-within:border-red-300 focus-within:shadow-md'
                                        }`}>
                                        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                                            rows={1} placeholder="Ask anything... (Enter to send)" disabled={loading}
                                            className={`flex-1 bg-transparent resize-none outline-none text-[11px] font-medium placeholder:opacity-40 max-h-20 leading-relaxed py-1 ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                                            style={{ scrollbarWidth: 'none' }} />
                                        <button onClick={sendMessage} disabled={loading || !input.trim()}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:grayscale active:scale-90 shadow-lg ${isDark ? 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-500' : 'bg-red-600 shadow-red-600/20 hover:bg-red-700'}`}>
                                            <Send size={13} className="text-white ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* TAB CONTENT: HISTORY (Sessions) */}
                        {activeTab === 'history' && (
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                                <button
                                    onClick={startNewChat}
                                    className={`w-full py-3 mb-2 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'border-white/10 text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400' : 'border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600'}`}
                                >
                                    + Start New Discussion
                                </button>
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 py-6 opacity-60">
                                        <Clock size={22} className="text-slate-500" />
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No history recorded</p>
                                    </div>
                                ) : (
                                    history.map((h, i) => (
                                        <div
                                            key={i}
                                            onClick={() => resumeSession(h.conversation_id)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-red-200'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-red-700'}`}>
                                                    Concept Discussion
                                                </span>
                                                <span className={`text-[8px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] font-bold leading-relaxed line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {h.title}
                                            </p>
                                            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className={`text-[8px] font-black uppercase ${isDark ? 'text-indigo-500' : 'text-red-600'}`}>Resume Discussion</span>
                                                <ChevronRight size={10} className={isDark ? "text-indigo-500" : "text-red-600"} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== FLOATING BUTTON ===== */}
            <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-colors duration-200 shrink-0 ${isOpen ? 'bg-slate-700 shadow-slate-900/40' : (isDark ? 'bg-indigo-600 shadow-indigo-600/40 hover:bg-indigo-500' : 'bg-red-600 shadow-red-600/40 hover:bg-red-500')
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X size={20} className="text-white" />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <Bot size={22} className="text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center" style={{ border: '2px solid #0a0e1a' }}>
                        <Zap size={8} className="text-white" fill="white" />
                    </span>
                )}

                {!isOpen && (
                    <span className={`absolute inset-0 rounded-2xl border-2 animate-ping pointer-events-none ${isDark ? 'border-indigo-500/30' : 'border-red-500/30'}`} />
                )}
            </motion.button>
        </div>
    );
}

