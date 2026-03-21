import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, AlertCircle, Mic, MicOff, Send, Bot } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../auth/ThemeContext';

export default function InteractivePodcastPlayer({ topic }) {
    const { isDark } = useTheme();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [error, setError] = useState(null);

    const audioRef = useRef(null);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const utteranceRef = useRef(null); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    useEffect(() => {
        // Setup Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return stopAllAudio;
    }, [topic]);

    const startSession = () => {
        setHasStarted(true);
        const greeting = `Welcome to the studio. Today we're exploring ${topic?.title || "this topic"}. I'm Dr. Nova. What would you like to know?`;
        setMessages([{ role: 'assistant', content: greeting }]);
        playAudio(greeting, 'expert');
    };

    const stopAllAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const baseURL = import.meta.env.VITE_API_URL || (isProduction ? "https://mustacademy-backend.onrender.com" : "http://localhost:5000");

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isGenerating) return;

        const userMsg = inputValue.trim();
        setInputValue("");
        stopAllAudio();

        const updatedMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(updatedMessages);
        setIsGenerating(true);
        setError(null);

        try {
            const res = await axios.post(`${baseURL}/api/ai/interactive-podcast`, {
                topicTitle: topic?.title,
                history: updatedMessages
            });

            const replyText = res.data.reply;
            setMessages([...updatedMessages, { role: 'assistant', content: replyText }]);
            
            await playAudio(replyText, 'expert');

        } catch (err) {
            console.error("Failed to fetch interactive response:", err);
            setError("Failed to generate response. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const playAudio = async (text, speaker) => {
        stopAllAudio();
        setIsPlaying(true);

        try {
            const encodedText = encodeURIComponent(text);
            const encodedTopic = encodeURIComponent(topic?.title || '');
            const url = `${baseURL}/api/ai/podcast/speech?text=${encodedText}&speaker=${speaker}&topicTitle=${encodedTopic}&index=0`;
            
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => setIsPlaying(false);
            
            audio.onerror = () => {
                console.warn("[Neural-Audio] Hosted Audio failed, falling back to browser synthesis.");
                playBrowserFallback(text);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        playBrowserFallback(text);
                    }
                });
            }
        } catch (err) {
            playBrowserFallback(text);
        }
    };

    const playBrowserFallback = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const maleVoices = voices.filter(v => 
                    v.name.includes('David') || 
                    v.name.includes('Google UK English Male') ||
                    v.name.includes('Mark')
                );

                utterance.voice = maleVoices[0] || voices[0];
                utterance.rate = 1.05;
                utterance.pitch = 1.0;
                utteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
            }
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
            console.error("Speech fallback failed:", e);
            setIsPlaying(false);
        };
    };

    return (
        <div className={`mt-8 rounded-xl border p-6 flex flex-col h-[600px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300
            ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center`}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Interactive Tutor
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dr. Nova</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                        {isPlaying ? (
                            <span className="flex h-3 w-3 relative items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                        ) : (
                            <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></span>
                        )}
                        <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isPlaying ? 'SPEAKING' : 'IDLE'}
                        </span>
                    </div>
                    
                    <button
                        onClick={stopAllAudio}
                        disabled={!isPlaying}
                        className={`p-2.5 rounded-full transition-all ${isPlaying ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 shadow-sm' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed hidden'}`}
                    >
                        <Pause size={18} fill="currentColor" />
                    </button>
                </div>
            </div>

            {!hasStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className={`p-6 rounded-full ${isDark ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Mic size={48} />
                    </div>
                    <div className="text-center max-w-sm">
                        <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Ready to talk?</h4>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start your interactive tutoring session. You can type or use your microphone to ask questions.
                        </p>
                        <button
                            onClick={startSession}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            Start Session
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Chat History */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4 custom-scrollbar">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : isDark ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className={`rounded-2xl px-5 py-4 rounded-bl-none border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className={`p-3 mb-4 rounded-lg flex items-center gap-2 text-sm ${
                    isDark ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Input Dock */}
            <form onSubmit={handleSubmit} className="flex gap-3 relative mt-auto pt-2">
                <div className="relative flex-1 group">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask Prof. Nova something..."
                        disabled={isGenerating}
                        className={`w-full rounded-2xl pl-5 pr-14 py-4 outline-none transition-all ${
                            isDark 
                            ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                            : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isGenerating}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                            isListening 
                            ? 'bg-red-100 text-red-600 animate-pulse outline outline-2 outline-red-200' 
                            : isDark 
                                ? 'bg-gray-700 text-gray-400 hover:text-indigo-400 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>
                
                <button
                    type="submit"
                    disabled={!inputValue.trim() || isGenerating}
                    className={`p-4 rounded-2xl flex items-center justify-center transition-all ${
                        inputValue.trim() && !isGenerating
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95'
                        : isDark ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Send size={20} className={inputValue.trim() && !isGenerating ? 'ml-1' : ''} />
                </button>
            </form>
            </>
            )}
        </div>
    );
}
