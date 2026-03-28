import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Zap, Lock, Headphones, Brain, Map, Star } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const FREE_FEATURES = [
    "AI Mentor chat (unlimited)",
    "All courses & topics",
    "Research Notebook",
    "Forum & Market Intel",
    "Neural Clash Arena",
    "Badge & streak system",
    "Daily plan builder",
];

const PREMIUM_FEATURES = [
    { label: "Everything in Free", highlight: false },
    { label: "Podcast generation per topic", icon: Headphones, highlight: true },
    { label: "Dr. Nova interactive masterclass", icon: Brain, highlight: true },
    { label: "AI Career Roadmap generation", icon: Map, highlight: true },
    { label: "Priority AI response speed", icon: Zap, highlight: false },
];

export default function UpgradePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const [activating, setActivating] = useState(false);
    const isPremium = localStorage.getItem('userPlan') === 'premium';

    const handleActivate = async () => {
        setActivating(true);
        try {
            await api.patch('/profile/plan');
            localStorage.setItem('userPlan', 'premium');
            toast.success('Premium activated! All features unlocked.');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            toast.error('Failed to activate. Please try again.');
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className={`min-h-screen px-4 md:px-8 lg:px-16 py-16 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 block mb-4">Access Tier</span>
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
                        Unlock <span className="text-indigo-400">Premium</span>
                    </h1>
                    <p className={`text-sm font-medium max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Activate your full academic arsenal — AI-generated podcasts, Dr. Nova masterclasses, and personalized career roadmaps.
                    </p>
                </motion.div>
            </div>

            {/* Plan Cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Free Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                    <div className="mb-8">
                        <p className={`text-[9px] font-black uppercase tracking-[0.5em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Plan</p>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Free</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Standard access</p>
                    </div>
                    <ul className="space-y-3">
                        {FREE_FEATURES.map((f, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <Check size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{f}</span>
                            </li>
                        ))}
                        <li className="flex items-center gap-3 opacity-30">
                            <Lock size={14} className="text-red-400" />
                            <span className="text-sm line-through">Podcast, Dr. Nova, Career AI</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Premium Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden ${isDark ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-indigo-50 border-indigo-300 shadow-xl shadow-indigo-100'}`}
                >
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400">Recommended</p>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-indigo-400">Premium</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full arsenal unlocked</p>
                    </div>

                    <ul className="space-y-3 relative z-10 mb-10">
                        {PREMIUM_FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <li key={i} className="flex items-center gap-3">
                                    {Icon
                                        ? <Icon size={14} className="text-indigo-400 shrink-0" />
                                        : <Check size={14} className="text-emerald-400 shrink-0" />
                                    }
                                    <span className={`text-sm font-${f.highlight ? 'bold' : 'medium'} ${f.highlight ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                                        {f.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    {isPremium ? (
                        <div className="relative z-10 w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-[11px] uppercase tracking-widest text-center">
                            Already Active ✓
                        </div>
                    ) : (
                        <button
                            onClick={handleActivate}
                            disabled={activating}
                            className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-indigo-500/20"
                        >
                            {activating ? 'Activating...' : 'Activate Premium'}
                        </button>
                    )}
                </motion.div>
            </div>

            <p className={`text-center text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Demo mode — no payment required · MUST University Project
            </p>
        </div>
    );
}
