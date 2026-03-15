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
        <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
            </div>

            <div className="w-full max-w-7xl h-[85vh] relative z-10 flex flex-col">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-7xl font-black text-white uppercase tracking-tighter mb-4">Boardroom Alpha</h1>
                    <div className="flex items-center justify-center gap-4">
                        <span className="h-1 w-20 bg-indigo-600 rounded-full" />
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">Neural Interview Simulation Active</p>
                        <span className="h-1 w-20 bg-indigo-600 rounded-full" />
                    </div>
                </div>

                <div className="flex-1 bg-slate-950/50 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <BoardroomModal isPage={true} onClose={() => navigate(-1)} />
                </div>
            </div>
        </div>
    );
}
