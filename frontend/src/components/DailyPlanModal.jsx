import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Zap, Coffee, Play, CheckCircle, Brain, GraduationCap } from "lucide-react";
import api from "../api/axios";

// Technique Constants
const TECHNIQUES = [
    {
        id: "pomodoro",
        name: "Pomodoro Protocol",
        desc: "High-intensity bursts with frequent cognitive resets.",
        work: 25,
        break: 5,
        icon: <Clock size={20} className="text-red-400" />
    },
    {
        id: "deep_work",
        name: "Deep Work Block",
        desc: "Sustained focus for complex architectural problems.",
        work: 90,
        break: 20,
        icon: <Brain size={20} className="text-blue-400" />
    },
    {
        id: "flow",
        name: "Flow State",
        desc: "Moderate blocks optimized for coding momentum.",
        work: 50,
        break: 10,
        icon: <Zap size={20} className="text-amber-400" />
    }
];

export default function DailyPlanModal({ onClose, onPlanGenerated }) {
    const [step, setStep] = useState(1); // 1=Setup, 2=Generating, 3=Plan
    const [hours, setHours] = useState(4);
    const [selectedTechnique, setSelectedTechnique] = useState("pomodoro");
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch existing plan on mount
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await api.get('/ai/daily-plan/today');
                if (res.data) {
                    setPlan(res.data);
                    setStep(3);
                }
            } catch (err) {
                console.warn("No existing plan found");
            }
        };
        fetchExisting();
    }, []);

    const generatePlan = async () => {
        setStep(2);
        setLoading(true);
        try {
            // Artificial delay for "Professor Thinking" effect
            await new Promise(r => setTimeout(r, 2000));

            const res = await api.post('/ai/daily-plan/generate', {
                hours,
                technique: selectedTechnique
            });
            setPlan(res.data);
            setStep(3);
            if (onPlanGenerated) onPlanGenerated(res.data);
        } catch (err) {
            console.error("Full error object:", err);

            // Extract detailed error message
            let errorMessage = "Failed to generate plan. ";

            if (err.response) {
                // Server responded with error
                errorMessage += `\n\nServer Error (${err.response.status}):\n`;
                errorMessage += err.response.data?.message || err.response.statusText;

                if (err.response.data?.error) {
                    errorMessage += `\n\nDetails: ${err.response.data.error}`;
                }
            } else if (err.request) {
                // Request made but no response
                errorMessage += "\n\nNo response from server. Is the backend running?";
            } else {
                // Something else happened
                errorMessage += `\n\nError: ${err.message}`;
            }

            alert(errorMessage);
            setStep(1); // Go back on error
        } finally {
            setLoading(false);
        }
    };

    const regeneratePlan = async () => {
        // Delete existing plan first
        try {
            const today = new Date().toISOString().split('T')[0];
            await api.delete(`/ai/daily-plan/${today}`);
            setPlan(null);
            setStep(1);
        } catch (err) {
            console.error("Failed to delete plan:", err);
            // Even if delete fails, allow user to go back to step 1
            setPlan(null);
            setStep(1);
        }
    };

    return (
        <motion.div
            className="bg-[#0f1729] w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0e1a]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-purple flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Daily Study Builder</h2>
                        <p className="text-xs text-white/40 font-mono">PROFESSOR MODE: ACTIVE</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 relative">

                {/* STEP 1: SETUP */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Architect Your Day</h3>
                            <p className="text-white/60">How much time can you dedicate to mastery today?</p>
                        </div>

                        {/* Slider */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between mb-4">
                                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Duration</span>
                                <span className="text-2xl font-bold text-[#FFD700]">{hours} Hours</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                            />
                            <div className="flex justify-between mt-2 text-xs text-white/30 font-mono">
                                <span>1h</span>
                                <span>6h</span>
                                <span>12h</span>
                            </div>
                        </div>

                        {/* Techniques */}
                        <div>
                            <span className="text-sm font-bold text-white/60 uppercase tracking-widest block mb-4">Select Protocol</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {TECHNIQUES.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTechnique(t.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${selectedTechnique === t.id
                                            ? 'bg-[#FFD700]/10 border-[#FFD700] ring-1 ring-[#FFD700]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="mb-3">{t.icon}</div>
                                        <h4 className={`font-bold mb-1 ${selectedTechnique === t.id ? 'text-[#FFD700]' : 'text-white'}`}>{t.name}</h4>
                                        <p className="text-xs text-white/50 mb-3">{t.desc}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
                                            <span className="bg-white/5 px-2 py-1 rounded">{t.work}m Work</span>
                                            <span className="bg-white/5 px-2 py-1 rounded">{t.break}m Break</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generatePlan}
                            className="w-full py-4 gradient-gold rounded-xl text-black font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                            <Zap size={18} />
                            Generate Optimization Plan
                        </button>
                    </div>
                )}

                {/* STEP 2: GENERATING */}
                {step === 2 && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-24 h-24 relative mb-6">
                            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                            <div className="absolute inset-0 rounded-full border-t-4 border-[#FFD700] animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain size={32} className="text-[#FFD700] animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Professor is Optimizing...</h3>
                        <p className="text-white/50 max-w-md mx-auto">
                            Calculating cognitive load, constructing learning path, and minimizing context switching penalties.
                        </p>
                    </div>
                )}

                {/* STEP 3: THE PLAN */}
                {step === 3 && plan && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Today's Blueprint</h3>
                                <p className="text-white/50 text-sm">
                                    {new Date(plan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    {' • '}
                                    <span className="text-[#FFD700] capitalize">{plan.technique.replace('_', ' ')} Mode</span>
                                </p>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-xs font-mono text-white/50">
                                {plan.schedule.length} Sessions Total
                            </div>
                        </div>

                        <div className="relative border-l border-white/10 ml-4 space-y-8 pb-12">
                            {plan.schedule.map((block, i) => (
                                <div key={i} className="relative pl-8 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-[#0f1729] ${block.type === 'work' ? 'bg-[#FFD700]' : 'bg-emerald-500'
                                        }`}></div>

                                    <div className={`p-5 rounded-xl border transition-all ${block.type === 'work'
                                        ? 'bg-white/5 border-white/10 hover:border-[#FFD700]/30'
                                        : 'bg-emerald-500/10 border-emerald-500/20'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${block.type === 'work' ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {block.type === 'work' ? 'Focus Block' : 'Recovery'}
                                            </span>
                                            <div className="flex items-center gap-1 text-white/40 text-xs font-mono">
                                                <Clock size={12} />
                                                {block.time} • {block.duration}m
                                            </div>
                                        </div>

                                        <h4 className="text-lg font-bold text-white mb-1">{block.action}</h4>
                                        <p className="text-sm text-white/50 mb-3">
                                            {block.type === 'work'
                                                ? "Maintain absolute focus. No distractions allowed."
                                                : "Step away from the screen. Hydrate and reset."}
                                        </p>

                                        {block.sub_tasks && block.sub_tasks.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {block.sub_tasks.map((task, stIdx) => (
                                                    <span key={stIdx} className="text-[10px] bg-white/5 border border-white/5 px-2 py-1 rounded-md text-white/40">
                                                        • {task}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition">
                                                <Play size={12} /> Start Timer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Regenerate Button */}
                        <div className="mt-12 pt-8 border-t border-white/5">
                            <button
                                onClick={regeneratePlan}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD700]/30 rounded-xl text-white/70 hover:text-[#FFD700] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={18} />
                                Regenerate New Plan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
