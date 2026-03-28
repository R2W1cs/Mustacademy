import { useEffect, useState, Suspense, lazy, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/axios";
import {
    Bell, ArrowRight, Brain, Flame, TrendingUp, Target, Sparkles,
    MessageSquare, Swords, Trophy, Zap, BookOpen, Users, Award,
    ChevronRight, FileText, Star, Shield, Briefcase, Activity,
    CheckCircle, Clock, BarChart2, GitBranch
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useSocket } from "../hooks/useSocket";

/* ─── Lazy modals ─────────────────────────────────────────────────────────── */
const LeaderboardModal     = lazy(() => import("../components/LeaderboardModal"));
const AiMentorModal        = lazy(() => import("../components/AiMentorModal"));
const QuizModal            = lazy(() => import("../components/QuizModal"));
const InterviewPrepModal   = lazy(() => import("../components/InterviewPrepModal"));
const MultiplayerQuizModal = lazy(() => import("../components/MultiplayerQuizModal"));
const ScholarlyFeedbackModal = lazy(() => import("../components/ScholarlyFeedbackModal"));

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const timeAgo = (date) => {
    if (!date) return 'Just now';
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60)    return 'Just now';
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
};

const RANKS = [
    { min: 31, label: 'Zenith',  color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
    { min: 16, label: 'Omega',   color: '#22d3ee', glow: 'rgba(34,211,238,0.3)'  },
    { min: 6,  label: 'Sigma',   color: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
    { min: 1,  label: 'Alpha',   color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
    { min: 0,  label: 'Novice',  color: '#94a3b8', glow: 'rgba(148,163,184,0.15)'},
];
const getRank = (n) => RANKS.find(r => n >= r.min) || RANKS[4];

const greetingFor = (h) => h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

/* ─── SVG Ring Progress ───────────────────────────────────────────────────── */
function Ring({ pct = 0, size = 88, stroke = 7, color = '#6366f1', children }) {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: 'stroke-dasharray 1s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">{children}</div>
        </div>
    );
}

/* ─── Activity bar tooltip ────────────────────────────────────────────────── */
const DayTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-2.5 py-1.5 rounded-lg bg-[#0d1222] border border-white/10 text-xs shadow-xl">
            <p className="text-slate-400 text-[10px]">{label}</p>
            <p className="text-white font-bold">{payload[0].value} pts</p>
        </div>
    );
};

/* ─── Skill radar tooltip ─────────────────────────────────────────────────── */
const SkillTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-2.5 py-1.5 rounded-lg bg-[#0d1222] border border-white/10 text-xs shadow-xl">
            <p className="text-slate-400 text-[10px]">{payload[0]?.payload?.skill}</p>
            <p className="text-indigo-300 font-bold">{payload[0].value}%</p>
        </div>
    );
};

/* ─── Fade-up wrapper ─────────────────────────────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
    >
        {children}
    </motion.div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { theme } = useTheme();
    const isDark    = theme === 'dark';
    const navigate  = useNavigate();
    const socket    = useSocket();

    const [stats,         setStats]         = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [error,         setError]         = useState(null);
    const [showNotif,     setShowNotif]     = useState(false);
    const [skillTab,      setSkillTab]      = useState('general');

    // Modals
    const [showMentor,      setShowMentor]      = useState(false);
    const [showQuiz,        setShowQuiz]        = useState(false);
    const [showFeedback,    setShowFeedback]    = useState(false);
    const [showInterview,   setShowInterview]   = useState(false);
    const [showMultiplayer, setShowMultiplayer] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const ctrl = new AbortController();
                const tid  = setTimeout(() => ctrl.abort(), 10000);
                const [s, n] = await Promise.all([
                    api.get("/dashboard/stats",  { signal: ctrl.signal }),
                    api.get("/notifications",    { signal: ctrl.signal }),
                ]);
                clearTimeout(tid);
                setStats(s.data);
                if (s.data?.user?.name) localStorage.setItem("userName", s.data.user.name);
                setNotifications(n.data || []);
            } catch { setError("Unable to reach the server."); }
        })();
        socket.on("notification_received", (n) => setNotifications(p => [n, ...p]));
        return () => socket.off("notification_received");
    }, []);

    /* ── error ── */
    if (error && !stats) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050810] text-white">
            <div className="text-red-400 font-bold text-lg">Connection issue</div>
            <p className="text-sm text-slate-400">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold">Retry</button>
        </div>
    );

    /* ── skeleton ── */
    if (!stats) return (
        <div className={`min-h-screen ${isDark ? 'bg-[#050810]' : 'bg-[#f1f5f9]'} p-6 md:p-8 space-y-6 animate-pulse`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
                <div className="h-16 w-64 rounded-2xl bg-white/[0.04]" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 rounded-xl bg-white/[0.04]" />)}
                </div>
            </div>
            <div className="h-32 w-full rounded-2xl bg-white/[0.04]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/[0.04]" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2 h-64 rounded-2xl bg-white/[0.04]" />
                <div className="md:col-span-2 h-64 rounded-2xl bg-white/[0.04]" />
                <div className="md:col-span-1 h-64 rounded-2xl bg-white/[0.04]" />
            </div>
        </div>
    );

    /* ─── Derived ─────────────────────────────────────────────────────────── */
    const userName     = stats.user?.name || "Scholar";
    const firstName    = userName.split(' ')[0];
    const streak       = stats.streak || 0;
    const completedT   = parseInt(stats.topics?.completed_topics) || 0;
    const totalT       = parseInt(stats.topics?.total_topics) || 1;
    const progressPct  = stats.progressPercent || 0;
    const cohortPct    = stats.cohortPercentile || 0;
    const rank         = getRank(completedT);
    const onlinePeers  = stats.onlinePeers || [];
    const totalContrib = (stats.stats?.summaries || 0) + (stats.stats?.cheatsheets || 0) + (stats.stats?.reviews || 0);

    const rawDays   = (stats.weekDays || []).map((day, i) => ({ day, pts: stats.weeklyActivity?.[i] || 0 }));
    const hasActivity = rawDays.some(d => d.pts > 0);
    const skills    = stats.skills?.[skillTab] || [];
    const courseStats = stats.courses || {};

    /* ─── Design tokens ───────────────────────────────────────────────────── */
    const bg    = isDark ? '#050810'          : '#f1f5f9';
    const card  = isDark
        ? 'bg-[#090d1c] border border-white/[0.06]'
        : 'bg-white border border-slate-200/70 shadow-sm';
    const muted = isDark ? 'text-slate-500'   : 'text-slate-400';
    const head  = isDark ? 'text-white'       : 'text-slate-900';
    const sub   = isDark ? 'text-slate-400'   : 'text-slate-500';

    /* ─── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className="h-full w-full relative" style={{ background: bg }}>

            {/* ambient glow */}
            {isDark && <>
                <div className="fixed top-0 left-1/3 w-[600px] h-[400px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
                <div className="fixed bottom-0 right-0 w-[500px] h-[400px] rounded-full pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 70%)' }} />
            </>}

            <div className="relative z-10 w-full px-3 md:px-5 lg:px-7 py-5 space-y-4">

                {/* ══════════════════════════════════════════════════════════
                    HEADER
                ══════════════════════════════════════════════════════════ */}
                <FadeUp delay={0}>
                    <div className={`${card} rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
                        {/* Greeting + meta */}
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg text-white"
                                     style={{ background: `linear-gradient(135deg, ${rank.color}44, ${rank.color}22)`, border: `2px solid ${rank.color}55`, boxShadow: `0 0 20px ${rank.glow}` }}>
                                    {firstName[0].toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090d1c]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className={`font-black text-lg tracking-tight ${head}`}>{greetingFor(new Date().getHours())}, {firstName}</h1>
                                    <span className="text-lg">👋</span>
                                </div>
                                <p className={`text-[11px] ${sub}`}>
                                    Year {stats.user?.year} · Semester {stats.user?.semester} · {firstName}'s learning command center
                                </p>
                            </div>
                        </div>

                        {/* Vitals strip */}
                        <div className="flex items-center flex-wrap gap-3">
                            {/* Streak */}
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${streak > 0 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : isDark ? 'bg-white/5 text-slate-500 border border-white/10' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                <Flame size={13} /> {streak > 0 ? `${streak}d streak` : 'No streak yet'}
                            </div>
                            {/* Rank */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
                                 style={{ background: `${rank.color}12`, borderColor: `${rank.color}30`, color: rank.color }}>
                                <Award size={13} /> {rank.label}
                            </div>
                            {/* Online */}
                            {onlinePeers.length > 0 && (
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    {onlinePeers.length} online
                                </div>
                            )}
                            {/* Bell */}
                            <div className="relative">
                                <button onClick={() => setShowNotif(v => !v)}
                                    className={`relative p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                                    <Bell size={16} className={sub} />
                                    {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                                </button>
                                <AnimatePresence>
                                    {showNotif && <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            className={`absolute right-0 mt-2 w-72 p-3 rounded-2xl border shadow-2xl z-50 ${isDark ? 'bg-[#0d1222] border-white/10' : 'bg-white border-slate-200'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Notifications</span>
                                                {notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-[10px] text-indigo-400 font-bold">Clear all</button>}
                                            </div>
                                            {notifications.length === 0 ? (
                                                <p className={`text-xs text-center py-6 ${muted}`}>All caught up ✓</p>
                                            ) : notifications.slice(0, 5).map((n, i) => (
                                                <div key={i} className={`p-2.5 rounded-xl mb-1.5 text-xs ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                                    <p className={`font-medium ${head}`}>{n.text || n.message}</p>
                                                    <p className={`text-[10px] mt-0.5 ${muted}`}>{timeAgo(n.date || n.createdAt)}</p>
                                                </div>
                                            ))}
                                        </motion.div>
                                    </>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </FadeUp>

                {/* ══════════════════════════════════════════════════════════
                    CONTINUE LEARNING BANNER
                ══════════════════════════════════════════════════════════ */}
                <FadeUp delay={0.05}>
                    {stats?.stats?.lastActiveCourse ? (
                        <div className={`${card} rounded-2xl p-5 flex items-center gap-5`}
                             style={{ background: isDark ? 'linear-gradient(135deg, #0d1030 0%, #090d1c 100%)' : undefined }}>
                            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center"
                                 style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                                <BookOpen size={22} className="text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Continue Learning</p>
                                <h3 className={`font-black text-base truncate ${head}`}>{stats.stats.lastActiveCourse.title}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden max-w-xs ${isDark ? 'bg-white/8' : 'bg-slate-100'}`}>
                                        <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                                             style={{ width: `${stats.stats.lastActiveCourse.progress ?? 0}%`, boxShadow: '0 0 8px rgba(99,102,241,0.6)' }} />
                                    </div>
                                    <span className={`text-xs font-bold ${sub}`}>{stats.stats.lastActiveCourse.progress ?? 0}%</span>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/courses/${stats.stats.lastActiveCourse.id}/roadmap`)}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Resume <ArrowRight size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className={`${card} rounded-2xl p-5 flex items-center gap-5`}>
                            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                                <BookOpen size={22} className="text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Get started</p>
                                <h3 className={`font-black text-base ${head}`}>Choose your first course</h3>
                                <p className={`text-xs mt-0.5 ${muted}`}>Browse the library and enroll to begin tracking progress</p>
                            </div>
                            <button onClick={() => navigate('/library')}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all">
                                Browse <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </FadeUp>

                {/* ══════════════════════════════════════════════════════════
                    ROW 1 — ROADMAP · ACTIVITY · COHORT
                ══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* ── ROADMAP PROGRESS ── */}
                    <FadeUp delay={0.1}>
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Roadmap Progress</p>
                                    <h3 className={`font-black text-base mt-0.5 ${head}`}>Your Journey</h3>
                                </div>
                                <GitBranch size={18} className="text-indigo-400" />
                            </div>

                            <div className="flex items-center gap-5 mb-5">
                                <Ring pct={progressPct} size={80} stroke={6} color="#6366f1">
                                    <span className={`text-lg font-black ${head}`}>{progressPct}%</span>
                                </Ring>
                                <div className="space-y-2.5 flex-1">
                                    {[
                                        { label: 'Topics done',   val: completedT,                     total: totalT,              color: '#6366f1' },
                                        { label: 'In progress',   val: parseInt(courseStats.in_progress)||0, total: parseInt(courseStats.total)||1, color: '#f59e0b' },
                                        { label: 'Completed',     val: parseInt(courseStats.completed)||0,   total: parseInt(courseStats.total)||1, color: '#10b981' },
                                    ].map(({ label, val, total, color }) => (
                                        <div key={label}>
                                            <div className="flex justify-between mb-1">
                                                <span className={`text-[10px] ${muted}`}>{label}</span>
                                                <span className="text-[10px] font-bold" style={{ color }}>{val}/{total}</span>
                                            </div>
                                            <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-slate-100'}`}>
                                                <div className="h-full rounded-full transition-all duration-1000"
                                                     style={{ width: `${total > 0 ? (val / total) * 100 : 0}%`, background: color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => navigate('/library')}
                                className={`mt-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'} transition-colors`}>
                                View all courses <ChevronRight size={12} />
                            </button>
                        </div>
                    </FadeUp>

                    {/* ── THIS WEEK ACTIVITY ── */}
                    <FadeUp delay={0.13}>
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>This Week</p>
                                    <h3 className={`font-black text-base mt-0.5 ${head}`}>Daily Activity</h3>
                                </div>
                                <BarChart2 size={18} className="text-cyan-400" />
                            </div>
                            {hasActivity ? (
                                <ResponsiveContainer width="100%" height={130}>
                                    <BarChart data={rawDays} barSize={26} barCategoryGap="25%">
                                        <XAxis dataKey="day" tick={{ fill: isDark ? '#475569' : '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<DayTip />} cursor={false} />
                                        <Bar dataKey="pts" radius={[5, 5, 2, 2]}>
                                            {rawDays.map((d, i) => (
                                                <Cell key={i} fill={d.pts > 0 ? (isDark ? '#22d3ee' : '#0891b2') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
                                    <BarChart2 size={32} className={`${muted} opacity-20`} />
                                    <p className={`text-xs text-center ${muted}`}>Complete a topic to<br />see your activity</p>
                                </div>
                            )}
                            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center justify-between`}>
                                <span className={`text-[10px] ${muted}`}>Total this week</span>
                                <span className={`text-sm font-black ${head}`}>
                                    {rawDays.reduce((a, d) => a + d.pts, 0)} pts
                                </span>
                            </div>
                        </div>
                    </FadeUp>

                    {/* ── COHORT STANDING ── */}
                    <FadeUp delay={0.16}>
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Cohort Standing</p>
                                    <h3 className={`font-black text-base mt-0.5 ${head}`}>vs. Classmates</h3>
                                </div>
                                <Users size={18} className="text-emerald-400" />
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <Ring pct={cohortPct} size={72} stroke={6} color="#10b981">
                                    <span className={`text-sm font-black ${head}`}>{cohortPct}%</span>
                                </Ring>
                                <div>
                                    <p className={`text-xs ${muted} mb-1`}>You're ahead of</p>
                                    <p className={`text-2xl font-black ${head}`}>{cohortPct}%</p>
                                    <p className={`text-xs ${muted}`}>of your year group</p>
                                </div>
                            </div>

                            {/* Online peers avatars */}
                            {onlinePeers.length > 0 && (
                                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/4' : 'bg-slate-50'} mb-3`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted} mb-2`}>Online now</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {onlinePeers.slice(0, 6).map((peer, i) => (
                                            <div key={i} title={peer.name}
                                                 className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-300">
                                                {peer.name?.[0]?.toUpperCase()}
                                            </div>
                                        ))}
                                        {onlinePeers.length > 6 && (
                                            <span className={`text-[10px] font-bold ${muted}`}>+{onlinePeers.length - 6}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setShowLeaderboard(true)}
                                className={`mt-auto text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'} transition-colors`}>
                                View leaderboard <ChevronRight size={12} />
                            </button>
                        </div>
                    </FadeUp>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    ROW 2 — SKILLS · CONTRIBUTIONS · CAREER
                ══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">

                    {/* ── SKILL RADAR (2/5) ── */}
                    <FadeUp delay={0.2} className="xl:col-span-2">
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Skill Map</p>
                                    <h3 className={`font-black text-base mt-0.5 ${head}`}>Proficiency</h3>
                                </div>
                                <div className={`flex text-[10px] font-bold rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                    {['general', 'academic'].map(tab => (
                                        <button key={tab} onClick={() => setSkillTab(tab)}
                                            className={`px-3 py-1.5 capitalize transition-all ${skillTab === tab
                                                ? (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                                                : (isDark ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-700')
                                            }`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {skills.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={skills} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                                        <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="skill" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                                        <Tooltip content={<SkillTip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
                                    <Brain size={32} className={`${muted} opacity-20`} />
                                    <p className={`text-xs text-center ${muted}`}>Enroll in courses to<br />build your skill map</p>
                                </div>
                            )}
                        </div>
                    </FadeUp>

                    {/* ── CONTRIBUTIONS (1.5/5) ── */}
                    <FadeUp delay={0.23} className="xl:col-span-2">
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col gap-3`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Contributions</p>
                                    <h3 className={`font-black text-base mt-0.5 ${head}`}>Knowledge Given</h3>
                                </div>
                                <Star size={18} className="text-amber-400" />
                            </div>

                            {/* Big total */}
                            <div className="flex items-end gap-2">
                                <span className={`text-5xl font-black tracking-tighter ${head}`}>{totalContrib}</span>
                                <span className={`text-xs ${muted} mb-2`}>contributions</span>
                            </div>

                            {/* Breakdown */}
                            {[
                                { icon: FileText, label: 'Summaries',   val: stats.stats?.summaries   || 0, color: 'text-indigo-400',  bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'  },
                                { icon: Shield,   label: 'Cheatsheets', val: stats.stats?.cheatsheets || 0, color: 'text-cyan-400',    bg: isDark ? 'bg-cyan-500/10'   : 'bg-cyan-50'    },
                                { icon: Star,     label: 'Reviews',     val: stats.stats?.reviews     || 0, color: 'text-amber-400',   bg: isDark ? 'bg-amber-500/10'  : 'bg-amber-50'   },
                            ].map(({ icon: Icon, label, val, color, bg }) => (
                                <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={color} />
                                        <span className={`text-xs font-semibold ${sub}`}>{label}</span>
                                    </div>
                                    <span className={`text-sm font-black ${head}`}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </FadeUp>

                    {/* ── CAREER ORACLE (0.5/5 → full) ── */}
                    <FadeUp delay={0.26} className="xl:col-span-1">
                        <div className={`${card} rounded-2xl p-5 h-full flex flex-col`}
                             style={{ background: isDark ? 'linear-gradient(160deg, #0d0f22 0%, #090d1c 100%)' : undefined }}>
                            <div className="flex items-center justify-between mb-3">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>Career Oracle</p>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            </div>

                            <div className="mb-3">
                                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">Target Role</p>
                                <p className={`font-black text-sm ${head}`}>{stats.user?.dream_job || stats.careerOracle?.targetRole || 'Not set'}</p>
                            </div>

                            {stats.careerOracle?.alignment && (
                                <div className="mb-3">
                                    <div className="flex justify-between mb-1">
                                        <span className={`text-[10px] ${muted}`}>Alignment</span>
                                        <span className="text-[10px] font-bold text-indigo-400">{stats.careerOracle.alignment}%</span>
                                    </div>
                                    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-slate-100'}`}>
                                        <div className="h-full rounded-full bg-indigo-500 transition-all"
                                             style={{ width: `${stats.careerOracle.alignment}%` }} />
                                    </div>
                                </div>
                            )}

                            {stats.careerOracle?.recommendation && (
                                <p className={`text-[11px] leading-relaxed ${muted} flex-1`}>
                                    "{stats.careerOracle.recommendation}"
                                </p>
                            )}

                            <button onClick={() => navigate('/career')}
                                className={`mt-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600'} transition-colors`}>
                                Career path <ChevronRight size={12} />
                            </button>
                        </div>
                    </FadeUp>
                </div>

                {/* ══════════════════════════════════════════════════════════
                    ROW 3 — QUICK ACTIONS
                ══════════════════════════════════════════════════════════ */}
                <FadeUp delay={0.3}>
                    <div className={`${card} rounded-2xl p-5`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${muted} mb-4`}>Quick Actions</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: Swords,        label: 'Neural Clash',   desc: 'Live quiz battle',     color: '#818cf8', bg: 'rgba(129,140,248,0.08)', action: () => setShowMultiplayer(true) },
                                { icon: Zap,           label: 'Quick Quiz',     desc: 'Test knowledge now',   color: '#22d3ee', bg: 'rgba(34,211,238,0.08)',  action: () => setShowQuiz(true)        },
                                { icon: Trophy,        label: 'Leaderboard',    desc: 'Global rankings',      color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  action: () => setShowLeaderboard(true) },
                                { icon: MessageSquare, label: 'Creator Corner', desc: 'Projects & submissions', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', action: () => navigate('/creator-corner') },
                            ].map(({ icon: Icon, label, desc, color, bg, action }) => (
                                <button key={label} onClick={action}
                                    className={`group relative p-4 rounded-xl text-left transition-all hover:-translate-y-0.5 active:scale-[0.97] border ${isDark ? 'border-white/[0.06] hover:border-white/[0.12]' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
                                    style={{ background: isDark ? bg : undefined }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                                         style={{ background: bg, border: `1px solid ${color}22` }}>
                                        <Icon size={17} style={{ color }} />
                                    </div>
                                    <p className={`font-bold text-sm ${head}`}>{label}</p>
                                    <p className={`text-[11px] mt-0.5 ${muted}`}>{desc}</p>
                                    <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={14} style={{ color }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </FadeUp>

                {/* ══════════════════════════════════════════════════════════
                    ROW 4 — FEATURE SPOTLIGHT
                ══════════════════════════════════════════════════════════ */}
                <FadeUp delay={0.35}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-10">

                        {/* Interview Boardroom */}
                        <div onClick={() => navigate('/interview-boardroom')}
                             className={`group ${card} rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all relative overflow-hidden`}>
                            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                                 style={{ background: '#6366f1' }} />
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-indigo-500/10 border border-indigo-500/20">
                                <Target size={20} className="text-indigo-400" />
                            </div>
                            <h3 className={`font-black text-sm mb-1 ${head}`}>Interview Boardroom</h3>
                            {stats?.stats?.lastInterview ? (
                                <div className="space-y-1.5">
                                    <p className={`text-[11px] ${muted}`}>Last: <span className="text-indigo-400 font-semibold">{stats.stats.lastInterview.target_job}</span></p>
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${stats.stats.lastInterview.current_phase === 'CLOSING' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        <CheckCircle size={10} />
                                        {stats.stats.lastInterview.current_phase === 'CLOSING' ? 'Completed' : 'In progress'}
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-[11px] ${muted}`}>Simulate real technical interviews with AI</p>
                            )}
                            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:gap-2 transition-all">
                                Enter session <ArrowRight size={12} />
                            </div>
                        </div>

                        {/* Creator Corner */}
                        <div onClick={() => navigate('/creator-corner')}
                             className={`group ${card} rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all relative overflow-hidden`}>
                            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                                 style={{ background: '#f59e0b' }} />
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-amber-500/10 border border-amber-500/20">
                                <Sparkles size={20} className="text-amber-400" />
                            </div>
                            <h3 className={`font-black text-sm mb-1 ${head}`}>Creator Corner</h3>
                            {(stats?.stats?.projectStats?.owned_projects > 0 || stats?.stats?.projectStats?.joined_projects > 0) ? (
                                <div className="flex gap-2">
                                    <div className={`flex-1 p-2 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                        <p className={`text-[10px] ${muted}`}>Owned</p>
                                        <p className={`text-lg font-black ${head}`}>{stats.stats.projectStats.owned_projects}</p>
                                    </div>
                                    <div className={`flex-1 p-2 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                                        <p className={`text-[10px] ${muted}`}>Joined</p>
                                        <p className={`text-lg font-black ${head}`}>{stats.stats.projectStats.joined_projects}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-[11px] ${muted}`}>Build projects and collaborate with peers</p>
                            )}
                            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:gap-2 transition-all">
                                Explore <ArrowRight size={12} />
                            </div>
                        </div>

                        {/* AI Mentor */}
                        <div onClick={() => setShowMentor(true)}
                             className={`group ${card} rounded-2xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all relative overflow-hidden`}>
                            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                                 style={{ background: '#10b981' }} />
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-500/10 border border-emerald-500/20">
                                <Brain size={20} className="text-emerald-400" />
                            </div>
                            <h3 className={`font-black text-sm mb-1 ${head}`}>AI Mentor</h3>
                            <p className={`text-[11px] ${muted}`}>Get a personalized learning blueprint from Dr. Nova</p>
                            <div className={`mt-2 flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg w-fit ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                            </div>
                            <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:gap-2 transition-all">
                                Ask Dr. Nova <ArrowRight size={12} />
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>

            {/* ── MODALS ──────────────────────────────────────────────────── */}
            <AnimatePresence>
                {showMentor && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><Suspense fallback={null}><AiMentorModal onClose={() => setShowMentor(false)} /></Suspense></div>}
                {showQuiz && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><Suspense fallback={null}><QuizModal isOpen={true} onClose={() => setShowQuiz(false)} /></Suspense></div>}
                {showFeedback && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><Suspense fallback={null}><ScholarlyFeedbackModal onClose={() => setShowFeedback(false)} /></Suspense></div>}
                {showInterview && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"><Suspense fallback={null}><InterviewPrepModal onClose={() => setShowInterview(false)} /></Suspense></div>}
                {showMultiplayer && <div className="fixed inset-0 z-[120] flex items-center justify-center"><Suspense fallback={null}><MultiplayerQuizModal onClose={() => setShowMultiplayer(false)} /></Suspense></div>}
                {showLeaderboard && <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><Suspense fallback={null}><LeaderboardModal onClose={() => setShowLeaderboard(false)} isDark={isDark} /></Suspense></div>}
            </AnimatePresence>
        </div>
    );
}
