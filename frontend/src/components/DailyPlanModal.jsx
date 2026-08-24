import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Clock, Zap, Play, Brain, GraduationCap } from "lucide-react";
import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

const TECHNIQUES = [
    {
        id: "pomodoro",
        name: "Pomodoro Protocol",
        desc: "High-intensity bursts with frequent cognitive resets.",
        work: 25,
        break: 5,
        icon: <Clock size={20} className="text-red-500" />
    },
    {
        id: "deep_work",
        name: "Deep Work Block",
        desc: "Sustained focus for complex architectural problems.",
        work: 90,
        break: 20,
        icon: <Brain size={20} className="text-blue-500" />
    },
    {
        id: "flow",
        name: "Flow State",
        desc: "Moderate blocks optimized for coding momentum.",
        work: 50,
        break: 10,
        icon: <Zap size={20} className="text-amber-500" />
    }
];

export default function DailyPlanModal({ onClose, onPlanGenerated }) {
    const { theme } = useTheme();
    const isDark = theme !== "light";
    const [step, setStep] = useState(1);
    const [hours, setHours] = useState(4);
    const [selectedTechnique, setSelectedTechnique] = useState("pomodoro");
    const [plan, setPlan] = useState(null);

    const shell = isDark
        ? "bg-[#0f1729] border-white/10 text-white"
        : "bg-white border-slate-200 text-slate-900 shadow-2xl shadow-slate-200/70";
    const headerBg = isDark ? "border-white/5 bg-[#0a0e1a]" : "border-slate-100 bg-gradient-to-r from-rose-50 via-white to-indigo-50";
    const title = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-white/40" : "text-slate-500";
    const soft = isDark ? "text-white/60" : "text-slate-600";
    const soft2 = isDark ? "text-white/50" : "text-slate-500";
    const soft3 = isDark ? "text-white/30" : "text-slate-400";
    const card = isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200";
    const cardActive = isDark
        ? "bg-[#FFD700]/10 border-[#FFD700] ring-1 ring-[#FFD700]"
        : "bg-amber-50 border-amber-400 ring-1 ring-amber-300";

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await api.get("/ai/daily-plan/today");
                if (res.data) {
                    setPlan(res.data);
                    setStep(3);
                }
            } catch {
                console.warn("No existing plan found");
            }
        };
        fetchExisting();
    }, []);

    const generatePlan = async () => {
        setStep(2);
        try {
            await new Promise((r) => setTimeout(r, 2000));
            const res = await api.post("/ai/daily-plan/generate", {
                hours,
                technique: selectedTechnique,
            });
            setPlan(res.data);
            setStep(3);
            if (onPlanGenerated) onPlanGenerated(res.data);
        } catch (err) {
            console.error("Full error object:", err);
            let errorMessage = "Failed to generate plan. ";
            if (err.response) {
                errorMessage += `\n\nServer Error (${err.response.status}):\n`;
                errorMessage += err.response.data?.message || err.response.statusText;
                if (err.response.data?.error) {
                    errorMessage += `\n\nDetails: ${err.response.data.error}`;
                }
            } else if (err.request) {
                errorMessage += "\n\nNo response from server. Is the backend running?";
            } else {
                errorMessage += `\n\nError: ${err.message}`;
            }
            alert(errorMessage);
            setStep(1);
        }
    };

    const regeneratePlan = async () => {
        try {
            const today = new Date().toISOString().split("T")[0];
            await api.delete(`/ai/daily-plan/${today}`);
        } catch (err) {
            console.error("Failed to delete plan:", err);
        }
        setPlan(null);
        setStep(1);
    };

    return (
        <motion.div
            className={`${shell} w-full max-w-4xl h-[80vh] rounded-3xl border flex flex-col overflow-hidden relative`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
        >
            <div className={`p-6 border-b flex justify-between items-center ${headerBg}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <GraduationCap className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${title}`}>Daily Study Builder</h2>
                        <p className={`text-xs font-mono ${muted}`}>PROFESSOR MODE: ACTIVE</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition ${isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"}`}
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative">
                {step === 1 && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center mb-8">
                            <h3 className={`text-2xl font-bold mb-2 ${title}`}>Architect Your Day</h3>
                            <p className={soft}>How much time can you dedicate to mastery today?</p>
                        </div>

                        <div className={`p-6 rounded-2xl border ${card}`}>
                            <div className="flex justify-between mb-4">
                                <span className={`text-sm font-bold uppercase tracking-widest ${soft}`}>Duration</span>
                                <span className="text-2xl font-bold text-amber-500">{hours} Hours</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value, 10))}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 ${isDark ? "bg-white/10" : "bg-slate-200"}`}
                            />
                            <div className={`flex justify-between mt-2 text-xs font-mono ${soft3}`}>
                                <span>1h</span>
                                <span>6h</span>
                                <span>12h</span>
                            </div>
                        </div>

                        <div>
                            <span className={`text-sm font-bold uppercase tracking-widest block mb-4 ${soft}`}>Select Protocol</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {TECHNIQUES.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTechnique(t.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                                            selectedTechnique === t.id
                                                ? cardActive
                                                : `${card} ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`
                                        }`}
                                    >
                                        <div className="mb-3">{t.icon}</div>
                                        <h4 className={`font-bold mb-1 ${selectedTechnique === t.id ? "text-amber-600" : title}`}>{t.name}</h4>
                                        <p className={`text-xs mb-3 ${soft2}`}>{t.desc}</p>
                                        <div className={`flex items-center gap-2 text-[10px] font-mono ${soft3}`}>
                                            <span className={`px-2 py-1 rounded ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>{t.work}m Work</span>
                                            <span className={`px-2 py-1 rounded ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>{t.break}m Break</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generatePlan}
                            className="w-full py-4 rounded-xl text-black font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-300 shadow-xl shadow-amber-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                        >
                            <Zap size={18} />
                            Generate Optimization Plan
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 relative mb-6">
                            <div className={`absolute inset-0 rounded-full border-4 ${isDark ? "border-white/10" : "border-slate-200"}`} />
                            <div className="absolute inset-0 rounded-full border-t-4 border-amber-400 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain size={32} className="text-amber-500 animate-pulse" />
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${title}`}>Professor is Optimizing...</h3>
                        <p className={`max-w-md mx-auto ${soft2}`}>
                            Calculating cognitive load, constructing learning path, and minimizing context switching penalties.
                        </p>
                    </div>
                )}

                {step === 3 && plan && (
                    <div>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className={`text-2xl font-bold mb-1 ${title}`}>Today&apos;s Blueprint</h3>
                                <p className={`text-sm ${soft2}`}>
                                    {new Date(plan.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                                    {" • "}
                                    <span className="text-amber-500 capitalize">{String(plan.technique || "").replace("_", " ")} Mode</span>
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg border text-xs font-mono ${isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                                {plan.schedule?.length || 0} Sessions Total
                            </div>
                        </div>

                        <div className={`relative border-l ml-4 space-y-8 pb-12 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                            {(plan.schedule || []).map((block, i) => (
                                <div key={i} className="relative pl-8 group">
                                    <div
                                        className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ring-4 ${
                                            isDark ? "ring-[#0f1729]" : "ring-white"
                                        } ${block.type === "work" ? "bg-amber-400" : "bg-emerald-500"}`}
                                    />
                                    <div
                                        className={`p-5 rounded-xl border transition-all ${
                                            block.type === "work"
                                                ? isDark
                                                    ? "bg-white/5 border-white/10 hover:border-amber-400/30"
                                                    : "bg-white border-slate-200 hover:border-amber-300 shadow-sm"
                                                : isDark
                                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                                    : "bg-emerald-50 border-emerald-200"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span
                                                className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${
                                                    block.type === "work"
                                                        ? isDark
                                                            ? "bg-amber-400/20 text-amber-300"
                                                            : "bg-amber-100 text-amber-700"
                                                        : isDark
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-emerald-100 text-emerald-700"
                                                }`}
                                            >
                                                {block.type === "work" ? "Focus Block" : "Recovery"}
                                            </span>
                                            <div className={`flex items-center gap-1 text-xs font-mono ${soft3}`}>
                                                <Clock size={12} />
                                                {block.time} • {block.duration}m
                                            </div>
                                        </div>
                                        <h4 className={`text-lg font-bold mb-1 ${title}`}>{block.action}</h4>
                                        <p className={`text-sm mb-3 ${soft2}`}>
                                            {block.type === "work"
                                                ? "Maintain absolute focus. No distractions allowed."
                                                : "Step away from the screen. Hydrate and reset."}
                                        </p>
                                        {block.sub_tasks?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {block.sub_tasks.map((task, stIdx) => (
                                                    <span
                                                        key={stIdx}
                                                        className={`text-[10px] px-2 py-1 rounded-md border ${
                                                            isDark ? "bg-white/5 border-white/5 text-white/40" : "bg-slate-50 border-slate-200 text-slate-500"
                                                        }`}
                                                    >
                                                        • {task}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                                                    isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                <Play size={12} /> Start Timer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`mt-12 pt-8 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                            <button
                                onClick={regeneratePlan}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/30 text-white/70 hover:text-amber-300"
                                        : "bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-700"
                                }`}
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
