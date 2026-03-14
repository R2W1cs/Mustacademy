import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/axios";
import {
    Bell, Search, ArrowRight, Brain,
    Activity, TrendingUp, ChevronLeft, PenTool,
    Target, Sparkles, Briefcase, MessageSquare
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

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

// Restored Components
// Lazy Loaded Components
const AiMentorModal = lazy(() => import("../components/AiMentorModal"));

const QuizModal = lazy(() => import("../components/QuizModal"));

const DailyPlanModal = lazy(() => import("../components/DailyPlanModal"));
const InterviewPrepModal = lazy(() => import("../components/InterviewPrepModal"));
const MultiplayerQuizModal = lazy(() => import("../components/MultiplayerQuizModal"));
import StreakWidget from "../components/StreakWidget";

const DashboardSkeleton = lazy(() => import("../components/DashboardSkeleton"));
const LeaderboardModal = lazy(() => import("../components/LeaderboardModal"));

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
    const [showResume, setShowResume] = useState(false);
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

    // Dynamic styles based on theme
    const themeClass = isDark ? "bg-[#050810] text-white" : "light bg-[#FFFFFF] text-gray-900";
    const sidebarClass = isDark ? "bg-[#0a0e1a] border-white/5" : "bg-white border-gray-100 border-r";
    const cardClass = isDark
        ? "glass-morphism hover:border-white/20 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-500"
        : "glass-morphism hover:border-red-200 hover:scale-[1.01] transition-all duration-500 shadow-sm";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500 font-medium";
    const headingColor = isDark ? "text-white" : "text-slate-900";

    return (
        <div className={`animate-fade-in group ${themeClass}`}>
            <div className="max-w-[1800px] mx-auto">
                {/* Header Section */}
                <header className="mb-6 animate-fade-in relative z-20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className={`text-3xl font-black mb-1 ${headingColor}`}>Welcome back, {userName.split(' ')[0]}! 👋</h1>
                            <p className={textMuted}>Ready to continue your precision learning journey?</p>
                        </div>
                        <div className="flex items-center space-x-4 relative">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-3 rounded-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${showNotifications ? 'ring-2 ring-cyan-500' : ''}`}
                                >
                                    <Bell className={isDark ? "text-gray-400" : "text-gray-600"} size={20} />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className={`absolute right-0 mt-4 w-80 rounded-2xl border shadow-2xl z-[100] overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
                                        >
                                            <div className={`p-4 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                                                <h4 className={`font-bold text-sm ${headingColor}`}>Incoming Transmissions</h4>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(n => (
                                                        <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${isDark ? 'border-gray-800' : 'border-gray-50'}`}>
                                                            <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{n.message}</p>
                                                            <span className="text-[10px] text-gray-500 mt-1 block">{timeAgo(n.created_at)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className={`p-4 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        No new transmissions.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                                className={`group/search p-3 rounded-lg transition flex items-center gap-3 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                <Search className={isDark ? "text-gray-400 group-hover/search:text-cyan-400" : "text-gray-600"} size={20} />
                                <div className={`hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-black transition-colors ${isDark ? 'bg-black/20 border-white/10 text-gray-500' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <span>CTRL</span>
                                    <span>K</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Gradient Banner - Changes based on theme */}
                    <div className={`rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-500 glass-border ${isDark ? 'gradient-purple shadow-purple-900/20' : 'bg-[#C01636] shadow-red-900/20'}`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm mb-1 font-medium">Continue your Knowledge Map</p>
                                <h2 className="text-2xl font-bold mb-2 text-white">Project Basics</h2>
                                <p className="text-white/90 text-sm mb-4">Master the fundamentals in your learning journey</p>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className={`bg-white px-6 py-2.5 rounded-lg font-bold transition flex items-center space-x-2 shadow-lg ${isDark ? 'text-purple-700 hover:bg-purple-50' : 'text-red-600 hover:bg-gray-50'}`}
                                >
                                    <span>Continue Learning</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
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
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${skillMode === 'academic' ? (isDark ? 'bg-[#6366f1] text-white shadow-sm' : 'bg-red-600 text-white shadow-sm') : 'text-gray-500 hover:text-gray-300'}`}
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
                                        stroke={isDark ? "#6366f1" : "#C01636"}
                                        fill={isDark ? "#6366f1" : "#C01636"}
                                        fillOpacity={0.25}
                                        strokeWidth={2}
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
                                <LineChart
                                    data={selectedWeek ? selectedWeek.days : stats.weeklyProgress}
                                    onClick={(e) => {
                                        if (!selectedWeek && e?.activePayload?.[0]?.payload) {
                                            setSelectedWeek(e.activePayload[0].payload);
                                        }
                                    }}
                                    style={{ cursor: selectedWeek ? 'default' : 'pointer' }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(192, 22, 54, 0.05)"} vertical={false} />
                                    <XAxis dataKey={selectedWeek ? "day" : "week"} stroke="#64748b" fontSize={13} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={13} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? "#151b28" : "#ffffff",
                                            border: isDark ? "1px solid rgba(148, 163, 184, 0.1)" : "1px solid rgba(99, 102, 241, 0.2)",
                                            borderRadius: "12px",
                                            color: isDark ? "#fff" : "#000",
                                            fontSize: "14px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="hours"
                                        stroke={isDark ? "#6366f1" : "#C01636"}
                                        strokeWidth={2.5}
                                        dot={{ fill: isDark ? "#6366f1" : "#C01636", r: 5, strokeWidth: 0 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
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
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
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
                            <div className={`flex items-center text-sm font-bold uppercase tracking-widest gap-2 ${isDark ? 'text-indigo-500' : 'text-red-600'}`}>
                                Enter Session <ArrowRight size={16} />
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
                    {showResume && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <Suspense fallback={<div className="text-white">Loading Scanner...</div>}>
                                <ResumeAnalysisModal onClose={() => setShowResume(false)} />
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
