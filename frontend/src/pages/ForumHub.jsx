import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import MarketPulseFeed from "../components/MarketPulseFeed";

export default function ForumHub() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen p-6 lg:p-10 space-y-10 animate-fade-in transition-colors duration-300 ${isDark ? 'bg-[#050810]' : 'bg-slate-50'}`}>
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border transition-all ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
                            <Users size={28} />
                        </div>
                        <div className={`h-12 w-[1px] ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>Synaptic Intelligence Hub</span>
                            <h1 className={`text-3xl font-black tracking-tight leading-none uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Market Intel</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area Section */}
            <div className="pb-40">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <MarketPulseFeed isDark={isDark} />
                </motion.div>
            </div>
        </div>
    );
}

