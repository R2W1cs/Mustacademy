import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewPrepModal from "../components/InterviewPrepModal";
import { useTheme } from "../auth/ThemeContext";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function InterviewPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className={`min-h-screen relative ${isDark ? 'bg-[#050810] text-white' : 'bg-slate-50 text-slate-900'}`}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30 ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-200/60'}`} />
            </div>

            <header className="relative z-10 px-4 md:px-8 pt-6 pb-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <Briefcase className="text-indigo-600" size={20} />
                    <h1 className="text-xl font-bold">Interview practice</h1>
                </div>
            </header>

            <div className="relative z-10 px-4 md:px-8 pb-8">
                <InterviewPrepModal isPage={true} onClose={() => navigate('/dashboard')} />
            </div>
        </div>
    );
}
