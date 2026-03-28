import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../auth/ThemeContext";

export default function NotFound() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-6 text-center transition-colors ${isDark ? 'bg-[#050810] text-white' : 'bg-white text-gray-900'}`}>
            {/* Ambient glow */}
            <div className={`fixed inset-0 pointer-events-none ${isDark ? 'opacity-30' : 'opacity-10'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] bg-indigo-500" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-lg"
            >
                {/* 404 number */}
                <div className={`text-[140px] font-black leading-none tracking-tighter mb-4 select-none ${isDark ? 'text-white/5' : 'text-gray-900/5'}`}>
                    404
                </div>

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <span className={`text-2xl font-black ${isDark ? 'text-indigo-400' : 'text-red-500'}`}>?</span>
                </div>

                <h1 className={`text-3xl font-black uppercase italic tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Signal Lost
                </h1>
                <p className={`text-sm leading-relaxed mb-10 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    This node doesn't exist in the matrix. It may have been moved, deleted, or never synthesized.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-slate-300 hover:border-white/20 hover:text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800'}`}
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        Neural Hub
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
