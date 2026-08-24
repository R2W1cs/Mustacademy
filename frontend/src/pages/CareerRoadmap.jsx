import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Sparkles, ChevronRight, Star, Clock, DollarSign,
    TrendingUp, BookOpen, Code2, CheckCircle2, Circle, Globe,
    Cpu, Shield, Smartphone, BarChart2, Cloud, Gamepad2,
    Link, Server, Search, RotateCcw, AlertTriangle, Wrench,
    Layers, FlaskConical, Briefcase, Map, ListChecks, ChevronDown,
    PlayCircle, Target, Package
} from "lucide-react";
import toast from "react-hot-toast";
import { generateFullRoadmap, getCareerRoadmap } from "../api/career";
import { useTheme } from "../auth/ThemeContext";

const careersMatch = (a, b) =>
    String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const extractSavedFullRoadmap = (row) => {
    const full = row?.full_roadmap_json;
    if (!full) return null;
    const parsed = typeof full === "string" ? (() => { try { return JSON.parse(full); } catch { return null; } })() : full;
    if (!parsed?.years?.length) return null;
    if (!parsed.career && row.career_key) parsed.career = row.target_job || row.career_key;
    return parsed;
};

const CAREERS = [
    { id:"fullstack",  title:"Full-Stack Developer",      Icon:Layers,    color:"blue",   demand:"Very High", salary:"$75k-$160k",  tags:["React","Node.js","SQL"]  },
    { id:"aiml",       title:"AI / ML Engineer",          Icon:Cpu,       color:"purple", demand:"Extreme",   salary:"$100k-$220k", tags:["Python","PyTorch","Math"] },
    { id:"cybersec",   title:"Cybersecurity Engineer",    Icon:Shield,    color:"red",    demand:"High",      salary:"$80k-$170k",  tags:["Linux","Pentesting"]      },
    { id:"devops",     title:"DevOps / Cloud Engineer",   Icon:Cloud,     color:"cyan",   demand:"Very High", salary:"$85k-$180k",  tags:["Docker","K8s","AWS"]      },
    { id:"mobile",     title:"Mobile Developer",          Icon:Smartphone,color:"green",  demand:"High",      salary:"$70k-$155k",  tags:["React Native","Swift"]    },
    { id:"data",       title:"Data Scientist",            Icon:BarChart2, color:"orange", demand:"Very High", salary:"$90k-$200k",  tags:["Python","SQL","Stats"]    },
    { id:"backend",    title:"Backend Engineer",          Icon:Server,    color:"indigo", demand:"Very High", salary:"$80k-$175k",  tags:["APIs","DBs","Systems"]    },
    { id:"gamedev",    title:"Game Developer",            Icon:Gamepad2,  color:"pink",   demand:"Medium",    salary:"$60k-$130k",  tags:["Unity","C#","OpenGL"]     },
    { id:"blockchain", title:"Blockchain Developer",      Icon:Link,      color:"amber",  demand:"High",      salary:"$90k-$210k",  tags:["Solidity","Web3"]         },
    { id:"embedded",   title:"Embedded Systems Eng.",     Icon:Package,   color:"slate",  demand:"Medium",    salary:"$70k-$150k",  tags:["C/C++","RTOS","HW"]       },
];

const getC = (isDark) => ({
    blue:   {bg:"bg-blue-500/10",    ring:"border-blue-500/30",   txt: isDark ? "text-blue-400"    : "text-blue-600",    sel:"border-blue-400 bg-blue-500/15",    dot:"bg-blue-400"   },
    purple: {bg:"bg-purple-500/10",  ring:"border-purple-500/30", txt: isDark ? "text-purple-400"  : "text-purple-600",  sel:"border-purple-400 bg-purple-500/15",dot:"bg-purple-400" },
    red:    {bg:"bg-red-500/10",     ring:"border-red-500/30",    txt: isDark ? "text-red-400"     : "text-red-600",     sel:"border-red-400 bg-red-500/15",     dot:"bg-red-400"    },
    cyan:   {bg:"bg-cyan-500/10",    ring:"border-cyan-500/30",   txt: isDark ? "text-cyan-400"    : "text-cyan-600",    sel:"border-cyan-400 bg-cyan-500/15",   dot:"bg-cyan-400"   },
    green:  {bg:"bg-emerald-500/10", ring:"border-emerald-500/30",txt: isDark ? "text-emerald-400" : "text-emerald-600", sel:"border-emerald-400 bg-emerald-500/15",dot:"bg-emerald-400"},
    orange: {bg:"bg-orange-500/10",  ring:"border-orange-500/30", txt: isDark ? "text-orange-400"  : "text-orange-600",  sel:"border-orange-400 bg-orange-500/15",dot:"bg-orange-400" },
    indigo: {bg:"bg-indigo-500/10",  ring:"border-indigo-500/30", txt: isDark ? "text-indigo-400"  : "text-indigo-600",  sel:"border-indigo-400 bg-indigo-500/15",dot:"bg-indigo-400" },
    pink:   {bg:"bg-pink-500/10",    ring:"border-pink-500/30",   txt: isDark ? "text-pink-400"    : "text-pink-600",    sel:"border-pink-400 bg-pink-500/15",   dot:"bg-pink-400"   },
    amber:  {bg:"bg-amber-500/10",   ring:"border-amber-500/30",  txt: isDark ? "text-amber-400"   : "text-amber-600",   sel:"border-amber-400 bg-amber-500/15", dot:"bg-amber-400"  },
    slate:  {bg:"bg-slate-500/10",   ring:"border-slate-500/30",  txt: isDark ? "text-slate-400"   : "text-slate-600",   sel:"border-slate-400 bg-slate-500/15", dot:"bg-slate-400"  },
});

const getDemandBadge = (isDark) => ({
    "Extreme":  isDark ? "bg-rose-500/15 text-rose-400 border-rose-500/25"       : "bg-rose-50 text-rose-600 border-rose-200",
    "Very High":isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/25"   : "bg-amber-50 text-amber-700 border-amber-200",
    "High":     isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Medium":   isDark ? "bg-slate-500/15 text-slate-400 border-slate-500/25"   : "bg-slate-100 text-slate-600 border-slate-200",
});

const getImportanceStyle = (isDark) => ({
    core:     isDark ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border-indigo-200",
    secondary:isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    bonus:    isDark ? "bg-white/5 text-white/60 border-white/10" : "bg-slate-100 text-slate-600 border-slate-200",
});

const getPriorityBadge = (isDark) => ({
    MUST:        isDark ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200",
    RECOMMENDED: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    OPTIONAL:    isDark ? "bg-white/5 text-white/55 border-white/8" : "bg-slate-100 text-slate-600 border-slate-200",
});

const getComplexityBadge = (isDark) => ({
    Beginner:    isDark ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-700 bg-emerald-50 border-emerald-200",
    Intermediate:isDark ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-amber-700 bg-amber-50 border-amber-200",
    Advanced:    isDark ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-rose-700 bg-rose-50 border-rose-200",
});

const YEAR_META = [
    {color:"blue",   Icon:FlaskConical},
    {color:"purple", Icon:Code2},
    {color:"amber",  Icon:Briefcase},
];
const LOADING_STEPS = [
    "Analyzing career landscape & 2025 market demand...",
    "Mapping skill dependencies & prerequisites...",
    "Sourcing real courses from top platforms...",
    "Structuring 36-month phased learning plan...",
    "Adding projects, tools & interview prep...",
];

const getTokens = (isDark) => ({
    page: isDark ? "bg-[#070b14] text-white" : "bg-slate-50 text-slate-900",
    muted: isDark ? "text-white/55" : "text-slate-500",
    mutedHover: isDark ? "hover:text-white/65" : "hover:text-slate-700",
    soft: isDark ? "text-white/65" : "text-slate-600",
    body: isDark ? "text-white/70" : "text-slate-600",
    strong: isDark ? "text-white/88" : "text-slate-900",
    faint: isDark ? "text-white/50" : "text-slate-500",
    dim: isDark ? "text-white/60" : "text-slate-500",
    heading: isDark ? "text-white" : "text-slate-900",
    card: isDark ? "bg-white/[0.025] border border-white/5" : "bg-white border border-slate-200 shadow-sm",
    cardSoft: isDark ? "bg-white/[0.02] border border-white/5" : "bg-white border border-slate-200 shadow-sm",
    tagMuted: isDark ? "bg-white/[0.04] border-white/6 text-white/65" : "bg-slate-100 border-slate-200 text-slate-600",
    tagTools: isDark ? "bg-white/[0.04] border-white/7 text-white/70" : "bg-slate-100 border-slate-200 text-slate-600",
    pill: isDark ? "bg-white/5 border border-white/7 text-white/75" : "bg-slate-100 border border-slate-200 text-slate-700",
    divider: isDark ? "bg-white/5" : "bg-slate-200",
    borderFaint: isDark ? "border-white/5" : "border-slate-200",
    accentIndigo: isDark ? "text-indigo-400" : "text-indigo-600",
    accentAmber: isDark ? "text-amber-400" : "text-amber-600",
    accentEmerald: isDark ? "text-emerald-400" : "text-emerald-600",
    accentViolet: isDark ? "text-violet-400" : "text-violet-600",
    accentBlue: isDark ? "text-blue-400" : "text-blue-600",
    indigoNote: isDark ? "bg-indigo-500/5 border-indigo-500/12" : "bg-indigo-50 border-indigo-100",
    indigoNoteText: isDark ? "text-indigo-300/60" : "text-indigo-700",
    paidBadge: isDark ? "bg-white/5 text-white/55" : "bg-slate-100 text-slate-600",
    header: isDark ? "border-white/5 bg-[#06090f]/95" : "border-slate-200 bg-white",
    sidebar: isDark ? "border-white/5 bg-[#05080f]" : "border-slate-200 bg-slate-50",
    navHover: isDark ? "hover:bg-white/[0.025]" : "hover:bg-slate-100",
    navHoverSoft: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-100",
    navActiveTop: isDark ? "bg-white/[0.035] border-r-2 border-indigo-500" : "bg-white border-r-2 border-indigo-500 shadow-sm",
    phaseInactiveDot: isDark ? "bg-white/8" : "bg-slate-300",
    timelineLine: isDark ? "bg-white/5" : "bg-slate-200",
    resourceBorder: isDark ? "border-white/5" : "border-slate-200",
    byline: isDark ? "text-white/24" : "text-slate-400",
});

const Tag = ({ children, className = "" }) => (
    <span className={"text-xs px-2.5 py-1 rounded-full border font-mono " + className}>{children}</span>
);
const SL = ({ icon: Icon, label, isDark }) => {
    const muted = isDark ? "text-white/55" : "text-slate-500";
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon size={12} className={muted} />
            <p className={"text-xs font-black uppercase tracking-[0.25em] " + muted}>{label}</p>
        </div>
    );
};

const SelectorView = ({ onSelect }) => {
    const { theme } = useTheme();
    const isDark = theme !== "light";
    const t = getTokens(isDark);
    const C = getC(isDark);
    const DEMAND_BADGE = getDemandBadge(isDark);
    const [custom, setCustom] = useState("");
    const [active, setActive] = useState(null);
    const navigate = useNavigate();
    return (
        <div className={"min-h-screen overflow-y-auto " + t.page}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={"absolute -top-[10%] left-[10%] w-[800px] h-[800px] rounded-full blur-[180px] " + (isDark ? "bg-indigo-600/5" : "bg-indigo-400/10")} />
                <div className={"absolute -bottom-[5%] right-[5%] w-[500px] h-[500px] rounded-full blur-[130px] " + (isDark ? "bg-violet-600/4" : "bg-violet-400/8")} />
                {isDark && (
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.022) 1px,transparent 0)", backgroundSize: "28px 28px" }} />
                )}
            </div>
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 py-12">
                <button onClick={() => navigate(-1)} className={"flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest mb-14 " + t.muted + " " + t.mutedHover}>
                    <ArrowLeft size={12} /> Back
                </button>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
                    <div className={"inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6 " + (isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700")}>
                        <Sparkles size={10} /> AI-Powered · 36-Month Plan · Real Courses & Projects
                    </div>
                    <h1 className={"text-5xl md:text-[68px] font-black tracking-[-0.04em] leading-[0.95] mb-5 " + t.heading}>
                        Design Your<br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">Career Path</span>
                    </h1>
                    <p className={"text-sm max-w-lg mx-auto leading-relaxed " + t.soft}>
                        A phase-by-phase roadmap with real courses, skill trees, build projects, and interview prep.
                    </p>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <p className={"text-xs font-black uppercase tracking-[0.35em] text-center mb-5 " + t.faint}>Select your target career</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                        {CAREERS.map((career, i) => {
                            const c = C[career.color];
                            return (
                                <motion.button key={career.id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setActive(career.id); onSelect(career.title); }}
                                    className={"flex flex-col gap-2.5 p-4 rounded-2xl border transition-all text-left cursor-pointer " + (active === career.id ? c.sel : (isDark ? "bg-white/[0.02] " + c.ring : "bg-white border-slate-200 shadow-sm"))}
                                >
                                    <div className={"w-9 h-9 rounded-xl " + c.bg + " border " + c.ring + " flex items-center justify-center"}>
                                        <career.Icon size={16} className={c.txt} />
                                    </div>
                                    <p className={"text-sm font-black leading-tight " + t.strong}>{career.title}</p>
                                    <p className={"text-sm font-bold " + c.txt}>{career.salary}</p>
                                    <div className={"self-start text-sm font-black px-1.5 py-0.5 rounded-full border " + (DEMAND_BADGE[career.demand] || "")}>{career.demand}</div>
                                    <div className="flex flex-wrap gap-1 mt-auto">{career.tags.map(tag => <span key={tag} className={"text-sm font-mono " + t.faint}>{tag}</span>)}</div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={"flex-1 h-px " + t.divider} />
                        <span className={"text-xs uppercase tracking-widest font-bold " + t.faint}>or type your own career</span>
                        <div className={"flex-1 h-px " + t.divider} />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={13} className={"absolute left-3.5 top-1/2 -translate-y-1/2 " + t.faint} />
                            <input value={custom} onChange={e => setCustom(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && custom.trim() && onSelect(custom.trim())}
                                placeholder="e.g. Site Reliability Engineer, iOS Developer..."
                                className={"w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/40 transition-colors " + (isDark
                                    ? "bg-white/[0.03] border border-white/8 text-white placeholder-white/16"
                                    : "bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400")}
                            />
                        </div>
                        <button onClick={() => custom.trim() ? onSelect(custom.trim()) : toast.error("Enter a career title")}
                            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-black transition-colors flex items-center gap-1.5 shrink-0">
                            <Sparkles size={13} /> Generate
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const LoadingView = ({ step }) => {
    const { theme } = useTheme();
    const isDark = theme !== "light";
    const t = getTokens(isDark);
    return (
        <div className={"min-h-screen flex items-center justify-center " + t.page}>
            <div className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse pointer-events-none " + (isDark ? "bg-indigo-600/7" : "bg-indigo-300/25")} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center max-w-xs w-full px-6">
                <div className="relative w-16 h-16 mx-auto mb-8">
                    <div className={"absolute inset-0 rounded-full border " + (isDark ? "border-white/5" : "border-slate-200")} />
                    <div className="absolute inset-0 rounded-full border-t border-indigo-400 animate-spin" />
                    <div className="absolute inset-2.5 rounded-full border-t border-violet-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.75s" }} />
                    <Map size={18} className={"absolute inset-0 m-auto " + t.accentIndigo} />
                </div>
                <h2 className={"text-lg font-black mb-1 " + t.heading}>Forging Your Roadmap</h2>
                <p className={"text-xs mb-8 " + t.dim}>Building a real 36-month plan with courses and projects</p>
                <div className="space-y-2.5 text-left">
                    {LOADING_STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            {i < step ? <CheckCircle2 size={13} className={"shrink-0 " + t.accentEmerald} />
                                : i === step ? <div className="w-3 h-3 rounded-full border border-indigo-400 border-t-transparent animate-spin shrink-0" />
                                    : <Circle size={13} className={"shrink-0 " + (isDark ? "text-white/10" : "text-slate-300")} />}
                            <span className={"text-sm transition-colors " + (i <= step ? (isDark ? "text-white/80" : "text-slate-800") : t.faint)}>{s}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

const PhaseDetail = ({ phase, yearColor, isDark }) => {
    const t = getTokens(isDark);
    const C = getC(isDark);
    const IMPORTANCE_STYLE = getImportanceStyle(isDark);
    const PRIORITY_BADGE = getPriorityBadge(isDark);
    const COMPLEXITY_BADGE = getComplexityBadge(isDark);
    const c = C[yearColor] || C.blue;
    return (
        <div className={"space-y-8 " + t.heading}>
            <div>
                <span className={"text-xs font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border inline-block mb-3 " + c.bg + " " + c.ring + " " + c.txt}>{phase.months}</span>
                <h2 className="text-3xl font-black mb-3 tracking-tight leading-tight">{phase.title}</h2>
                <p className={"text-sm leading-relaxed max-w-2xl " + t.body}>{phase.description}</p>
                {phase.why_this_order && (
                    <div className={"mt-3 flex items-start gap-2 p-3 rounded-xl border " + t.indigoNote}>
                        <ChevronRight size={12} className={t.accentIndigo + " mt-0.5 shrink-0"} />
                        <p className={"text-sm italic leading-relaxed " + t.indigoNoteText}>{phase.why_this_order}</p>
                    </div>
                )}
            </div>
            {phase.skills?.length > 0 && (
                <div>
                    <SL icon={Target} label="Skill Tree" isDark={isDark} />
                    <div className="space-y-2.5">
                        {phase.skills.map((skill, i) => (
                            <div key={i} className={"p-4 rounded-2xl transition-colors " + t.card + " " + (isDark ? "hover:border-white/8" : "hover:border-slate-300")}>
                                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                    <span className={"text-sm font-black px-2 py-0.5 rounded-full border " + (IMPORTANCE_STYLE[skill.importance] || IMPORTANCE_STYLE.secondary)}>
                                        {(skill.importance || "secondary").toUpperCase()}
                                    </span>
                                    <span className={"text-sm font-bold " + t.strong}>{skill.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skill.subtopics?.map((sub, j) => <Tag key={j} className={t.tagMuted}>{sub}</Tag>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase.courses?.length > 0 && (
                <div>
                    <SL icon={PlayCircle} label="Courses" isDark={isDark} />
                    <div className="space-y-3">
                        {phase.courses.map((course, i) => (
                            <div key={i} className={"p-4 rounded-2xl transition-all " + t.card + " " + (isDark ? "hover:border-white/10" : "hover:border-slate-300")}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={"text-sm font-black px-2 py-0.5 rounded-full border " + (PRIORITY_BADGE[course.priority] || PRIORITY_BADGE.OPTIONAL)}>{course.priority}</span>
                                        <h4 className={"text-sm font-black " + t.strong}>{course.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Star size={9} className="text-amber-400 fill-amber-400" />
                                        <span className={"text-xs font-mono " + t.dim}>{course.rating?.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                    <span className={"text-sm " + t.dim}>{course.platform}</span>
                                    <span className={"text-sm font-bold px-1.5 py-0.5 rounded-full " + (course.free ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : t.paidBadge)}>{course.free ? "FREE" : "PAID"}</span>
                                    <span className={"flex items-center gap-1 text-xs " + t.muted}><Clock size={9} />{course.hours}h</span>
                                </div>
                                {course.why && <p className={"text-sm italic mb-2 leading-relaxed " + t.muted}>{course.why}</p>}
                                {course.output && (
                                    <div className={"flex items-start gap-1.5 mt-2 pt-2 border-t " + t.borderFaint}>
                                        <CheckCircle2 size={11} className={t.accentEmerald + " mt-0.5 shrink-0"} />
                                        <p className={"text-sm " + (isDark ? "text-emerald-400/60" : "text-emerald-700")}>Output: {course.output}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase.projects?.length > 0 && (
                <div>
                    <SL icon={Code2} label="Build Projects" isDark={isDark} />
                    <div className="space-y-3">
                        {phase.projects.map((proj, i) => (
                            <div key={i} className={"p-4 rounded-2xl border transition-colors " + (isDark ? "bg-emerald-500/[0.04] border-emerald-500/12 hover:border-emerald-500/22" : "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300")}>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={"text-sm font-black px-2 py-0.5 rounded-full border " + (COMPLEXITY_BADGE[proj.complexity] || "")}>{proj.complexity}</span>
                                    <h4 className={"text-sm font-bold " + t.strong}>{proj.title}</h4>
                                </div>
                                <p className={"text-sm leading-relaxed mb-3 " + t.body}>{proj.description}</p>
                                <div className="flex flex-wrap gap-1.5 mb-2">{proj.tech?.map((tech, j) => <Tag key={j} className={isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>{tech}</Tag>)}</div>
                                {proj.why && <p className={"text-xs italic " + (isDark ? "text-emerald-400/42" : "text-emerald-600")}>Portfolio: {proj.why}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
                {phase.tools?.length > 0 && (
                    <div className={"p-4 rounded-2xl " + t.cardSoft}>
                        <SL icon={Wrench} label="Tools to Set Up" isDark={isDark} />
                        <div className="flex flex-wrap gap-2">{phase.tools.map((tool, i) => <Tag key={i} className={t.tagTools}>{tool}</Tag>)}</div>
                    </div>
                )}
                {phase.checkpoint && (
                    <div className={"p-4 rounded-2xl border " + (isDark ? "bg-indigo-500/[0.04] border-indigo-500/12" : "bg-indigo-50 border-indigo-200")}>
                        <SL icon={ListChecks} label="Mastery Checkpoint" isDark={isDark} />
                        <p className={"text-sm italic leading-relaxed " + (isDark ? "text-indigo-300/52" : "text-indigo-700")}>{phase.checkpoint}</p>
                    </div>
                )}
            </div>
            {phase.avoid?.length > 0 && (
                <div className={"p-4 rounded-2xl border " + (isDark ? "bg-rose-500/[0.04] border-rose-500/12" : "bg-rose-50 border-rose-200")}>
                    <SL icon={AlertTriangle} label="Common Mistakes to Avoid" isDark={isDark} />
                    <div className="space-y-2">
                        {phase.avoid.map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className={"text-xs mt-0.5 shrink-0 " + (isDark ? "text-rose-400/40" : "text-rose-500")}>x</span>
                                <p className={"text-sm leading-relaxed " + t.soft}>{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const OverviewSection = ({ roadmap, onNavigate, isDark }) => {
    const t = getTokens(isDark);
    const C = getC(isDark);
    const ov = roadmap.overview || {};
    const years = roadmap.years || [];
    return (
        <div className={"space-y-6 " + t.heading}>
            <div>
                <p className={"text-xs font-black uppercase tracking-[0.3em] mb-2 " + t.accentIndigo}>3-Year Career Roadmap</p>
                <h1 className="text-4xl font-black mb-2 tracking-tight">{roadmap.career}</h1>
                <p className={"text-sm italic " + t.soft}>{roadmap.tagline}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { icon: DollarSign, label: "Salary Range",     val: ov.salary_range,              c: t.accentEmerald },
                    { icon: TrendingUp, label: "Market Demand",     val: ov.demand_level,              c: t.accentAmber   },
                    { icon: Clock,      label: "Time to First Job", val: ov.time_to_job,               c: t.accentBlue    },
                    { icon: Code2,      label: "Core Languages",    val: ov.core_languages?.join(", "),c: t.accentViolet  },
                ].map((s, i) => (
                    <div key={i} className={"p-4 rounded-2xl " + t.card}>
                        <s.icon size={13} className={s.c + " mb-2"} />
                        <p className={"text-sm uppercase tracking-widest font-bold mb-1 " + t.muted}>{s.label}</p>
                        <p className={"text-sm font-black " + s.c}>{s.val || "—"}</p>
                    </div>
                ))}
            </div>
            <div className={"p-4 rounded-2xl " + t.cardSoft}>
                <p className={"text-xs font-black uppercase tracking-widest mb-2 " + t.muted}>About This Role</p>
                <p className={"text-sm leading-relaxed " + t.body}>{ov.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                <div className={"p-4 rounded-2xl " + t.cardSoft}>
                    <p className={"text-xs font-black uppercase tracking-widest mb-3 " + t.muted}>Top Hiring Companies</p>
                    <div className="flex flex-wrap gap-2">{ov.top_companies?.map((co, i) => <span key={i} className={"text-xs px-3 py-1 rounded-full font-medium " + t.pill}>{co}</span>)}</div>
                </div>
                <div className={"p-4 rounded-2xl " + t.cardSoft}>
                    <p className={"text-xs font-black uppercase tracking-widest mb-3 " + t.muted}>Core Languages</p>
                    <div className="flex flex-wrap gap-2">{ov.core_languages?.map((l, i) => <span key={i} className={"text-xs px-3 py-1 rounded-full border font-bold " + (isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-700")}>{l}</span>)}</div>
                </div>
            </div>
            <div>
                <p className={"text-xs font-black uppercase tracking-widest mb-3 " + t.muted}>Jump to a Year</p>
                <div className="grid grid-cols-3 gap-3">
                    {years.map((yr, i) => {
                        const yc = C[YEAR_META[i]?.color || "blue"];
                        return (
                            <button key={i} onClick={() => onNavigate("year-" + i)} className={"p-4 rounded-2xl " + yc.bg + " border " + yc.ring + " text-left hover:opacity-80 transition-opacity"}>
                                <p className={"text-xs font-black uppercase tracking-widest " + yc.txt + " mb-1"}>Year {yr.year}</p>
                                <p className={"text-xs font-black " + (isDark ? "text-white/68" : "text-slate-800")}>{yr.title}</p>
                                <p className={"text-xs mt-1 " + t.muted}>{yr.phases?.length || 0} phases</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const StackTimeline = ({ timeline, isDark }) => {
    const t = getTokens(isDark);
    const C = getC(isDark);
    return (
        <div className={"space-y-6 " + t.heading}>
            <div>
                <p className={"text-xs font-black uppercase tracking-[0.3em] mb-1 " + t.accentIndigo}>Tools You Will Gain</p>
                <h2 className="text-3xl font-black mb-2">Tech Stack Timeline</h2>
                <p className={"text-sm " + t.soft}>Technologies progressively added across 3 years.</p>
            </div>
            {timeline?.length ? (
                <div className="relative">
                    <div className={"absolute left-5 top-0 bottom-0 w-px " + t.timelineLine} />
                    <div className="space-y-8">
                        {timeline.map((yr, i) => {
                            const yc = C[YEAR_META[i]?.color || "blue"];
                            return (
                                <div key={i} className="relative pl-14">
                                    <div className={"absolute left-3 top-1 w-4 h-4 rounded-full " + yc.bg + " border-2 " + yc.ring + " flex items-center justify-center"}>
                                        <div className={"w-1.5 h-1.5 rounded-full " + yc.dot} />
                                    </div>
                                    <p className={"text-xs font-black uppercase tracking-widest " + yc.txt + " mb-3"}>Year {yr.year}</p>
                                    <div className="flex flex-wrap gap-2">{yr.stack?.map((tool, j) => <Tag key={j} className={yc.bg + " " + yc.ring + " " + yc.txt + " font-bold"}>{tool}</Tag>)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : <p className={"text-sm " + t.dim}>No timeline data generated.</p>}
        </div>
    );
};

const InterviewPrep = ({ prep, isDark }) => {
    const t = getTokens(isDark);
    const PRIORITY_BADGE = getPriorityBadge(isDark);
    if (!prep) return <p className={"text-sm " + t.dim}>No interview prep data.</p>;
    return (
        <div className={"space-y-6 " + t.heading}>
            <div>
                <p className={"text-xs font-black uppercase tracking-[0.3em] mb-1 " + t.accentAmber}>Job Readiness</p>
                <h2 className="text-3xl font-black mb-2">Interview Preparation</h2>
                <p className={"text-sm " + t.soft}>Start: {prep.start_at} · Duration: {prep.duration}</p>
            </div>
            {prep.areas?.length > 0 && (
                <div>
                    <p className={"text-xs font-black uppercase tracking-widest mb-3 " + t.muted}>Focus Areas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {prep.areas.map((area, i) => (
                            <div key={i} className={"flex items-center gap-2 p-3 rounded-xl " + t.card}>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span className={"text-xs font-medium " + (isDark ? "text-white/75" : "text-slate-700")}>{area}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {prep.resources?.length > 0 && (
                <div>
                    <p className={"text-xs font-black uppercase tracking-widest mb-3 " + t.muted}>Key Resources</p>
                    <div className="space-y-2">
                        {prep.resources.map((res, i) => (
                            <div key={i} className={"flex items-start gap-3 p-3 rounded-xl " + t.card}>
                                <span className={"text-sm font-black px-2 py-0.5 rounded-full border shrink-0 mt-0.5 " + (PRIORITY_BADGE[res.priority] || PRIORITY_BADGE.OPTIONAL)}>{res.priority}</span>
                                <div>
                                    <p className={"text-xs font-bold " + (isDark ? "text-white/72" : "text-slate-800")}>{res.name}</p>
                                    <p className={"text-xs " + t.muted}>{res.platform}</p>
                                    {res.why && <p className={"text-xs italic mt-1 " + t.muted}>{res.why}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ResourcesSection = ({ resources, isDark }) => {
    const t = getTokens(isDark);
    if (!resources?.length) return <p className={"text-sm " + t.dim}>No resources data.</p>;
    return (
        <div className={"space-y-6 " + t.heading}>
            <div>
                <p className={"text-xs font-black uppercase tracking-[0.3em] mb-1 " + t.accentIndigo}>Curated Must-Haves</p>
                <h2 className="text-3xl font-black mb-2">Essential Resources</h2>
                <p className={"text-sm " + t.soft}>Books, channels, and platforms recommended by engineers in this field.</p>
            </div>
            <div className="space-y-5">
                {resources.map((res, i) => (
                    <div key={i} className={"p-5 rounded-2xl " + t.cardSoft}>
                        <div className="flex items-center gap-2 mb-4"><span className="text-xl">{res.icon}</span><p className={"text-sm font-black " + (isDark ? "text-white/70" : "text-slate-700")}>{res.category}</p></div>
                        <div className="space-y-4">
                            {res.items?.map((item, j) => (
                                <div key={j} className={"pl-3 border-l-2 " + t.resourceBorder}>
                                    <p className={"text-xs font-bold " + (isDark ? "text-white/65" : "text-slate-800")}>{item.name}</p>
                                    <p className={"text-xs " + t.byline}>{item.by}</p>
                                    {item.why && <p className={"text-xs italic mt-0.5 leading-relaxed " + t.muted}>{item.why}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RoadmapView = ({ roadmap, onBack, onRegenerate }) => {
    const { theme } = useTheme();
    const isDark = theme !== "light";
    const t = getTokens(isDark);
    const C = getC(isDark);
    const DEMAND_BADGE = getDemandBadge(isDark);
    const [activeId, setActiveId] = useState("overview");
    const [openYears, setOpenYears] = useState({ 0: true, 1: false, 2: false });
    const contentRef = useRef(null);
    const years = roadmap.years || [];

    const allPhases = years.flatMap((yr, yi) =>
        (yr.phases || []).map((ph, pi) => ({ ...ph, yi, pi, _id: ph.id || ("y" + (yi + 1) + "-p" + (pi + 1)) }))
    );
    const toggleYear = yi => setOpenYears(p => ({ ...p, [yi]: !p[yi] }));
    const go = id => { setActiveId(id); contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };
    const currentPhase = allPhases.find(ph => ph._id === activeId);
    const currentYearIdx = currentPhase?.yi ?? null;

    const navItems = [
        { id: "overview", label: "Overview", Icon: Globe, kind: "top" },
        ...years.flatMap((yr, yi) => [
            { id: "year-" + yi, label: "Y" + yr.year + " · " + yr.title, Icon: YEAR_META[yi]?.Icon || Code2, kind: "year", yi },
            ...(openYears[yi] ? (yr.phases || []).map((ph, pi) => ({
                id: ph.id || ("y" + (yi + 1) + "-p" + (pi + 1)),
                label: ph.title, sub: ph.months, yi, kind: "phase"
            })) : [])
        ]),
        { id: "stack-timeline", label: "Stack Timeline", Icon: Layers,   kind: "top" },
        { id: "interview-prep", label: "Interview Prep",  Icon: Briefcase,kind: "top" },
        { id: "resources",      label: "Resources",       Icon: BookOpen, kind: "top" },
    ];

    return (
        <div className={"w-full h-full flex flex-col overflow-hidden " + t.page}>
            <div className={"h-11 shrink-0 flex items-center justify-between px-5 border-b backdrop-blur-xl z-10 " + t.header}>
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className={"flex items-center gap-1.5 transition-colors text-xs font-bold uppercase tracking-widest " + t.muted + " " + t.mutedHover}>
                        <ArrowLeft size={11} /> Careers
                    </button>
                    <div className={"w-px h-3.5 " + t.divider} />
                    <span className={"text-sm font-black " + (isDark ? "text-white/75" : "text-slate-800")}>{roadmap.career}</span>
                    {roadmap.overview?.demand_level && (
                        <span className={"hidden sm:inline text-sm font-bold px-2 py-0.5 rounded-full border " + (DEMAND_BADGE[roadmap.overview.demand_level] || "")}>
                            {roadmap.overview.demand_level} Demand
                        </span>
                    )}
                    {roadmap.overview?.salary_range && (
                        <span className={"hidden md:inline text-xs font-mono " + t.muted}>{roadmap.overview.salary_range}</span>
                    )}
                </div>
                <button onClick={onRegenerate} className={"flex items-center gap-1.5 transition-colors text-xs font-bold uppercase tracking-widest " + t.faint + " " + t.mutedHover}>
                    <RotateCcw size={10} /> Regenerate
                </button>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <nav className={"w-56 shrink-0 border-r overflow-y-auto py-3 hidden md:block " + t.sidebar}>
                    {navItems.map(item => {
                        const isActive = activeId === item.id;
                        if (item.kind === "year") {
                            const yc = C[YEAR_META[item.yi]?.color || "blue"];
                            return (
                                <button key={item.id} onClick={() => toggleYear(item.yi)}
                                    className={"w-full flex items-center justify-between px-4 py-2.5 transition-colors group mt-1 " + t.navHover}>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <item.Icon size={11} className={yc.txt + " shrink-0"} />
                                        <span className={"text-xs font-black leading-tight truncate transition-colors " + (isDark ? "text-white/75 group-hover:text-white/78" : "text-slate-700 group-hover:text-slate-900")}>{item.label}</span>
                                    </div>
                                    <ChevronDown size={10} className={"shrink-0 transition-transform " + t.faint + " " + (openYears[item.yi] ? "rotate-180" : "")} />
                                </button>
                            );
                        }
                        if (item.kind === "phase") {
                            const yc = C[YEAR_META[item.yi]?.color || "blue"];
                            return (
                                <button key={item.id} onClick={() => go(item.id)}
                                    className={"w-full flex items-center gap-2 pl-8 pr-3 py-1.5 transition-all text-left " + (isActive ? yc.bg + " border-r-2 " + yc.ring : t.navHoverSoft)}>
                                    <div className={"w-1 h-1 rounded-full shrink-0 " + (isActive ? yc.dot : t.phaseInactiveDot)} />
                                    <div className="min-w-0">
                                        <p className={"text-xs font-bold leading-tight truncate " + (isActive ? t.strong : t.soft)}>{item.label}</p>
                                        <p className={"text-sm font-mono " + t.faint}>{item.sub}</p>
                                    </div>
                                </button>
                            );
                        }
                        return (
                            <button key={item.id} onClick={() => go(item.id)}
                                className={"w-full flex items-center gap-2.5 px-4 py-2.5 transition-all " + (isActive ? t.navActiveTop : t.navHoverSoft)}>
                                <item.Icon size={12} className={isActive ? t.accentIndigo : t.faint} />
                                <span className={"text-sm font-bold " + (isActive ? t.strong : t.soft)}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-7 md:px-8 md:py-9 lg:px-12 lg:py-10">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="w-full max-w-6xl">
                            {activeId === "overview" && <OverviewSection roadmap={roadmap} onNavigate={go} isDark={isDark} />}
                            {currentPhase && <PhaseDetail phase={currentPhase} yearColor={YEAR_META[currentYearIdx]?.color || "blue"} isDark={isDark} />}
                            {activeId.startsWith("year-") && !currentPhase && (() => {
                                const yi = parseInt(activeId.split("-")[1]);
                                const yr = years[yi];
                                if (!yr) return null;
                                const yc = C[YEAR_META[yi]?.color || "blue"];
                                return (
                                    <div className={t.heading}>
                                        <p className={"text-xs font-black uppercase tracking-[0.3em] mb-2 " + yc.txt}>Year {yr.year}</p>
                                        <h2 className="text-3xl font-black mb-3">{yr.title}</h2>
                                        <p className={"text-sm mb-8 " + t.body}>{yr.theme}</p>
                                        <div className="space-y-3">
                                            {yr.phases?.map((ph, pi) => {
                                                const pid = ph.id || ("y" + (yi + 1) + "-p" + (pi + 1));
                                                return (
                                                    <button key={pi} onClick={() => { setOpenYears(p => ({ ...p, [yi]: true })); go(pid); }}
                                                        className={"w-full flex items-center gap-4 p-4 rounded-2xl text-left " + yc.bg + " border " + yc.ring + " hover:opacity-80 transition-opacity"}>
                                                        <div className={"w-9 h-9 rounded-xl " + yc.bg + " border " + yc.ring + " flex items-center justify-center shrink-0"}>
                                                            <span className={"text-xs font-black " + yc.txt}>{pi + 1}</span>
                                                        </div>
                                                        <div className="text-left flex-1 min-w-0">
                                                            <p className={"text-xs font-black truncate " + (isDark ? "text-white/80" : "text-slate-800")}>{ph.title}</p>
                                                            <p className={"text-xs " + yc.txt}>{ph.months}</p>
                                                        </div>
                                                        <div className={"flex items-center gap-2 text-xs shrink-0 " + t.muted}>
                                                            <span>{ph.skills?.length || 0} skills</span>
                                                            <span>·</span>
                                                            <span>{ph.courses?.length || 0} courses</span>
                                                        </div>
                                                        <ChevronRight size={12} className={"shrink-0 " + t.faint} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                            {activeId === "stack-timeline" && <StackTimeline timeline={roadmap.stack_timeline} isDark={isDark} />}
                            {activeId === "interview-prep" && <InterviewPrep prep={roadmap.interview_prep} isDark={isDark} />}
                            {activeId === "resources"      && <ResourcesSection resources={roadmap.resources} isDark={isDark} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const CareerRoadmap = () => {
    const [view, setView] = useState("boot");
    const [roadmap, setRoadmap] = useState(null);
    const [savedMeta, setSavedMeta] = useState(null); // { careerKey, careerTitle }
    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await getCareerRoadmap();
                if (cancelled) return;
                const saved = extractSavedFullRoadmap(res.data);
                if (saved) {
                    setRoadmap(saved);
                    setSavedMeta({
                        careerKey: res.data.career_key || saved.career,
                        careerTitle: saved.career || res.data.target_job,
                    });
                    setView("roadmap");
                    return;
                }
            } catch {
                /* 404 / no saved plan — show selector */
            }
            if (!cancelled) setView("selector");
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (view !== "loading") return;
        let i = 0;
        const iv = setInterval(() => { i++; if (i < LOADING_STEPS.length) setLoadingStep(i); }, 1500);
        return () => clearInterval(iv);
    }, [view]);

    const generate = async (career, { force = false } = {}) => {
        const careerLabel = String(career || "").trim();
        const matchesSaved =
            careersMatch(roadmap?.career, careerLabel) ||
            careersMatch(savedMeta?.careerKey, careerLabel) ||
            careersMatch(savedMeta?.careerTitle, careerLabel);

        if (!force && matchesSaved && roadmap?.years?.length) {
            setView("roadmap");
            return;
        }
        // Same career saved but roadmap not in memory — reload from API
        if (!force && matchesSaved) {
            try {
                const res = await getCareerRoadmap();
                const saved = extractSavedFullRoadmap(res.data);
                if (saved) {
                    setRoadmap(saved);
                    setView("roadmap");
                    return;
                }
            } catch { /* fall through to generate */ }
        }

        setView("loading");
        setLoadingStep(0);
        try {
            const res = await generateFullRoadmap(careerLabel);
            if (!res.data?.years?.length) {
                throw new Error("incomplete_roadmap");
            }
            setRoadmap(res.data);
            setSavedMeta({
                careerKey: careerLabel.toLowerCase(),
                careerTitle: res.data.career || careerLabel,
            });
            setView("roadmap");
        } catch (err) {
            const status = err.response?.status;
            const code = err.response?.data?.error;
            const serverMsg = err.response?.data?.message;
            if (status === 403 && (code === "premium_required" || serverMsg?.includes?.("premium"))) {
                toast.error("Career roadmaps require Premium. Upgrade to generate your plan.");
            } else if (status === 401) {
                toast.error("Session expired. Please sign in again.");
            } else if (serverMsg) {
                toast.error(serverMsg);
            } else {
                toast.error("Failed to generate roadmap. Please retry.");
            }
            setView(roadmap?.years?.length ? "roadmap" : "selector");
        }
    };

    if (view === "boot") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-white/50 text-xs font-bold uppercase tracking-widest">
                Loading saved roadmap...
            </div>
        );
    }
    if (view === "selector") return <SelectorView onSelect={(c) => generate(c, { force: false })} />;
    if (view === "loading")  return <LoadingView step={loadingStep} />;
    if (view === "roadmap" && roadmap) {
        return (
            <RoadmapView
                roadmap={roadmap}
                onBack={() => setView("selector")}
                onRegenerate={() => generate(roadmap.career || savedMeta?.careerTitle, { force: true })}
            />
        );
    }
    return null;
};

export default CareerRoadmap;
