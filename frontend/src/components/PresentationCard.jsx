import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Cpu, Code, Layers, Info, CheckCircle } from "lucide-react";

export default function PresentationCard({ scene, isDark }) {
    if (!scene) return null;

    const IconMap = {
        concept_card: Info,
        architecture_blueprint: Layers,
        code_forge: Code,
        performance: Zap,
        security: Shield,
        system: Cpu
    };

    const Icon = IconMap[scene.visual_type] || Cpu;

    const renderSafe = (content) => {
        if (typeof content === 'string') return content;
        if (typeof content === 'object' && content !== null) {
            const keys = Object.keys(content);
            if (keys.length > 0) {
                const val = content[keys[0]];
                return typeof val === 'string' && val.length > 0 ? `${keys[0]}: ${val}` : keys[0];
            }
            return JSON.stringify(content);
        }
        return String(content);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -30 }}
            className={`relative w-full h-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden border p-12 flex flex-col justify-center gap-8 ${isDark
                ? 'bg-slate-900/40 border-slate-800 shadow-lg'
                : 'bg-white border-slate-200 shadow-lg'
                }`}
        >
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
                {/* Grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative z-10 flex flex-col gap-10">
                <div className="items-center flex gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        <Icon size={32} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em] mb-1">
                            {scene.visual_type?.replace('_', ' ') || 'CONCEPT'}
                        </span>
                        <h2 className="text-4xl font-black tracking-tight uppercase text-foreground">
                            {scene.title}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6">
                        <ul className="space-y-4">
                            {scene.key_points?.map((point, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="flex items-start gap-4"
                                >
                                    <CheckCircle size={20} className="text-indigo-500 mt-1 shrink-0" />
                                    <span className="text-foreground/80 font-medium text-lg leading-relaxed">
                                        {renderSafe(point)}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className={`relative p-8 rounded-[2rem] border backdrop-blur-md flex flex-col gap-4 ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/5'
                            }`}>
                            <span className="text-emerald-400 dark:text-emerald-500 font-black text-[8px] uppercase tracking-widest">
                                Primary Insight
                            </span>
                            <p className={`text-2xl font-black italic leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                "{renderSafe(scene.primary_insight)}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {/* Dots handled by parent */}
            </div>
        </motion.div>
    );
}

