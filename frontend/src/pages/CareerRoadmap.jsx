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
import { generateFullRoadmap } from "../api/career";

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

const C = {
    blue:   {bg:"bg-blue-500/10",    ring:"border-blue-500/30",   txt:"text-blue-400",    sel:"border-blue-400 bg-blue-500/15",    dot:"bg-blue-400"   },
    purple: {bg:"bg-purple-500/10",  ring:"border-purple-500/30", txt:"text-purple-400",  sel:"border-purple-400 bg-purple-500/15",dot:"bg-purple-400" },
    red:    {bg:"bg-red-500/10",     ring:"border-red-500/30",    txt:"text-red-400",     sel:"border-red-400 bg-red-500/15",     dot:"bg-red-400"    },
    cyan:   {bg:"bg-cyan-500/10",    ring:"border-cyan-500/30",   txt:"text-cyan-400",    sel:"border-cyan-400 bg-cyan-500/15",   dot:"bg-cyan-400"   },
    green:  {bg:"bg-emerald-500/10", ring:"border-emerald-500/30",txt:"text-emerald-400", sel:"border-emerald-400 bg-emerald-500/15",dot:"bg-emerald-400"},
    orange: {bg:"bg-orange-500/10",  ring:"border-orange-500/30", txt:"text-orange-400",  sel:"border-orange-400 bg-orange-500/15",dot:"bg-orange-400" },
    indigo: {bg:"bg-indigo-500/10",  ring:"border-indigo-500/30", txt:"text-indigo-400",  sel:"border-indigo-400 bg-indigo-500/15",dot:"bg-indigo-400" },
    pink:   {bg:"bg-pink-500/10",    ring:"border-pink-500/30",   txt:"text-pink-400",    sel:"border-pink-400 bg-pink-500/15",   dot:"bg-pink-400"   },
    amber:  {bg:"bg-amber-500/10",   ring:"border-amber-500/30",  txt:"text-amber-400",   sel:"border-amber-400 bg-amber-500/15", dot:"bg-amber-400"  },
    slate:  {bg:"bg-slate-500/10",   ring:"border-slate-500/30",  txt:"text-slate-400",   sel:"border-slate-400 bg-slate-500/15", dot:"bg-slate-400"  },
};

const DEMAND_BADGE = {
    "Extreme":  "bg-rose-500/15 text-rose-400 border-rose-500/25",
    "Very High":"bg-amber-500/15 text-amber-400 border-amber-500/25",
    "High":     "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    "Medium":   "bg-slate-500/15 text-slate-400 border-slate-500/25",
};
const IMPORTANCE_STYLE = {
    core:     "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    secondary:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    bonus:    "bg-white/5 text-white/28 border-white/10",
};
const PRIORITY_BADGE = {
    MUST:        "bg-amber-500/15 text-amber-300 border-amber-500/30",
    RECOMMENDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    OPTIONAL:    "bg-white/5 text-white/25 border-white/8",
};
const COMPLEXITY_BADGE = {
    Beginner:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Intermediate:"text-amber-400 bg-amber-500/10 border-amber-500/20",
    Advanced:    "text-rose-400 bg-rose-500/10 border-rose-500/20",
};
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

const Tag = ({ children, className = "" }) => (
    <span className={"text-[10px] px-2.5 py-1 rounded-full border font-mono " + className}>{children}</span>
);
const SL = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 mb-4">
        <Icon size={12} className="text-white/22" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">{label}</p>
    </div>
);

const SelectorView = ({ onSelect }) => {
    const [custom, setCustom] = useState("");
    const [active, setActive] = useState(null);
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#070b14] text-white overflow-y-auto">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] left-[10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[180px]" />
                <div className="absolute -bottom-[5%] right-[5%] w-[500px] h-[500px] bg-violet-600/4 rounded-full blur-[130px]" />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.022) 1px,transparent 0)", backgroundSize: "28px 28px" }} />
            </div>
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 py-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/22 hover:text-white/65 transition-colors text-[10px] font-bold uppercase tracking-widest mb-14">
                    <ArrowLeft size={12} /> Back
                </button>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Sparkles size={10} /> AI-Powered · 36-Month Plan · Real Courses & Projects
                    </div>
                    <h1 className="text-5xl md:text-[68px] font-black tracking-[-0.04em] leading-[0.95] mb-5">
                        Design Your<br />
                        <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent">Career Path</span>
                    </h1>
                    <p className="text-sm text-white/32 max-w-lg mx-auto leading-relaxed">
                        A phase-by-phase roadmap with real courses, skill trees, build projects, and interview prep.
                    </p>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/16 text-center mb-5">Select your target career</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                        {CAREERS.map((career, i) => {
                            const c = C[career.color];
                            return (
                                <motion.button key={career.id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => { setActive(career.id); onSelect(career.title); }}
                                    className={"flex flex-col gap-2.5 p-4 rounded-2xl border transition-all text-left cursor-pointer " + (active === career.id ? c.sel : "bg-white/[0.02] " + c.ring)}
                                >
                                    <div className={"w-9 h-9 rounded-xl " + c.bg + " border " + c.ring + " flex items-center justify-center"}>
                                        <career.Icon size={16} className={c.txt} />
                                    </div>
                                    <p className="text-[11px] font-black text-white/88 leading-tight">{career.title}</p>
                                    <p className={"text-[11px] font-bold " + c.txt}>{career.salary}</p>
                                    <div className={"self-start text-[9px] font-black px-1.5 py-0.5 rounded-full border " + (DEMAND_BADGE[career.demand] || "")}>{career.demand}</div>
                                    <div className="flex flex-wrap gap-1 mt-auto">{career.tags.map(t => <span key={t} className="text-[9px] text-white/16 font-mono">{t}</span>)}</div>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] text-white/16 uppercase tracking-widest font-bold">or type your own career</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/16" />
                            <input value={custom} onChange={e => setCustom(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && custom.trim() && onSelect(custom.trim())}
                                placeholder="e.g. Site Reliability Engineer, iOS Developer..."
                                className="w-full bg-white/[0.03] border border-white/8 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/16 focus:outline-none focus:border-indigo-500/40 transition-colors"
                            />
                        </div>
                        <button onClick={() => custom.trim() ? onSelect(custom.trim()) : toast.error("Enter a career title")}
                            className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-black transition-colors flex items-center gap-1.5 shrink-0">
                            <Sparkles size={13} /> Generate
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const LoadingView = ({ step }) => (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/7 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 text-center max-w-xs w-full px-6">
            <div className="relative w-16 h-16 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-0 rounded-full border-t border-indigo-400 animate-spin" />
                <div className="absolute inset-2.5 rounded-full border-t border-violet-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.75s" }} />
                <Map size={18} className="absolute inset-0 m-auto text-indigo-400" />
            </div>
            <h2 className="text-lg font-black mb-1">Forging Your Roadmap</h2>
            <p className="text-xs text-white/28 mb-8">Building a real 36-month plan with courses and projects</p>
            <div className="space-y-2.5 text-left">
                {LOADING_STEPS.map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        {i < step ? <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            : i === step ? <div className="w-3 h-3 rounded-full border border-indigo-400 border-t-transparent animate-spin shrink-0" />
                                : <Circle size={13} className="text-white/10 shrink-0" />}
                        <span className={"text-[11px] transition-colors " + (i <= step ? "text-white/58" : "text-white/16")}>{s}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    </div>
);

const PhaseDetail = ({ phase, yearColor }) => {
    const c = C[yearColor] || C.blue;
    return (
        <div className="space-y-8 text-white">
            <div>
                <span className={"text-[10px] font-black uppercase tracking-[0.3em] px-2.5 py-1 rounded-full border inline-block mb-3 " + c.bg + " " + c.ring + " " + c.txt}>{phase.months}</span>
                <h2 className="text-3xl font-black mb-3 tracking-tight leading-tight">{phase.title}</h2>
                <p className="text-[13px] text-white/42 leading-relaxed max-w-2xl">{phase.description}</p>
                {phase.why_this_order && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/12">
                        <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-indigo-300/60 italic leading-relaxed">{phase.why_this_order}</p>
                    </div>
                )}
            </div>
            {phase.skills?.length > 0 && (
                <div>
                    <SL icon={Target} label="Skill Tree" />
                    <div className="space-y-2.5">
                        {phase.skills.map((skill, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.025] border border-white/5 hover:border-white/8 transition-colors">
                                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                    <span className={"text-[9px] font-black px-2 py-0.5 rounded-full border " + (IMPORTANCE_STYLE[skill.importance] || IMPORTANCE_STYLE.secondary)}>
                                        {(skill.importance || "secondary").toUpperCase()}
                                    </span>
                                    <span className="text-sm font-bold text-white/88">{skill.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {skill.subtopics?.map((sub, j) => <Tag key={j} className="bg-white/[0.04] border-white/6 text-white/32">{sub}</Tag>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase.courses?.length > 0 && (
                <div>
                    <SL icon={PlayCircle} label="Courses" />
                    <div className="space-y-3">
                        {phase.courses.map((course, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.025] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={"text-[9px] font-black px-2 py-0.5 rounded-full border " + (PRIORITY_BADGE[course.priority] || PRIORITY_BADGE.OPTIONAL)}>{course.priority}</span>
                                        <h4 className="text-sm font-black text-white/88">{course.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Star size={9} className="text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] text-white/28 font-mono">{course.rating?.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                    <span className="text-[11px] text-white/28">{course.platform}</span>
                                    <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-full " + (course.free ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/22")}>{course.free ? "FREE" : "PAID"}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-white/20"><Clock size={9} />{course.hours}h</span>
                                </div>
                                {course.why && <p className="text-[11px] text-white/25 italic mb-2 leading-relaxed">{course.why}</p>}
                                {course.output && (
                                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-white/5">
                                        <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <p className="text-[11px] text-emerald-400/60">Output: {course.output}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {phase.projects?.length > 0 && (
                <div>
                    <SL icon={Code2} label="Build Projects" />
                    <div className="space-y-3">
                        {phase.projects.map((proj, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/12 hover:border-emerald-500/22 transition-colors">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={"text-[9px] font-black px-2 py-0.5 rounded-full border " + (COMPLEXITY_BADGE[proj.complexity] || "")}>{proj.complexity}</span>
                                    <h4 className="text-sm font-bold text-white/88">{proj.title}</h4>
                                </div>
                                <p className="text-[11px] text-white/36 leading-relaxed mb-3">{proj.description}</p>
                                <div className="flex flex-wrap gap-1.5 mb-2">{proj.tech?.map((t, j) => <Tag key={j} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{t}</Tag>)}</div>
                                {proj.why && <p className="text-[10px] text-emerald-400/42 italic">Portfolio: {proj.why}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
                {phase.tools?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <SL icon={Wrench} label="Tools to Set Up" />
                        <div className="flex flex-wrap gap-2">{phase.tools.map((t, i) => <Tag key={i} className="bg-white/[0.04] border-white/7 text-white/40">{t}</Tag>)}</div>
                    </div>
                )}
                {phase.checkpoint && (
                    <div className="p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/12">
                        <SL icon={ListChecks} label="Mastery Checkpoint" />
                        <p className="text-[11px] text-indigo-300/52 italic leading-relaxed">{phase.checkpoint}</p>
                    </div>
                )}
            </div>
            {phase.avoid?.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/12">
                    <SL icon={AlertTriangle} label="Common Mistakes to Avoid" />
                    <div className="space-y-2">
                        {phase.avoid.map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-rose-400/40 text-xs mt-0.5 shrink-0">x</span>
                                <p className="text-[11px] text-white/30 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const OverviewSection = ({ roadmap, onNavigate }) => {
    const ov = roadmap.overview || {};
    const years = roadmap.years || [];
    return (
        <div className="space-y-6 text-white">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">3-Year Career Roadmap</p>
                <h1 className="text-4xl font-black mb-2 tracking-tight">{roadmap.career}</h1>
                <p className="text-sm text-white/30 italic">{roadmap.tagline}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {[
                    { icon: DollarSign, label: "Salary Range",     val: ov.salary_range,              c: "text-emerald-400" },
                    { icon: TrendingUp, label: "Market Demand",     val: ov.demand_level,              c: "text-amber-400"   },
                    { icon: Clock,      label: "Time to First Job", val: ov.time_to_job,               c: "text-blue-400"    },
                    { icon: Code2,      label: "Core Languages",    val: ov.core_languages?.join(", "),c: "text-violet-400"  },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/[0.025] border border-white/5">
                        <s.icon size={13} className={s.c + " mb-2"} />
                        <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-1">{s.label}</p>
                        <p className={"text-sm font-black " + s.c}>{s.val || "—"}</p>
                    </div>
                ))}
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-2">About This Role</p>
                <p className="text-[13px] text-white/40 leading-relaxed">{ov.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-3">Top Hiring Companies</p>
                    <div className="flex flex-wrap gap-2">{ov.top_companies?.map((co, i) => <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/7 text-white/48 font-medium">{co}</span>)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-3">Core Languages</p>
                    <div className="flex flex-wrap gap-2">{ov.core_languages?.map((l, i) => <span key={i} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">{l}</span>)}</div>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-3">Jump to a Year</p>
                <div className="grid grid-cols-3 gap-3">
                    {years.map((yr, i) => {
                        const yc = C[YEAR_META[i]?.color || "blue"];
                        return (
                            <button key={i} onClick={() => onNavigate("year-" + i)} className={"p-4 rounded-2xl " + yc.bg + " border " + yc.ring + " text-left hover:opacity-80 transition-opacity"}>
                                <p className={"text-[10px] font-black uppercase tracking-widest " + yc.txt + " mb-1"}>Year {yr.year}</p>
                                <p className="text-xs font-black text-white/68">{yr.title}</p>
                                <p className="text-[10px] text-white/25 mt-1">{yr.phases?.length || 0} phases</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const StackTimeline = ({ timeline }) => (
    <div className="space-y-6 text-white">
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Tools You Will Gain</p>
            <h2 className="text-3xl font-black mb-2">Tech Stack Timeline</h2>
            <p className="text-[13px] text-white/32">Technologies progressively added across 3 years.</p>
        </div>
        {timeline?.length ? (
            <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />
                <div className="space-y-8">
                    {timeline.map((yr, i) => {
                        const yc = C[YEAR_META[i]?.color || "blue"];
                        return (
                            <div key={i} className="relative pl-14">
                                <div className={"absolute left-3 top-1 w-4 h-4 rounded-full " + yc.bg + " border-2 " + yc.ring + " flex items-center justify-center"}>
                                    <div className={"w-1.5 h-1.5 rounded-full " + yc.dot} />
                                </div>
                                <p className={"text-[10px] font-black uppercase tracking-widest " + yc.txt + " mb-3"}>Year {yr.year}</p>
                                <div className="flex flex-wrap gap-2">{yr.stack?.map((tool, j) => <Tag key={j} className={yc.bg + " " + yc.ring + " " + yc.txt + " font-bold"}>{tool}</Tag>)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : <p className="text-white/28 text-sm">No timeline data generated.</p>}
    </div>
);

const InterviewPrep = ({ prep }) => {
    if (!prep) return <p className="text-white/28 text-sm">No interview prep data.</p>;
    return (
        <div className="space-y-6 text-white">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-1">Job Readiness</p>
                <h2 className="text-3xl font-black mb-2">Interview Preparation</h2>
                <p className="text-[13px] text-white/32">Start: {prep.start_at} · Duration: {prep.duration}</p>
            </div>
            {prep.areas?.length > 0 && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-3">Focus Areas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {prep.areas.map((area, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.025] border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span className="text-xs text-white/52 font-medium">{area}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {prep.resources?.length > 0 && (
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/17 mb-3">Key Resources</p>
                    <div className="space-y-2">
                        {prep.resources.map((res, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.025] border border-white/5">
                                <span className={"text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 mt-0.5 " + (PRIORITY_BADGE[res.priority] || PRIORITY_BADGE.OPTIONAL)}>{res.priority}</span>
                                <div>
                                    <p className="text-xs font-bold text-white/72">{res.name}</p>
                                    <p className="text-[10px] text-white/25">{res.platform}</p>
                                    {res.why && <p className="text-[10px] text-white/20 italic mt-1">{res.why}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ResourcesSection = ({ resources }) => {
    if (!resources?.length) return <p className="text-white/28 text-sm">No resources data.</p>;
    return (
        <div className="space-y-6 text-white">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Curated Must-Haves</p>
                <h2 className="text-3xl font-black mb-2">Essential Resources</h2>
                <p className="text-[13px] text-white/32">Books, channels, and platforms recommended by engineers in this field.</p>
            </div>
            <div className="space-y-5">
                {resources.map((res, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 mb-4"><span className="text-xl">{res.icon}</span><p className="text-sm font-black text-white/70">{res.category}</p></div>
                        <div className="space-y-4">
                            {res.items?.map((item, j) => (
                                <div key={j} className="pl-3 border-l-2 border-white/5">
                                    <p className="text-xs font-bold text-white/65">{item.name}</p>
                                    <p className="text-[10px] text-white/24">{item.by}</p>
                                    {item.why && <p className="text-[10px] text-white/20 italic mt-0.5 leading-relaxed">{item.why}</p>}
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
        <div className="w-full h-full bg-[#070b14] text-white flex flex-col overflow-hidden">
            <div className="h-11 shrink-0 flex items-center justify-between px-5 border-b border-white/5 bg-[#06090f]/95 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="flex items-center gap-1.5 text-white/20 hover:text-white/65 transition-colors text-[10px] font-bold uppercase tracking-widest">
                        <ArrowLeft size={11} /> Careers
                    </button>
                    <div className="w-px h-3.5 bg-white/7" />
                    <span className="text-[11px] font-black text-white/52">{roadmap.career}</span>
                    {roadmap.overview?.demand_level && (
                        <span className={"hidden sm:inline text-[9px] font-bold px-2 py-0.5 rounded-full border " + (DEMAND_BADGE[roadmap.overview.demand_level] || "")}>
                            {roadmap.overview.demand_level} Demand
                        </span>
                    )}
                    {roadmap.overview?.salary_range && (
                        <span className="hidden md:inline text-[10px] text-white/22 font-mono">{roadmap.overview.salary_range}</span>
                    )}
                </div>
                <button onClick={onRegenerate} className="flex items-center gap-1.5 text-white/16 hover:text-white/50 transition-colors text-[10px] font-bold uppercase tracking-widest">
                    <RotateCcw size={10} /> Regenerate
                </button>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                <nav className="w-56 shrink-0 border-r border-white/5 overflow-y-auto bg-[#05080f] py-3 hidden md:block">
                    {navItems.map(item => {
                        const isActive = activeId === item.id;
                        if (item.kind === "year") {
                            const yc = C[YEAR_META[item.yi]?.color || "blue"];
                            return (
                                <button key={item.id} onClick={() => toggleYear(item.yi)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.025] transition-colors group mt-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <item.Icon size={11} className={yc.txt + " shrink-0"} />
                                        <span className="text-[10px] font-black text-white/48 group-hover:text-white/78 transition-colors leading-tight truncate">{item.label}</span>
                                    </div>
                                    <ChevronDown size={10} className={"text-white/16 shrink-0 transition-transform " + (openYears[item.yi] ? "rotate-180" : "")} />
                                </button>
                            );
                        }
                        if (item.kind === "phase") {
                            const yc = C[YEAR_META[item.yi]?.color || "blue"];
                            return (
                                <button key={item.id} onClick={() => go(item.id)}
                                    className={"w-full flex items-center gap-2 pl-8 pr-3 py-1.5 transition-all text-left " + (isActive ? yc.bg + " border-r-2 " + yc.ring : "hover:bg-white/[0.02]")}>
                                    <div className={"w-1 h-1 rounded-full shrink-0 " + (isActive ? yc.dot : "bg-white/8")} />
                                    <div className="min-w-0">
                                        <p className={"text-[10px] font-bold leading-tight truncate " + (isActive ? "text-white/88" : "text-white/32")}>{item.label}</p>
                                        <p className="text-[9px] text-white/16 font-mono">{item.sub}</p>
                                    </div>
                                </button>
                            );
                        }
                        return (
                            <button key={item.id} onClick={() => go(item.id)}
                                className={"w-full flex items-center gap-2.5 px-4 py-2.5 transition-all " + (isActive ? "bg-white/[0.035] border-r-2 border-indigo-500" : "hover:bg-white/[0.02]")}>
                                <item.Icon size={12} className={isActive ? "text-indigo-400" : "text-white/16"} />
                                <span className={"text-[11px] font-bold " + (isActive ? "text-white/88" : "text-white/30")}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 lg:px-16 lg:py-12">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="max-w-3xl">
                            {activeId === "overview" && <OverviewSection roadmap={roadmap} onNavigate={go} />}
                            {currentPhase && <PhaseDetail phase={currentPhase} yearColor={YEAR_META[currentYearIdx]?.color || "blue"} />}
                            {activeId.startsWith("year-") && !currentPhase && (() => {
                                const yi = parseInt(activeId.split("-")[1]);
                                const yr = years[yi];
                                if (!yr) return null;
                                const yc = C[YEAR_META[yi]?.color || "blue"];
                                return (
                                    <div className="text-white">
                                        <p className={"text-[10px] font-black uppercase tracking-[0.3em] mb-2 " + yc.txt}>Year {yr.year}</p>
                                        <h2 className="text-3xl font-black mb-3">{yr.title}</h2>
                                        <p className="text-[13px] text-white/38 mb-8">{yr.theme}</p>
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
                                                            <p className="text-xs font-black text-white/80 truncate">{ph.title}</p>
                                                            <p className={"text-[10px] " + yc.txt}>{ph.months}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-white/22 shrink-0">
                                                            <span>{ph.skills?.length || 0} skills</span>
                                                            <span>·</span>
                                                            <span>{ph.courses?.length || 0} courses</span>
                                                        </div>
                                                        <ChevronRight size={12} className="text-white/16 shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                            {activeId === "stack-timeline" && <StackTimeline timeline={roadmap.stack_timeline} />}
                            {activeId === "interview-prep" && <InterviewPrep prep={roadmap.interview_prep} />}
                            {activeId === "resources"      && <ResourcesSection resources={roadmap.resources} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const CareerRoadmap = () => {
    const [view, setView] = useState("selector");
    const [roadmap, setRoadmap] = useState(null);
    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        if (view !== "loading") return;
        let i = 0;
        const iv = setInterval(() => { i++; if (i < LOADING_STEPS.length) setLoadingStep(i); }, 1500);
        return () => clearInterval(iv);
    }, [view]);

    const generate = async (career) => {
        setView("loading");
        setLoadingStep(0);
        try {
            const res = await generateFullRoadmap(career);
            setRoadmap(res.data);
            setView("roadmap");
        } catch {
            toast.error("Failed to generate roadmap. Please retry.");
            setView("selector");
        }
    };

    if (view === "selector") return <SelectorView onSelect={generate} />;
    if (view === "loading")  return <LoadingView step={loadingStep} />;
    if (view === "roadmap" && roadmap) return <RoadmapView roadmap={roadmap} onBack={() => setView("selector")} onRegenerate={() => generate(roadmap.career)} />;
    return null;
};

export default CareerRoadmap;
