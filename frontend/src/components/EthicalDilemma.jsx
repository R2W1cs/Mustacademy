import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, CheckCircle2 } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";

const EthicalDilemma = ({ dilemma }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedOption, setSelectedOption] = useState(null);

    if (!dilemma) return null;

    const { scenario, options } = dilemma;

    return (
        <div className={`rounded-[2rem] overflow-hidden border transition-all ${isDark ? 'bg-[#0a0e1a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-indigo-100/50'}`}>
            {/* HEADER */}
            <div className={`px-6 py-4 flex items-center gap-3 border-b ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
                <Scale size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Socratic Dilemma
                </span>
            </div>

            {/* SCENARIO */}
            <div className="p-8">
                <p className={`text-base leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {scenario}
                </p>

                {/* OPTIONS */}
                <div className="space-y-3">
                    {options.map((option, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => setSelectedOption(idx)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOption === idx
                                    ? (isDark ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-indigo-50 border-indigo-500')
                                    : (isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-50 border-slate-200 hover:border-slate-300')
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${selectedOption === idx ? (isDark ? 'text-white' : 'text-indigo-900') : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                                    {option.label}
                                </span>
                                {selectedOption === idx && (
                                    <CheckCircle2 size={18} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* FEEDBACK */}
                <AnimatePresence mode="wait">
                    {selectedOption !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`mt-8 p-6 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <Scale size={16} className={isDark ? 'text-amber-400 mt-1' : 'text-amber-600 mt-1'} />
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                        Philosophical Analysis: {options[selectedOption].alignment}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {options[selectedOption].feedback}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EthicalDilemma;
