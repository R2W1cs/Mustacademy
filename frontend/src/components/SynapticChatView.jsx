import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Mic, MicOff, Paperclip, ShieldCheck, Zap } from 'lucide-react';
import { useSynapticChat } from '../hooks/useSynapticChat';

export default function SynapticChatView({ roomId, roomName, isDark }) {
    const { messages, members, sendMessage, toggleVoice, loading, error } = useSynapticChat(roomId);
    const [inputText, setInputText] = useState("");
    const [isVoiceOn, setIsVoiceOn] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText("");
        try {
            await sendMessage(text);
        } catch (err) {
            console.error("Transmission failed", err);
            setInputText(text); // Restore text on failure
        }
    };

    const handleToggleVoice = () => {
        const nextState = !isVoiceOn;
        setIsVoiceOn(nextState);
        toggleVoice(nextState);
    };

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.5em] text-cyan-500/50 animate-pulse">
            Establishing Synaptic Uplink...
        </div>
    );

    if (error) return (
        <div className="h-[600px] flex flex-col items-center justify-center space-y-4">
            <Zap className="text-rose-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{error}</p>
        </div>
    );

    return (
        <div className={`flex h-[600px] rounded-[2.5rem] border overflow-hidden backdrop-blur-xl transition-all ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>

            {/* Sidebar: Synaptic Presence */}
            <div className={`w-64 border-r p-6 hidden md:flex flex-col ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3 mb-8">
                    <Users size={16} className="text-cyan-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">In Sync</h3>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 text-[8px] font-black">{members.length}</span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-[10px] font-black border transition-all ${member.is_voice_active ? 'border-cyan-500 shadow-lg' : 'border-white/5'}`}>
                                    {member.username?.[0] || "?"}
                                </div>
                                {member.is_voice_active && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping absolute opacity-75" />
                                        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-slate-900" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.username}</span>
                                <span className="text-[8px] font-mono text-white/20 uppercase">Student Node</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main: Message Feed */}
            <div className="flex-1 flex flex-col relative">
                {/* Chat Header */}
                <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-white'}`}>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight">{roomName || 'General Sync'}</h2>
                        <p className="text-[8px] font-mono text-cyan-500 uppercase tracking-widest">Security Level: Encrypted Uplink</p>
                    </div>
                    <button
                        onClick={handleToggleVoice}
                        className={`p-3 rounded-2xl transition-all shadow-xl ${isVoiceOn ? 'bg-cyan-500 text-black shadow-cyan-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                        {isVoiceOn ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                            <Zap size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Waiting for Synchronization...</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id || i}
                            className={`flex gap-4 ${msg.sender_id === parseInt(localStorage.getItem('userId')) ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
                                {msg.sender_name?.[0] || "?"}
                            </div>
                            <div className={`flex flex-col max-w-[70%] ${msg.sender_id === parseInt(localStorage.getItem('userId')) ? 'items-end' : ''}`}>
                                <div className="flex gap-2 items-center mb-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{msg.sender_name}</span>
                                    <span className="text-[7px] font-mono opacity-20">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.sender_id === parseInt(localStorage.getItem('userId')) ? 'bg-cyan-500 text-black rounded-tr-none' : isDark ? 'bg-white/5 text-white rounded-tl-none border border-white/5' : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Input Area */}
                <div className={`p-6 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50/30'}`}>
                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-all duration-500" />
                        <div className="relative flex gap-3">
                            <div className={`flex-1 flex items-center rounded-2xl border transition-all ${isDark ? 'bg-black/60 border-white/10 focus-within:border-cyan-500/50' : 'bg-white border-slate-200 focus-within:border-cyan-400 focus-within:shadow-xl shadow-slate-200/20'}`}>
                                <button type="button" className={`p-4 transition-colors ${isDark ? 'text-white/20 hover:text-white' : 'text-slate-300 hover:text-slate-600'}`}>
                                    <Paperclip size={18} />
                                </button>
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Execute transmission..."
                                    className="flex-1 bg-transparent py-4 text-xs outline-none font-medium placeholder:text-white/5"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={`px-8 rounded-2xl flex items-center justify-center transition-all bg-cyan-500 text-black shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

