import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyProfile, updateProfile } from "../api/profile";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../auth/ThemeContext";
import {
    User, Briefcase, BookOpen, Zap, ChevronDown, Target, Activity,
    CheckCircle, AlertCircle, Camera, ArrowLeft, Sparkles, UserCircle2
} from "lucide-react";

const DEFAULT_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Field wrapper ───────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, children, isDark }) => (
    <div className="space-y-2">
        <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            {Icon && <Icon size={12} />}
            {label}
        </label>
        {children}
    </div>
);

const inputCls = (isDark) =>
    `w-full px-5 py-4 rounded-xl border outline-none transition-all text-sm font-bold ${isDark
        ? "bg-[#0a0e1a]/80 text-white border-white/10 focus:border-indigo-500/80 focus:bg-white/5 focus:shadow-lg placeholder-white/20"
        : "bg-white text-slate-900 border-indigo-100 focus:border-indigo-400 focus:bg-white focus:shadow-lg placeholder-slate-400"}`;

const selectCls = (isDark) =>
    `${inputCls(isDark)} appearance-none cursor-pointer`;

// ─── Career options ───────────────────────────────────────────────────────────
const CAREER_OPTIONS = [
    { value: "", label: "Select your target path…", emoji: "" },
    { value: "Full-Stack Developer", label: "Full-Stack Developer", emoji: "🌐" },
    { value: "Backend Architect", label: "Backend Architect", emoji: "🛠️" },
    { value: "Frontend Architect", label: "Frontend Architect", emoji: "🎨" },
    { value: "Data Scientist", label: "Data Scientist", emoji: "📊" },
    { value: "AI Engineer", label: "AI Engineer", emoji: "֎🇦🇮" },
    { value: "Cybersecurity Specialist", label: "Cybersecurity Specialist", emoji: "🔐" },
    { value: "DevOps Engineer", label: "DevOps Engineer", emoji: "⚡" },
    { value: "Mobile Developer", label: "Mobile Developer", emoji: "📱" },
];

const COMPANY_OPTIONS = [
    { value: "Big Tech", label: "Big Tech (Google / Meta / Amazon)" },
    { value: "Startup", label: "High-Growth Startup" },
    { value: "Research", label: "Academic / R&D Lab" },
    { value: "Fintech", label: "Financial Technology" },
    { value: "Consulting", label: "Tech Consulting" },
];

const STATUS_OPTIONS = [
    { value: "online", label: "Online", color: "bg-emerald-500", ring: "ring-emerald-500/40 border-emerald-500/30 text-emerald-400" },
    { value: "away", label: "Deep Focus", color: "bg-amber-400", ring: "ring-amber-400/40 border-amber-500/30 text-amber-400" },
    { value: "offline", label: "Offline", color: "bg-slate-500", ring: "ring-slate-500/30 border-slate-500/30 text-slate-400" },
];

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ title, subtitle, icon: Icon, children, isDark }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-8 space-y-6 relative overflow-hidden group transition-colors duration-500 ${isDark
            ? "bg-white/5 border-white/10 hover:border-indigo-500/30 backdrop-blur-xl"
            : "bg-white/80 border-indigo-100 hover:border-indigo-300 shadow-xl shadow-indigo-500/5 backdrop-blur-xl"
            }`}
    >
        {/* Glow effect on hover */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[80px] pointer-events-none ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />

        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDark ? "bg-[#0a0e1a] border-white/10 text-indigo-400 shadow-lg" : "bg-white border-indigo-100 text-indigo-600 shadow-md"}`}>
                <Icon size={18} />
            </div>
            <div>
                <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
                {subtitle && <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>{subtitle}</p>}
            </div>
        </div>
        <div className={`border-t relative z-10 ${isDark ? "border-white/5" : "border-indigo-50"}`} />
        <div className="relative z-10">
            {children}
        </div>
    </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProfileSetup() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const fileRef = useRef(null);

    const [profile, setProfile] = useState({
        avatar_url: "", bio: "", passion: "",
        year: 1, semester: 1, status: "online",
        dream_job: "", target_company: "Big Tech", technical_pillar: "",
    });
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [activeStatus, setActiveStatus] = useState("online");
    const [weekDays, setWeekDays] = useState(DEFAULT_WEEK_DAYS);
    const [weeklyActivity, setWeeklyActivity] = useState([0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        getMyProfile()
            .then((res) => {
                if (res.data) {
                    setProfile({
                        ...res.data,
                        year: res.data.year || 1,
                        semester: res.data.semester || 1,
                    });
                    setPreview(res.data.avatar_url || null);
                    setActiveStatus(res.data.status || "online");
                }
            })
            .catch(() => { });

        api.get("/dashboard/stats")
            .then((res) => {
                const days = res.data?.weekDays;
                const activity = res.data?.weeklyActivity;
                setWeekDays(Array.isArray(days) && days.length ? days : DEFAULT_WEEK_DAYS);
                setWeeklyActivity(
                    Array.isArray(activity) && activity.length
                        ? activity.map((n) => Number(n) || 0)
                        : [0, 0, 0, 0, 0, 0, 0]
                );
            })
            .catch(() => {
                setWeekDays(DEFAULT_WEEK_DAYS);
                setWeeklyActivity([0, 0, 0, 0, 0, 0, 0]);
            });
    }, []);

    const weekBars = useMemo(() => {
        const max = Math.max(...weeklyActivity, 0);
        return weekDays.map((day, i) => ({
            day: String(day).slice(0, 3),
            pts: weeklyActivity[i] || 0,
            height: max > 0 ? Math.max(8, Math.round(((weeklyActivity[i] || 0) / max) * 100)) : 8,
        }));
    }, [weekDays, weeklyActivity]);

    const weekTotal = useMemo(
        () => weeklyActivity.reduce((sum, n) => sum + (Number(n) || 0), 0),
        [weeklyActivity]
    );
    const hasWeekActivity = weekTotal > 0;

    const set = (key, val) => setProfile(p => ({ ...p, [key]: val }));

    const handleImageUpload = (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const maxSide = 256;
                const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
                setPreview(dataUrl);
                set("avatar_url", dataUrl);
                setError("");
            };
            img.onerror = () => setError('Could not read that image.');
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = async () => {
        setSaving(true); setSaved(false); setError("");
        try {
            await updateProfile({
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                passion: profile.passion,
                year: Number(profile.year),
                semester: Number(profile.semester),
                status: activeStatus,
                dream_job: profile.dream_job,
                target_company: profile.target_company,
                technical_pillar: profile.technical_pillar,
            });
            setSaved(true);
            setTimeout(() => navigate("/library"), 1400);
        } catch (err) {
            const apiMsg = err.response?.data?.message || err.message;
            setError(apiMsg || "Could not save profile. Check your connection and try again.");
        } finally {
            setSaving(false);
        }
    };

    const selectedCareer = CAREER_OPTIONS.find(o => o.value === profile.dream_job);

    return (
        <div className={`min-h-screen transition-colors duration-700 pb-32 font-sans relative overflow-hidden ${isDark ? "bg-[#0a0e1a]" : "bg-gradient-to-br from-white via-indigo-50/30 to-white"}`}>

            {/* Background Ambience */}
            {isDark && (
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 sm:px-12 pt-20 lg:pt-24 pb-16 relative z-10">

                {/* ── Page header ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className={`p-3 rounded-2xl border transition-all ${isDark ? "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10" : "bg-white border-indigo-100 text-indigo-400 hover:text-indigo-600 hover:border-indigo-300 shadow-sm"}`}
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                                    Build your Identity
                                </span>
                            </div>
                            <h1 className={`text-4xl md:text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                                SCHOLAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 italic">PROFILE</span>
                            </h1>
                        </div>
                    </div>

                    <div className={`hidden md:flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-[#0f1729]/80 border-emerald-500/30 shadow-lg' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="text-right">
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/60'}`}>Clearance</p>
                            <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Verified</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* ── Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

                    {/* ── LEFT PANEL: Identity ── */}
                    <div className="space-y-8">

                        {/* Avatar card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`rounded-3xl border p-8 flex flex-col items-center gap-6 relative overflow-hidden backdrop-blur-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-indigo-100 shadow-xl shadow-indigo-500/5"}`}
                        >
                            {/* Decorative background grid in avatar card */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                            <div className="relative group z-10">
                                <div className={`absolute -inset-1 rounded-full blur bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-60 transition duration-500`} />
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`w-36 h-36 rounded-full overflow-hidden cursor-pointer relative border-4 transition-all z-10 ${isDark ? 'border-[#0a0e1a] group-hover:border-indigo-500/50' : 'border-white shadow-xl group-hover:border-indigo-100'}`}
                                >
                                    {preview ? (
                                        <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${isDark ? "bg-[#0f1729] text-indigo-500/50" : "bg-indigo-50 text-indigo-300"}`}>
                                            <UserCircle2 size={48} strokeWidth={1.5} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 text-white text-xs font-bold transition-opacity backdrop-blur-sm">
                                        <Camera size={20} />
                                        <span className="text-[10px] uppercase tracking-widest">Update uplink</span>
                                    </div>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
                            </div>

                            <div className="w-full space-y-3 z-10">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center ${isDark ? "text-white/40" : "text-indigo-400"}`}>Current Status</p>
                                <div className="flex flex-col gap-2">
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => setActiveStatus(s.value)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[11px] font-black tracking-widest uppercase transition-all ${activeStatus === s.value
                                                ? (isDark
                                                    ? `bg-[#0a0e1a] ${s.ring} shadow-lg`
                                                    : `bg-white ${s.ring} shadow-md text-slate-900`)
                                                : (isDark
                                                    ? "border-white/5 bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                                                    : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600")
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${s.color} ${activeStatus === s.value ? 'animate-pulse' : ''}`} />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Career preview — light surface to match Academic Parameters */}
                        {profile.dream_job && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-3xl border p-8 relative overflow-hidden group transition-colors duration-500 ${isDark
                                    ? "bg-white/5 border-white/10 hover:border-indigo-500/30 backdrop-blur-xl"
                                    : "bg-white/80 border-indigo-100 hover:border-indigo-300 shadow-xl shadow-indigo-500/5 backdrop-blur-xl"
                                    }`}
                            >
                                <div className={`absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[60px] pointer-events-none ${isDark ? "bg-indigo-500" : "bg-indigo-600"}`} />

                                <div className="flex items-center gap-4 relative z-10 mb-5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? "bg-[#0a0e1a] border-white/10 text-indigo-400 shadow-lg" : "bg-white border-indigo-100 text-indigo-600 shadow-md"}`}>
                                        <Target size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                                            Target Architecture
                                        </p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                                            Career destination
                                        </p>
                                    </div>
                                </div>

                                <div className={`border-t mb-5 relative z-10 ${isDark ? "border-white/5" : "border-indigo-50"}`} />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${isDark ? "bg-[#0a0e1a] border-white/10" : "bg-slate-50 border-slate-100"}`}>
                                        {selectedCareer?.emoji || "🎯"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-lg font-black tracking-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {profile.dream_job}
                                        </p>
                                        {profile.target_company && (
                                            <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                                                @ {profile.target_company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Weekly activity — replaces promotional AI Mentor-style filler */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`rounded-3xl border p-8 relative overflow-hidden group transition-colors duration-500 ${isDark
                                ? "bg-white/5 border-white/10 hover:border-indigo-500/30 backdrop-blur-xl"
                                : "bg-white/80 border-indigo-100 hover:border-indigo-300 shadow-xl shadow-indigo-500/5 backdrop-blur-xl"
                                }`}
                        >
                            <div className="flex items-center gap-4 relative z-10 mb-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? "bg-[#0a0e1a] border-white/10 text-indigo-400 shadow-lg" : "bg-white border-indigo-100 text-indigo-600 shadow-md"}`}>
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Weekly Activity</h2>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                                        Study pulse · Mon–Sun
                                    </p>
                                </div>
                            </div>

                            <div className={`border-t mb-5 relative z-10 ${isDark ? "border-white/5" : "border-indigo-50"}`} />

                            {hasWeekActivity ? (
                                <div className="relative z-10 flex items-end justify-between gap-1.5 h-28 px-0.5">
                                    {weekBars.map((bar, i) => (
                                        <div key={`${bar.day}-${i}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                            <div
                                                className={`w-full max-w-[28px] rounded-t-md transition-all ${bar.pts > 0
                                                    ? (isDark ? "bg-indigo-400/80" : "bg-indigo-500")
                                                    : (isDark ? "bg-white/10" : "bg-slate-100")
                                                    }`}
                                                style={{ height: `${bar.height}%` }}
                                                title={`${bar.pts} pts`}
                                            />
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-white/35" : "text-slate-400"}`}>
                                                {bar.day}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`relative z-10 h-28 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed ${isDark ? "border-white/10" : "border-slate-200"}`}>
                                    <Activity size={22} className={isDark ? "text-white/20" : "text-slate-300"} />
                                    <p className={`text-[10px] font-bold uppercase tracking-widest text-center px-4 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                                        No activity this week yet
                                    </p>
                                </div>
                            )}

                            <div className={`relative z-10 mt-5 pt-4 border-t flex items-center justify-between ${isDark ? "border-white/5" : "border-indigo-50"}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>
                                    Total this week
                                </span>
                                <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {weekTotal} pts
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── RIGHT PANEL: Settings ── */}
                    <div className="space-y-6">

                        {/* Academic */}
                        <Section title="Academic Parameters" subtitle="Current chronological location" icon={BookOpen} isDark={isDark}>
                            <div className="grid grid-cols-2 gap-6">
                                <Field label="Year Level" icon={null} isDark={isDark}>
                                    <div className="relative">
                                        <select value={profile.year || 1} onChange={e => set("year", Number(e.target.value))} className={selectCls(isDark)}>
                                            <option value={1} className={isDark ? "bg-[#0f1729] text-white" : "bg-white text-slate-900"}>Year 01</option>
                                            <option value={2} className={isDark ? "bg-[#0f1729] text-white" : "bg-white text-slate-900"}>Year 02</option>
                                            <option value={3} className={isDark ? "bg-[#0f1729] text-white" : "bg-white text-slate-900"}>Year 03</option>

                                        </select>
                                        <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                    </div>
                                </Field>
                                <Field label="Semester" icon={null} isDark={isDark}>
                                    <div className="relative">
                                        <select value={profile.semester || 1} onChange={e => set("semester", Number(e.target.value))} className={selectCls(isDark)}>
                                            <option value={1} className={isDark ? "bg-[#0f1729] text-white" : "bg-white text-slate-900"}>Semester 01</option>
                                            <option value={2} className={isDark ? "bg-[#0f1729] text-white" : "bg-white text-slate-900"}>Semester 02</option>
                                        </select>
                                        <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                    </div>
                                </Field>
                            </div>
                        </Section>

                        {/* Career */}
                        <Section title="Engineering Directive" subtitle="Configures your AI-generated curriculum" icon={Briefcase} isDark={isDark}>
                            <Field label="Ultimate Designation" isDark={isDark}>
                                <div className="relative">
                                    <select value={profile.dream_job || ""} onChange={e => set("dream_job", e.target.value)} className={selectCls(isDark)}>
                                        {CAREER_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className={isDark ? "bg-[#0f1729] text-white" : ""}>
                                                {o.emoji ? `${o.emoji}  ` : ""}{o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                </div>
                            </Field>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Field label="Target Infrastructure" isDark={isDark}>
                                    <div className="relative">
                                        <select value={profile.target_company || "Big Tech"} onChange={e => set("target_company", e.target.value)} className={selectCls(isDark)}>
                                            {COMPANY_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value} className={isDark ? "bg-[#0f1729] text-white" : ""}>{o.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/40" : "text-slate-400"}`} />
                                    </div>
                                </Field>
                                <Field label="Primary Tech Role" icon={Zap} isDark={isDark}>
                                    <input
                                        value={profile.technical_pillar || ""}
                                        onChange={e => set("technical_pillar", e.target.value)}
                                        placeholder="e.g. Distributed Systems"
                                        className={inputCls(isDark)}
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* Personal */}
                        <Section title="Personal Heuristics" subtitle="Your mission and technical passions" icon={User} isDark={isDark}>
                            <Field label="Mission Log" isDark={isDark}>
                                <textarea
                                    rows={4}
                                    value={profile.bio || ""}
                                    onChange={e => set("bio", e.target.value)}
                                    placeholder="What kind of engineer do you want to become? What problem will you solve?"
                                    className={`${inputCls(isDark)} resize-none leading-relaxed`}
                                />
                            </Field>
                            <Field label="Specialized Interests" isDark={isDark}>
                                <input
                                    value={profile.passion || ""}
                                    onChange={e => set("passion", e.target.value)}
                                    placeholder="e.g. AI, Web Dev, Cybersecurity, Open Source…"
                                    className={inputCls(isDark)}
                                />
                            </Field>
                        </Section>

                        {/* Feedback */}
                        <AnimatePresence>
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black uppercase tracking-widest shadow-lg"
                                >
                                    <CheckCircle size={18} /> Changes Saved. Rerouting...
                                </motion.div>
                            )}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-black uppercase tracking-widest"
                                >
                                    <AlertCircle size={18} /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom save */}
                        <div className="flex flex-col items-center gap-6 pt-12 border-t border-white/5 mt-10">
                            <div className="text-center max-w-lg">
                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-indigo-400' : 'text-slate-400'}`}>Protocol Commitment</p>
                                <p className={`text-xs leading-relaxed italic ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                                    "By saving this changes, I affirm my commitment to my engineering trajectory. Each modification recalibrates my AI-assisted learning curriculum."
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: saving ? 1 : 1.02 }}
                                whileTap={{ scale: saving ? 1 : 0.98 }}
                                disabled={saving}
                                onClick={saveProfile}
                                className={`group relative flex items-center justify-center gap-3 w-full max-w-md py-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-[0.2em] transition-all overflow-hidden ${saving
                                    ? "bg-[#0a0e1a] border border-white/10 text-white/40 cursor-not-allowed"
                                    : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg hover:shadow-lg border border-indigo-400/50"
                                    }`}
                            >
                                {saving ? (
                                    <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synchronizing...</>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
                                        <Zap size={20} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                                        Save Changes
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

