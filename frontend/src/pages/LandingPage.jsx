import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Sparkles,
    Brain,
    Trophy,
    TrendingUp,
    Zap,
    GraduationCap,
    GitBranch,
    Users,
    Code2,
    Rocket,
    CheckCircle2,
    Mic,
    FileText,
    BarChart3,
    Map,
    Star,
    ChevronRight,
    ChevronDown,
    Layers,
    GitMerge,
    Globe,
    Moon,
    Sun,
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import mustLogo from "../assets/must_logo.png";

/* ─── Tech data (two rows for marquee) ─── */
const TECHS_ROW1 = [
    { name: "Python", color: "#3b82f6", bg: "#1e3a5f" },
    { name: "JavaScript", color: "#fbbf24", bg: "#3d2c00" },
    { name: "React", color: "#38bdf8", bg: "#0c2d3f" },
    { name: "Node.js", color: "#4ade80", bg: "#0a2e14" },
    { name: "TypeScript", color: "#60a5fa", bg: "#1a2f4e" },
    { name: "Java", color: "#fb923c", bg: "#3d1800" },
    { name: "SQL", color: "#f472b6", bg: "#3d1029" },
    { name: "Docker", color: "#38bdf8", bg: "#0c2433" },
    { name: "AWS", color: "#f59e0b", bg: "#3d2600" },
    { name: "Firebase", color: "#fb923c", bg: "#3d1800" },
];

const TECHS_ROW2 = [
    { name: "Git", color: "#f87171", bg: "#3b0a0a" },
    { name: "Linux", color: "#facc15", bg: "#2e2400" },
    { name: "REST APIs", color: "#a78bfa", bg: "#1e1040" },
    { name: "GraphQL", color: "#e879f9", bg: "#2a0a35" },
    { name: "Redis", color: "#f87171", bg: "#3b0a0a" },
    { name: "MongoDB", color: "#4ade80", bg: "#0a2e14" },
    { name: "C++", color: "#60a5fa", bg: "#0c1e3a" },
    { name: "Cloud", color: "#38bdf8", bg: "#0a1e2e" },
    { name: "Security", color: "#f43f5e", bg: "#3b0a14" },
    { name: "Algorithms", color: "#a78bfa", bg: "#1e1040" },
    { name: "System Design", color: "#fbbf24", bg: "#3d2c00" },
];

const TEAM_BULLETS = [
    "Find talented teammates with different skill sets",
    "Collaborate on real open-source projects",
    "Build projects from idea to deployment",
    "Learn version control and team workflows",
    "Impress employers with team-based accomplishments",
];

const INTERVIEW_ITEMS = [
    { icon: Mic, title: "Mock Interviews", desc: "Simulate real interview pressure with timed sessions and instant feedback." },
    { icon: Brain, title: "AI-Powered Analysis", desc: "Get deep breakdowns of your answers, tone, and confidence score." },
    { icon: FileText, title: "Question Bank", desc: "500+ curated questions sorted by topic, company, and difficulty." },
    { icon: BarChart3, title: "Performance Tracking", desc: "Monitor improvement across sessions with detailed analytics." },
];

const JOURNEY_STEPS = [
    {
        step: "01", icon: Map, title: "Pick Your Track",
        desc: "Choose from Web Dev, AI/ML, Data Engineering, Cybersecurity, and more.",
        detail: "We offer 8 specialization tracks crafted by industry mentors. Each track gives you a Bird's-eye view of what to learn, why it matters, and which companies hire for it. You'll answer a short quiz and we'll suggest the best starting point based on your background and goals.",
    },
    {
        step: "02", icon: GitBranch, title: "Follow the Roadmap",
        desc: "Structured weekly modules keep you on course — no guesswork.",
        detail: "Each roadmap is broken into weekly sprints with clear deliverables. You get curated resources (videos, docs, exercises), progress checkpoints, and AI-generated summaries for every topic. The roadmap adapts as you go — slower weeks get extra support, faster weeks unlock bonus content.",
    },
    {
        step: "03", icon: GitMerge, title: "Build & Contribute",
        desc: "Apply skills through team projects and open-source contributions.",
        detail: "Theory without practice is forgettable. After each module you'll complete a mini-project, and after each track milestone you'll join a team to contribute to a real open-source codebase. Pull requests, code reviews, issue tracking — all the real-world workflows employers expect.",
    },
    {
        step: "04", icon: Mic, title: "Ace Interviews",
        desc: "Practice, evaluate, and walk into any interview with confidence.",
        detail: "Our AI interview engine runs timed mock sessions that mirror actual technical interviews at top companies. It analyses your answers for correctness, communication clarity, and confidence. Each session concludes with a scorecard and personalised improvement tips so you get better, fast.",
    },
    {
        step: "05", icon: Star, title: "Land Your Role",
        desc: "Showcase a portfolio of real work that employers actually care about.",
        detail: "By the end of your journey you'll have a public portfolio of shipped projects, merged PRs, and documented contributions — all linkable from a single profile URL. Our employer network gets notified when profile scores hit hiring thresholds, so opportunities come to you.",
    },
];

/* ══════════════════════════════════════════════════════════ */

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const canvasRef = useRef(null);
    const [openStep, setOpenStep] = useState(null);

    // Dynamic Theme Styles
    const themeClass = isDark ? "bg-[#0a0e1a] text-white" : "bg-[#FAFAFF] text-slate-900";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500";
    const cardBg = isDark ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100";
    const dividerClass = isDark ? "via-white/[0.07]" : "via-slate-200";

    // Particle background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = document.body.scrollHeight);
        const pts = Array.from({ length: 70 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.4 + 0.3,
            dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
            a: Math.random() * (isDark ? 0.45 : 0.25) + 0.08,
        }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            pts.forEach((p) => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? `rgba(99,102,241,${p.a})` : `rgba(79,70,229,${p.a})`; ctx.fill();
                p.x += p.dx; p.y += p.dy;
                if (p.x < 0 || p.x > W) p.dx *= -1;
                if (p.y < 0 || p.y > H) p.dy *= -1;
            });
            raf = requestAnimationFrame(draw);
        };
        draw();
        const onR = () => { W = canvas.width = window.innerWidth; H = canvas.height = document.body.scrollHeight; };
        window.addEventListener("resize", onR);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
    }, [isDark]);

    const toggleStep = (i) => setOpenStep(openStep === i ? null : i);

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-[#6366f1]/30 overflow-x-hidden ${themeClass}`}>
            {/* Inline keyframes */}
            <style>{`
                @keyframes marquee-left  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .marquee-track-left  { animation: marquee-left  30s linear infinite; }
                .marquee-track-right { animation: marquee-right 28s linear infinite; }
                .marquee-track-left:hover, .marquee-track-right:hover { animation-play-state: paused; }
                .step-detail {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows 0.35s ease;
                }
                .step-detail.open {
                    grid-template-rows: 1fr;
                }
                .step-detail-inner { overflow: hidden; }
            `}</style>

            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.55 }} />

            {/* ══ HEADER ══ */}
            <header className={`relative z-50 flex justify-between items-center px-6 lg:px-12 py-4 border-b ${isDark ? 'border-white/[0.04]' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <img
                        src={mustLogo} alt="MUST"
                        className="h-14 w-auto object-contain"
                    />
                    <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-semibold text-[17px] tracking-tight`}>
                        Must<span className="text-[#818cf8]">Academy</span>
                    </span>
                </div>
                <nav className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <Link to="/login" className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>Login</Link>
                    <Link to="/register" className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'}`}>Register</Link>
                </nav>
            </header>

            {/* ══ §1 SkillUpX Hero ══ */}
            <section className="relative z-10 pt-20 pb-32 px-6 lg:px-12">
                <div className="absolute top-0 left-1/3 w-[520px] h-[520px] bg-[#6366f1]/10 rounded-full blur-[130px] pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-[#8b5cf6]/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border transition-colors ${isDark ? 'bg-[#6366f1]/10 border-[#6366f1]/20 text-[#818cf8]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                            <Sparkles className="w-3.5 h-3.5" /> Introducing To MustAcademy
                        </span>
                    </div>
                    <h1 className="text-center text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.07] mb-6">
                        <span className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Learn by Doing.</span>
                        <span className="block bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">Grow by Contributing.</span>
                    </h1>
                    <p className={`text-center text-[17px] max-w-2xl mx-auto leading-relaxed mb-14 ${textMuted}`}>
                        MustAcademy is a smart platform designed for students who want to learn, grow, and showcase their abilities.
                        Contribute to real open-source projects, collaborate with peers, and build a meaningful portfolio that impresses employers.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { icon: Users, title: "Collaborate & Form Teams", desc: "Join real open-source projects, form squads, and ship things that matter.", accent: "from-[#6366f1] to-[#818cf8]", glow: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)" },
                            { icon: Code2, title: "Battle with your friends", desc: "Sharpen your skills against your classmates. Compete and level up every day.", accent: "from-[#8b5cf6] to-[#a78bfa]", glow: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.08)" },
                            { icon: Rocket, title: "Real-World Experience", desc: "Build a portfolio with contributions that actually impress employers.", accent: "from-[#ec4899] to-[#f472b6]", glow: isDark ? "rgba(236,72,153,0.15)" : "rgba(236,72,153,0.08)" },
                        ].map((f) => (
                            <div key={f.title} className={`group relative p-7 rounded-2xl transition-all duration-300 ${cardBg}`} style={{ boxShadow: `0 0 40px ${f.glow}` }}>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-5 shadow-lg`}><f.icon className="w-5 h-5 text-white" /></div>
                                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
                                <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* ══ §2 AI Roadmap Hero ══ */}
            <section className="relative z-10 pt-28 pb-24 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight leading-[1.1] mb-5">
                        Master Computer Science with{" "}
                        <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-transparent">AI-Powered Roadmaps</span>
                    </h2>
                    <p className={`text-[17px] max-w-2xl mx-auto leading-relaxed mb-12 ${textMuted}`}>
                        Your personalized journey from fundamentals to mastery. Learn smarter with structured paths, deep explanations, and AI guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link to="/dashboard" className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-[15px] hover:shadow-2xl hover:shadow-lg/30 flex items-center gap-2 overflow-hidden transition-all">
                            <span className="relative z-10 flex items-center gap-2">Start Learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                            <span className="absolute inset-0 bg-gradient-to-r from-[#818cf8] to-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                        <Link to="/dashboard" className={`px-8 py-3.5 rounded-xl transition-all font-medium text-[15px] flex items-center gap-2 ${isDark ? 'bg-white/[0.04] text-white border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.16]' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300'}`}>
                            <GraduationCap className="w-4 h-4 text-[#818cf8]" /> Explore Roadmaps
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-20 max-w-3xl mx-auto">
                        {[["50K+", "Active Learners"], ["500+", "Topics Covered"], ["95%", "Success Rate"], ["24/7", "AI Support"]].map(([v, l]) => (
                            <div key={l} className={`p-5 rounded-2xl transition-colors ${isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-100'}`}>
                                <div className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-1">{v}</div>
                                <div className={`text-xs font-medium tracking-wide uppercase ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{l}</div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                        {[
                            { icon: GitBranch, title: "Structured Roadmaps", desc: "Curated learning paths built by industry experts", color: "from-[#6366f1] to-[#8b5cf6]" },
                            { icon: Brain, title: "Deep Explanations", desc: "Toggle between normal and deep-dive mode per topic", color: "from-[#8b5cf6] to-[#a855f7]" },
                            { icon: Sparkles, title: "AI Assistant", desc: "Instant personalized guidance available 24/7", color: "from-[#ec4899] to-[#f43f5e]" },
                            { icon: Trophy, title: "Interview Prep", desc: "Real-world coding challenges and mock interviews", color: "from-[#10b981] to-[#14b8a6]" },
                            { icon: Zap, title: "Project Corner", desc: "Start implementing your ideas with our guidance and support", color: "from-[#f59e0b] to-[#eab308]" },
                            { icon: TrendingUp, title: "Market Trends", desc: "Stay current with live tech industry insights", color: "from-[#6366f1] to-[#8b5cf6]" },
                        ].map((f) => (
                            <div key={f.title} className={`group p-7 rounded-2xl transition-all duration-300 ${cardBg}`}>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}><f.icon className="w-5 h-5 text-white" /></div>
                                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* ══ §3 Technologies — Infinite Marquee ══ */}
            <section className="relative z-10 py-24 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 lg:px-12 mb-12">
                    <SectionLabel icon={Layers} label="Stack" isDark={isDark} />
                    <h2 className={`text-center text-4xl sm:text-5xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Technologies You'll{" "}
                        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Master</span>
                    </h2>
                    <p className={`text-center text-[16px] max-w-xl mx-auto leading-relaxed ${textMuted}`}>
                        From foundational languages to cutting-edge tools — build a skill set that companies actually hire for.
                    </p>
                </div>

                {/* Row 1 — scrolls left */}
                <div className="relative mb-4 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                    <div className="flex w-max marquee-track-left gap-3">
                        {[...TECHS_ROW1, ...TECHS_ROW1].map((t, i) => (
                            <TechBadge key={`r1-${i}`} t={t} isDark={isDark} />
                        ))}
                    </div>
                </div>

                {/* Row 2 — scrolls right */}
                <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                    <div className="flex w-max marquee-track-right gap-3">
                        {[...TECHS_ROW2, ...TECHS_ROW2].map((t, i) => (
                            <TechBadge key={`r2-${i}`} t={t} isDark={isDark} />
                        ))}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* ══ §4 Form Teams ══ */}
            <section className="relative z-10 py-28 px-6 lg:px-12">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-[#6366f1]/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <SectionLabel icon={Users} label="Collaboration" isDark={isDark} />
                        <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Form Teams &amp;{" "}
                            <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Collaborate on Projects</span>
                        </h2>
                        <p className={`text-[16px] leading-relaxed mb-8 ${textMuted}`}>
                            Mustacademy enables students to form teams, work together on real-world projects, and build meaningful experience.
                            Connect with like-minded developers, share ideas, and deliver projects that showcase your teamwork abilities to employers.
                        </p>
                        <ul className="space-y-3">
                            {TEAM_BULLETS.map((b) => (
                                <li key={b} className={`flex items-start gap-3 text-[15px] ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                                    <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-indigo-600'}`} />{b}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register" className="inline-flex items-center gap-2 mt-10 px-7 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-[15px] hover:shadow-xl hover:shadow-lg/25 transition-all">
                            Start Collaborating <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: GitMerge, label: "Open-Source PRs", count: "2.4K+", color: "from-[#6366f1] to-[#818cf8]" },
                            { icon: Users, label: "Active Teams", count: "380+", color: "from-[#8b5cf6] to-[#a78bfa]" },
                            { icon: Globe, label: "Projects Shipped", count: "940+", color: "from-[#ec4899] to-[#f472b6]" },
                            { icon: Star, label: "Employer Matches", count: "1.2K+", color: "from-[#10b981] to-[#14b8a6]" },
                        ].map((c) => (
                            <div key={c.label} className={`p-6 rounded-2xl transition-colors text-center ${isDark ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-100'}`}>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mx-auto mb-3`}><c.icon className="w-5 h-5 text-white" /></div>
                                <div className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white to-gray-300' : 'from-slate-900 to-slate-600'}`}>{c.count}</div>
                                <div className={`text-xs mt-1 font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{c.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* ══ §5 Crack Any Interview ══ */}
            <section className="relative z-10 py-28 px-6 lg:px-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8b5cf6]/8 rounded-full blur-[140px] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <SectionLabel icon={Mic} label="Interview Prep" isDark={isDark} />
                        <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Crack Any <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Interview</span>
                        </h2>
                        <p className={`text-[16px] max-w-xl mx-auto leading-relaxed ${textMuted}`}>
                            Land your dream role with AI-driven mock sessions, curated question banks, and real-time performance analysis.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {INTERVIEW_ITEMS.map((item) => (
                            <div key={item.title} className={`group p-7 rounded-2xl transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-[#6366f1]/30' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md'}`}>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-lg"><item.icon className="w-5 h-5 text-white" /></div>
                                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                                <p className={`text-sm leading-relaxed ${textMuted}`}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-14 relative rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 via-[#8b5cf6]/6 to-transparent" />
                        <div className="absolute inset-0 border border-[#6366f1]/15 rounded-2xl" />
                        <div className={`relative px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 ${isDark ? '' : 'bg-indigo-50/50 rounded-2xl'}`}>
                            <div>
                                <div className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to pass your next interview?</div>
                                <div className={`text-sm ${textMuted}`}>Start practicing today — free, no setup required.</div>
                            </div>
                            <Link to="/register" className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-[15px] hover:shadow-xl hover:shadow-lg/25 transition-all">
                                Start Practicing <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* ══ §6 From Zero to Industry-Ready — Accordion ══ */}
            <section className="relative z-10 py-28 px-6 lg:px-12">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#6366f1]/6 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <SectionLabel icon={Rocket} label="Your Journey" isDark={isDark} />
                        <h2 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            From{" "}
                            <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">Zero</span>{" "}
                            to Industry-Ready
                        </h2>
                        <p className={`text-[16px] max-w-xl mx-auto leading-relaxed ${textMuted}`}>
                            A clear, structured path that takes you from complete beginner to a confident, employable developer.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {JOURNEY_STEPS.map((s, i) => {
                            const isOpen = openStep === i;
                            return (
                                <div
                                    key={s.step}
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? (isDark ? "bg-white/[0.06] border-[#6366f1]/40 shadow-lg" : "bg-white border-indigo-200 shadow-md") : (isDark ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]" : "bg-white border-slate-200 shadow-sm hover:border-indigo-100")}`}
                                >
                                    {/* Header row — always visible, clickable */}
                                    <button
                                        onClick={() => toggleStep(i)}
                                        className="w-full flex items-center gap-5 p-6 text-left"
                                    >
                                        {/* Step number */}
                                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 ${isOpen ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] scale-105" : "bg-gradient-to-br from-[#6366f1]/60 to-[#8b5cf6]/60"}`}>
                                            {s.step}
                                        </div>
 
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <s.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isOpen ? "text-[#a78bfa]" : "text-[#818cf8]"}`} />
                                                <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${textMuted}`}>{s.desc}</p>
                                        </div>
 
                                        {/* Chevron */}
                                        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#818cf8]" : "text-gray-500"}`} />
                                    </button>
 
                                    {/* Detail panel — animated */}
                                    <div className={`step-detail${isOpen ? " open" : ""}`}>
                                        <div className="step-detail-inner">
                                            <div className="px-6 pb-6 pt-0">
                                                <div className={`ml-16 pl-5 border-l-2 ${isDark ? 'border-[#6366f1]/30' : 'border-indigo-100'}`}>
                                                    <p className={`text-[15px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{s.detail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Footer CTA ── */}
            <section className="relative z-10 py-24 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/15 via-[#8b5cf6]/8 to-transparent" />
                        <div className="absolute inset-0 border border-[#6366f1]/20 rounded-3xl" />
                        <div className="relative p-14 lg:p-20 text-center space-y-6">
                            <h2 className={`text-4xl lg:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to start your journey?</h2>
                            <p className={`text-[17px] max-w-xl mx-auto ${textMuted}`}>Join thousands of learners mastering Computer Science with AI-powered guidance.</p>
                            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-[15px] hover:shadow-2xl hover:shadow-lg/30 transition-all">
                                Get Started Free <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ── Reusable ── */
function Divider({ isDark }) {
    return (
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
            <div className={`h-px w-full bg-gradient-to-r from-transparent ${isDark ? 'via-white/[0.07]' : 'via-slate-200'} to-transparent`} />
        </div>
    );
}

function SectionLabel({ icon: Icon, label, isDark }) {
    return (
        <div className="flex justify-center mb-5">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border transition-colors ${isDark ? 'bg-[#6366f1]/10 border-[#6366f1]/20 text-[#818cf8]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
            </span>
        </div>
    );
}

function TechBadge({ t, isDark }) {
    return (
        <span
            className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold border whitespace-nowrap select-none cursor-default transition-all hover:scale-105"
            style={{
                color: t.color,
                backgroundColor: isDark ? t.bg : `${t.color}15`,
                borderColor: isDark ? t.color + "40" : t.color + "60",
                boxShadow: isDark ? `0 0 14px ${t.color}1a` : `0 2px 8px ${t.color}10`,
            }}
        >
            {t.name}
        </span>
    );
}

