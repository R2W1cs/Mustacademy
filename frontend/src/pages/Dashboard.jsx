import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/axios";
import {
    Bell, Search, ArrowRight, Brain,
    Activity, TrendingUp, ChevronLeft, PenTool,
    Target, Sparkles, Briefcase, MessageSquare,
    Heart, Star, Coffee
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import { 
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
    PolarRadiusAxis, Radar, AreaChart, CartesianGrid, XAxis, 
    YAxis, Tooltip, Area, Defs, LinearGradient, Stop 
} from 'recharts';

// Mock data removed (fetching real data now)
import { io } from "socket.io-client";
import { useSocket } from "../hooks/useSocket";

// Helper for relative time
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const LeaderboardModal = lazy(() => import("../components/LeaderboardModal"));
const AiMentorModal = lazy(() => import("../components/AiMentorModal"));
const QuizModal = lazy(() => import("../components/QuizModal"));
const InterviewPrepModal = lazy(() => import("../components/InterviewPrepModal"));
const MultiplayerQuizModal = lazy(() => import("../components/MultiplayerQuizModal"));
const ScholarlyFeedbackModal = lazy(() => import("../components/ScholarlyFeedbackModal"));
const DashboardSkeleton = lazy(() => import("../components/DashboardSkeleton"));
import StreakWidget from "../components/StreakWidget";

export default function Dashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [contrib, setContrib] = useState(null);
    const [notifications, setNotifications] = useState([]); // Real-time pulse data
    const [error, setError] = useState(null);
    const [skillMode, setSkillMode] = useState('general'); // 'general' or 'academic'
    const [selectedWeek, setSelectedWeek] = useState(null); // null means showing all weeks

    // Modal States
    const [showMentor, setShowMentor] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showInterview, setShowInterview] = useState(false);
    const [showMultiplayer, setShowMultiplayer] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null); // For submit modal
    const [hoveredTrend, setHoveredTrend] = useState(null); // For hover tooltips
    const socket = useSocket();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Try to fetch real data with a decent timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s API timeout

                const [statsRes, contribRes, notifRes] = await Promise.all([
                    api.get("/dashboard/stats", { signal: controller.signal }),
                    api.get("/contributions/me", { signal: controller.signal }),
                    api.get("/notifications", { signal: controller.signal })
                ]);

                clearTimeout(timeoutId);
                setStats(statsRes.data);
                if (statsRes.data?.user?.name) {
                    localStorage.setItem("userName", statsRes.data.user.name);
                }
                setContrib(contribRes.data);
                setNotifications(notifRes.data);
                setError(null);
            } catch (err) {
                console.warn("Dashboard API unavailable, switching to offline mode.", err);
                // Graceful degrades to Mock Data
                // Graceful degrades but DO NOT show fake data (it confuses users)
                // Just let stats remain null (skeleton will show) or set simple empty state if preferred.
                // For now, we set error to trigger the error UI if we want, OR we just leave it loading.
                // Better: Set error to show the "Issue" screen.
                setError("Unable to retrieve live telemetry.");
            }
        };

        loadData();

        // Use standardized Socket hook (already called at top level)

        socket.on("notification_received", (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
        });
        // cleanup is handled by hook singleton, but we can off our specific listener
        return () => socket.off("notification_received");
    }, []);


    // If error exists but we have data (fallback), don't show error screen
    if (error && !stats) {
        return (
            <div className={`min-h-screen flex items-center justify-center flex-col gap-4 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-red-500 text-xl font-bold">⚠️ Connection Issue</div>
                <p className="text-sm opacity-70">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700">Retry</button>
            </div>
        );
    }

    if (!stats) return <DashboardSkeleton isDark={isDark} />;

    const streak = stats.streak_count || 0;
    const userName = stats.user?.name || "Scholar";
    const userInitial = userName.charAt(0);
    const asc = contrib?.stats?.current_asc || 0;

    // Dynamic "Cute" styles
    const themeClass = isDark ? "bg-[#050810] text-white" : "light bg-[#FAFAFF] text-gray-900";
    const cardClass = isDark
        ? "glass-morphism rounded-[2.5rem] border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        : "bg-white/80 backdrop-blur-xl rounded-[2.5rem] border-red-50 hover:border-red-200 transition-all duration-500 shadow-[0_15px_35px_rgba(192,22,54,0.05)]";
    const textMuted = isDark ? "text-slate-400 font-medium" : "text-slate-500 font-medium";
    const headingColor = isDark ? "text-white tracking-tight" : "text-slate-900";
    const accentColor = isDark ? "#00f2ff" : "#FF4D6D"; // Softer Red/Pink for "cute"
    const accentGlow = isDark ? "rgba(0, 242, 255, 0.4)" : "rgba(255, 77, 109, 0.2)";

    return (
        <div className={`animate-fade-in group relative overflow-hidden ${themeClass}`}>
            {/* Global Cute Glows */}
            <div className={`absolute top-[-10%] left-[-5%] w-[40%] h-[40%] ${isDark ? 'bg-indigo-500/10' : 'bg-pink-400/10'} blur-[120px] rounded-full pointer-events-none transition-colors duration-1000`}></div>
            <div className={`absolute bottom-[20%] right-[-10%] w-[35%] h-[50%] ${isDark ? 'bg-cyan-500/10' : 'bg-blue-400/10'} blur-[150px] rounded-full pointer-events-none transition-colors duration-1000`}></div>
                      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                {/* Header Section */}
                <header className="mb-10 animate-fade-in relative z-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Welcome & Metrics Group */}
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                            <div>
                                <h1 className={`text-2xl font-black mb-1 ${headingColor}`}>Welcome back, {userName.split(' ')[0]}! 👋</h1>
                                <p className={`text-xs ${textMuted}`}>Ready to continue your precision learning journey?</p>
                            </div>

                            {/* Repositioned Metrics */}
                            <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-cyan-500" />
                                    <span>Brain Power: <span className={headingColor}>{Math.round(asc / 10)}%</span></span>
                                </div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-2">
                                    <Coffee size={14} className="text-orange-500" />
                                    <span>Focus Vibe: <span className={headingColor}>{streak > 0 ? "On Fire" : "Ready"}</span></span>
                                </div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-2">
                                    <Heart size={14} className="text-pink-500" />
                                    <span>Daily Love: <span className={headingColor}>{streak}</span></span>
                                </div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-indigo-500" />
                                    <span>Elite Rank: <span className={headingColor}>Alpha</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Group (Notifications + Search) */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`group/notif p-2.5 rounded-xl transition-all relative ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                <Bell className={isDark ? "text-gray-400 group-hover/notif:text-amber-400" : "text-gray-600"} size={18} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050810]"></span>
                                )}
                            </button>

                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                                className={`group/search p-2.5 rounded-xl transition-all flex items-center gap-3 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                <Search className={isDark ? "text-gray-400 group-hover/search:text-cyan-400" : "text-gray-600"} size={18} />
                                <div className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black transition-colors ${isDark ? 'bg-black/20 border-white/10 text-gray-500' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <span>CTRL</span>
                                    <span>K</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* 1. Skill Overview (2/3) */}
                    <div className={`lg:col-span-2 p-6 lg:p-8 rounded-2xl border transform hover:-translate-y-1 ${cardClass}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className={`text-xl font-semibold mb-1 tracking-tight ${headingColor}`}>Skill Overview</h2>
                                <p className={textMuted}>Your current proficiency across topics</p>
                            </div>
                            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setSkillMode('general')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${skillMode === 'general' ? (isDark ? 'bg-[#6366f1] text-white shadow-sm' : 'bg-red-600 text-white shadow-sm') : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    General
                                </button>
                                <button
                                    onClick={() => setSkillMode('academic')}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${skillMode === 'academic' ? (isDark ? 'bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'bg-red-600 text-white shadow-sm') : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Academic
                                </button>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            {stats?.skills?.[skillMode]?.length > 0 ? (
                                <RadarChart data={stats.skills[skillMode]}>
                                    <PolarGrid stroke={isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(192, 22, 54, 0.1)"} />
                                    <PolarAngleAxis dataKey="skill" tick={{ fill: isDark ? "#94a3b8" : "#C01636", fontSize: 13 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Proficiency"
                                        dataKey="value"
                                        stroke={accentColor}
                                        fill={accentColor}
                                        fillOpacity={0.15}
                                        strokeWidth={3}
                                    />
                                </RadarChart>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <Brain className="w-10 h-10 text-gray-400 mb-3 opacity-50" />
                                    <p className="text-sm text-gray-500 max-w-[200px]">Begin exploring {skillMode} topics to populate this chart.</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* 2. Streak Widget (1/3) */}
                    <div className="lg:col-span-1">
                        <StreakWidget
                            streak={stats.streak || 0}
                            lastActive={stats.lastActive}
                            weeklyProgress={stats.weeklyProgress?.flatMap(w => w.days || []) || []}
                            isDark={isDark}
                        />
                    </div>

                    {/* 3. Weekly Progress (Full Width) */}
                    <div className={`lg:col-span-3 p-6 lg:p-8 rounded-2xl border transform hover:-translate-y-1 ${cardClass}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className={`text-xl font-semibold mb-1 tracking-tight ${headingColor}`}>
                                    {selectedWeek ? `${selectedWeek.week} Breakdown` : 'Weekly Progress'}
                                </h2>
                                <p className={textMuted}>
                                    {selectedWeek ? 'Daily learning hours for this week' : 'Your learning hours over the past weeks'}
                                </p>
                            </div>
                            {selectedWeek ? (
                                <button
                                    onClick={() => setSelectedWeek(null)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                    <ChevronLeft size={16} /> Back to Weeks
                                </button>
                            ) : (
                                <TrendingUp className="w-5 h-5 text-[#10b981]" />
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            {stats?.weeklyProgress?.length > 0 ? (
                                <AreaChart
                                    data={selectedWeek ? selectedWeek.days : stats.weeklyProgress}
                                    onClick={(e) => {
                                        if (!selectedWeek && e?.activePayload?.[0]?.payload) {
                                            setSelectedWeek(e.activePayload[0].payload);
                                        }
                                    }}
                                    style={{ cursor: selectedWeek ? 'default' : 'pointer' }}
                                >
                                    <defs>
                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(192, 22, 54, 0.05)"} vertical={false} />
                                    <XAxis dataKey={selectedWeek ? "day" : "week"} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                                            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(192, 22, 54, 0.1)",
                                            borderRadius: "12px",
                                            color: isDark ? "#fff" : "#000",
                                            fontSize: "12px",
                                            boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.5)" : "0 10px 30px rgba(0,0,0,0.1)"
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        stroke={accentColor}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHours)"
                                        dot={{ fill: accentColor, r: 4, strokeWidth: 0, fillOpacity: 0.8 }}
                                        activeDot={{ r: 6, stroke: accentColor, strokeWidth: 2, fill: '#fff' }}
                                    />
                                </AreaChart>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                                    <TrendingUp className="w-5 h-5 mr-3 opacity-50" />
                                    No learning activity recorded yet.
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* 4. Learning Insights (2/3) */}
                    <div className={`lg:col-span-2 p-6 rounded-2xl border transform hover:-translate-y-1 ${cardClass}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                                <Brain size={20} className="text-cyan-500" />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold ${headingColor}`}>Learning Insights</h3>
                                <p className={`text-xs ${textMuted}`}>AI-analyzed performance patterns</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        🟢 Strengths
                                    </p>
                                    <div className="space-y-2">
                                        {(stats.skills?.general || [])
                                            .filter(s => s.level >= 60)
                                            .slice(0, 2)
                                            .map((s, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.skill}</span>
                                                    <span className="text-[10px] font-black text-emerald-500">{s.value}%</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                        🟡 Needs Work
                                    </p>
                                    <div className="space-y-2">
                                        {(stats.skills?.general || [])
                                            .filter(s => s.level > 0 && s.level < 60)
                                            .sort((a, b) => a.level - b.level)
                                            .slice(0, 2)
                                            .map((s, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-medium truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.skill}</span>
                                                    <span className="text-[10px] font-black text-amber-500">{s.value}%</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-red-50 border-red-100'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-red-600'}`}>
                                        🎯 Recommended
                                    </p>
                                    <button onClick={() => navigate('/library')} className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-500' : 'text-red-600'} hover:underline`}>Library →</button>
                                </div>
                                <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {(() => {
                                        const weakest = (stats.skills?.general || []).filter(s => s.level > 0 && s.level < 60).sort((a, b) => a.level - b.level)[0];
                                        if (weakest) return `Focus on "${weakest.name}" — currently at ${weakest.level}%. Increase your depth.`;
                                        return "Excellent trajectory! Maintain focus on advanced systems protocols.";
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Academic Advisor (1/3) */}
                    <div className={`lg:col-span-1 p-6 rounded-2xl border transform hover:-translate-y-1 ${cardClass}`}>
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 gradient-purple rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <span className="text-xl">🎓</span>
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${headingColor}`}>Advisor</h3>
                                    <p className={`text-xs ${textMuted}`}>Session construct</p>
                                </div>
                            </div>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg"></span>
                        </div>
                        <p className={`text-xs mb-6 leading-relaxed ${isDark ? 'text-purple-200/70' : 'text-slate-600'}`}>
                            "Build momentum and unlock new protocols. Your advisor is ready."
                        </p>
                        <button onClick={() => setShowMentor(true)} className={`w-full group px-4 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center space-x-3 text-white shadow-2xl hover:scale-[1.02] active:scale-95 ${isDark ? 'gradient-purple shadow-purple-900/40' : 'bg-[#C01636] shadow-red-900/30'}`}>
                            <MessageSquare size={14} className="group-hover:rotate-12 transition-transform" />
                            <span className="uppercase tracking-widest">Construct Blueprint</span>
                        </button>
                    </div>

                    {/* 6. Precision Boardroom (1.5/3 -> treated as 1/2 in a 2-col nested or just col-span-1 each) */}
                    {/* Since it's a 3rd col grid, let's make them both span 1.5 if we want center, or just span 1 and leave a gap? Better to have a separate grid for the bottom pair. */}
                </div>

                {/* Bottom Row Feature Pair */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Interview Boardroom Card */}
                    <div
                        onClick={() => navigate('/interview-boardroom')}
                        className={`group relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${cardClass}`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <Briefcase size={80} className={isDark ? "text-indigo-500" : "text-red-500"} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-indigo-500/10' : 'bg-red-50'}`}>
                                <Target size={24} className={isDark ? "text-indigo-500" : "text-red-600"} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${headingColor}`}>Precision Boardroom</h3>
                            {stats?.stats?.lastInterview ? (
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className={textMuted}>Last Session:</span>
                                        <span className={`font-black uppercase tracking-wider px-2 py-0.5 rounded ${isDark ? 'text-indigo-500 bg-indigo-500/10' : 'text-red-600 bg-red-50'}`}>
                                            {stats.stats.lastInterview.target_job}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className={textMuted}>Status:</span>
                                        <span className={`font-black ${stats.stats.lastInterview.current_phase === 'CLOSING' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {stats.stats.lastInterview.current_phase === 'CLOSING' ? 'COMPLETED' : 'IN PROGRESS'}
                                        </span>
                                    </div>
                                    <div className={`text-[10px] leading-relaxed italic p-2 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        "Focus on system design fundamentals for your next round."
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-sm mb-4 leading-relaxed ${textMuted}`}>
                                    Simulate high-pressure technical interviews with real-time feedback and AI analysis tailored to your profile.
                                </p>
                            )}
                            <div className={`flex items-center text-[10px] font-black uppercase tracking-[0.2em] gap-2 ${isDark ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-red-600'}`}>
                                Enter Session <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Creator Corner Card */}
                    <div
                        onClick={() => navigate('/creator-corner')}
                        className={`group relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${cardClass}`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                            <PenTool size={80} className={isDark ? "text-amber-500" : "text-red-500"} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-amber-500/10' : 'bg-red-50'}`}>
                                <Sparkles size={24} className={isDark ? "text-amber-500" : "text-red-600"} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${headingColor}`}>Creator Studio</h3>
                            {stats?.stats?.projectStats?.joined_projects > 0 || stats?.stats?.projectStats?.owned_projects > 0 ? (
                                <div className="space-y-3 mb-4">
                                    <div className="flex gap-2">
                                        <div className={`flex-1 p-2 rounded-xl border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-50 border-red-100'}`}>
                                            <p className={`text-[9px] font-black uppercase ${isDark ? 'text-amber-500' : 'text-red-600'}`}>Joined</p>
                                            <p className={`text-lg font-black ${headingColor}`}>{stats.stats.projectStats.joined_projects}</p>
                                        </div>
                                        <div className={`flex-1 p-2 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                                            <p className="text-[9px] font-black text-emerald-500 uppercase">Owned</p>
                                            <p className={`text-lg font-black ${headingColor}`}>{stats.stats.projectStats.owned_projects}</p>
                                        </div>
                                    </div>
                                    {stats.stats.recentActivity?.length > 0 && (
                                        <div className="space-y-1.5 opacity-80">
                                            {stats.stats.recentActivity.slice(0, 1).map((act, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                                    <Activity size={10} className={isDark ? "text-amber-500" : "text-red-600"} />
                                                    <span className={textMuted}>Mission Update:</span>
                                                    <span className={`font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{act.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className={`text-sm mb-4 leading-relaxed ${textMuted}`}>
                                    Forge your own learning protocols, publish research, and contribute to the platform's knowledge ecosystem.
                                </p>
                            )}
                            <div className={`flex items-center text-sm font-bold uppercase tracking-widest gap-2 ${isDark ? 'text-amber-500' : 'text-red-600'}`}>
                                Start Building <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALS */}
                <AnimatePresence>
                    {showMentor && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <Suspense fallback={<div className="text-white">Loading Mentor...</div>}>
                                <AiMentorModal onClose={() => setShowMentor(false)} />
                            </Suspense>
                        </div>
                    )}

                    {showQuiz && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <Suspense fallback={<div className="text-white">Loading Quiz...</div>}>
                                <QuizModal onClose={() => setShowQuiz(false)} />
                            </Suspense>
                        </div>
                    )}
                    {showFeedback && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <Suspense fallback={<div className="text-white">Loading Feedback...</div>}>
                                <ScholarlyFeedbackModal onClose={() => setShowFeedback(false)} />
                            </Suspense>
                        </div>
                    )}
                    {showInterview && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                            <Suspense fallback={<div className="text-white">Loading Boardroom...</div>}>
                                <InterviewPrepModal onClose={() => setShowInterview(false)} />
                            </Suspense>
                        </div>
                    )}
                    {showMultiplayer && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center">
                            <Suspense fallback={<div className="text-white">Initializing Arena...</div>}>
                                <MultiplayerQuizModal onClose={() => setShowMultiplayer(false)} />
                            </Suspense>
                        </div>
                    )}
                    {showLeaderboard && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <Suspense fallback={<div className="text-white">Loading Rankings...</div>}>
                                <LeaderboardModal onClose={() => setShowLeaderboard(false)} isDark={isDark} />
                            </Suspense>
                        </div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
}

