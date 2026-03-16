import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewPrepModal from "../components/InterviewPrepModal";
import { useTheme } from "../auth/ThemeContext";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function InterviewPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Safety cleanup: Ensure body scroll is restored if the modal was active
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className={`min-h-screen p-8 relative overflow-hidden ${isDark ? 'bg-[#050810] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Premium Atmospheric Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-purple-600/30' : 'bg-purple-200/50'}`} />
                <div className={`absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-10 ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-100/40'}`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] ${isDark ? 'invert' : ''}`}
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="text-purple-500" size={20} />
                            <h1 className="text-2xl font-black tracking-tight">Interview Boardroom</h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Precision AI Simulation Protocol</p>
                    </div>
                </div>
            </header>

            <div className={`max-w-6xl mx-auto rounded-[2.5rem] border shadow-2xl overflow-hidden ${isDark ? 'bg-[#0f1729]/80 border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="p-1">
                    <InterviewPrepModal isPage={true} onClose={() => navigate(-1)} />
                </div>
            </div>
        </div>
    );
}
