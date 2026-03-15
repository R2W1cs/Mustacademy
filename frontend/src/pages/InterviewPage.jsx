import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SwainBoardroom from "../components/SwainBoardroom";
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

            <div className="w-full max-w-[1600px] h-[95vh] relative z-10 flex flex-col">
                <div className="mb-4 flex justify-between items-center px-12">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-white/90 uppercase tracking-[0.5em] mb-1">PROTOTYPE SWAIN</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                            <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em]">NEURAL UPLINK ACTIVE · SECURE</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-slate-950/50 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
                    <SwainBoardroom isPage={true} onClose={() => navigate(-1)} />
                </div>
            </div>
        </div>
    );
}
