import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const AiMentorModal = ({ isOpen, onClose, context }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Load history on mount
        setLoading(true);
        api.get("/ai/history/mentor")
            .then(res => {
                const history = res.data.map(m => ({
                    sender: m.role === 'user' ? 'user' : 'ai',
                    text: m.message
                }));
                setMessages(history);
            })
            .catch(err => console.error("Failed to load history", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { sender: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/ai/chat", { message: currentInput });
            const aiMsg = { sender: "ai", text: res.data.reply, goal: res.data.goal, suggested_questions: res.data.suggested_questions };
            setMessages(prev => [...prev, aiMsg]);

            // If the teacher gave a mission, trigger dashboard refresh
            if (res.data.goal) {
                if (context?.onGoalSet) {
                    context.onGoalSet();
                }
                // Show notification for auto-assigned exercise
                const isAutoAssigned = res.data.reply?.includes("Time to apply what you've learned") ||
                    res.data.reply?.includes("I've assigned you a mission");
                if (isAutoAssigned) {
                    // Add a visual indicator in the chat
                    setMessages(prev => [...prev, {
                        sender: 'system', // Using 'system' sender for internal notifications
                        text: '🎯 **Auto-Exercise Assigned!** Check your Mission Board to complete it.',
                        timestamp: new Date()
                    }]);
                }
            }
        } catch (err) {
            const fallbackMsg = "The mentor is thinking deeply or a bit slow right now. Please try again or wait a moment!";
            setMessages(prev => [...prev, {
                sender: "ai",
                text: err.response?.data?.reply || fallbackMsg
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl h-[600px] flex flex-col relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-indigo-600">
                        👨‍🏫
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-800 leading-tight">AI Mentor</h2>
                        <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Teacher is Online
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-lg">
                    ✕
                </button>
            </div>

            {/* Chat Window */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 custom-scrollbar pr-4"
            >
                {messages.length === 0 && !loading && (
                    <div className="text-center py-10">
                        <div className="text-4xl mb-3">👋</div>
                        <p className="text-gray-500 font-medium">Hello there! I'm your CS Mentor.</p>
                        <p className="text-xs text-gray-400">Ask me anything about your courses!</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.sender === "user" ? "items-end" : m.sender === "system" ? "items-center" : "items-start"}`}>
                        {/* System Notification */}
                        {m.sender === "system" ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-md bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-4 my-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                                        🎯
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-700">{m.text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Regular Message Bubble */}
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${m.sender === "user"
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                                    }`}>
                                    {m.text}
                                </div>

                                {/* Mission Badge */}
                                {m.goal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 w-[85%] bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                                🎯
                                            </div>
                                            <span className="text-xs font-black text-amber-700 uppercase tracking-widest">New Mission Assigned!</span>
                                        </div>
                                        <p className="text-sm text-amber-900 font-medium">{m.goal.description}</p>
                                        <p className="text-[10px] text-amber-600 mt-2 italic">Check your Daily Missions board to track progress.</p>
                                    </motion.div>
                                )}

                                {/* Smart Follow-up Chips */}
                                {m.sender === "ai" && m.suggested_questions && i === messages.length - 1 && (
                                    <div className="flex flex-wrap gap-2 mt-2 w-[85%]">
                                        {m.suggested_questions.map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setInput(q); sendMessage(); }}
                                                disabled={loading}
                                                className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all font-bold cursor-pointer"
                                            >
                                                ✨ {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-2 items-center text-gray-400 text-xs ml-2">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        Constructing deep-dive analysis...
                    </div>
                )}
            </div>

            {/* Input - NEON STYLING */}
            <div className="bg-[#0f172a] p-4 border-t border-slate-700">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex gap-2 bg-[#020617] p-2 rounded-lg border border-indigo-500/30">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask your teacher... (e.g. Can you explain SQL joins?)"
                            className="flex-1 bg-transparent px-2 py-2 text-white placeholder:text-slate-500 focus:outline-none text-sm font-medium"
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 text-white px-6 rounded-md hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider"
                        >
                            Ask
                        </button>
                    </div>
                </div>
            </div>
        </motion.div >
    );
};

export default AiMentorModal;
