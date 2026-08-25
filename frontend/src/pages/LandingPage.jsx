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
    Map,
    Star,
    ChevronRight,
    ChevronDown,
    Layers,
    GitMerge,
    Moon,
    Sun,
    MessageSquare,
    Menu,
    X,
    BookOpen,
    Target,
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import mustLogo from "../assets/must_logo.png";

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

const NAV_LINKS = [
    { label: "Features", id: "features" },
    { label: "Arena", id: "arena" },
    { label: "How It Works", id: "journey" },
];

const FEATURES = [
    { icon: GitBranch, title: "Structured Roadmaps", desc: "Curated paths from fundamentals to job-ready skills.", color: "from-[#6366f1] to-[#8b5cf6]" },
    { icon: Brain, title: "1-on-1 AI Tutor", desc: "Ask questions, get examples, and practice on every topic.", color: "from-[#8b5cf6] to-[#a855f7]" },
    { icon: Zap, title: "Neural Clash Arena", desc: "Live quiz battles with classmates — learn faster under pressure.", color: "from-[#ec4899] to-[#f43f5e]" },
    { icon: Mic, title: "Interview Boardroom", desc: "Voice mock interviews with AI feedback and scorecards.", color: "from-[#10b981] to-[#14b8a6]" },
    { icon: Users, title: "Team Projects", desc: "Collaborate on real projects and build portfolio-worthy work.", color: "from-[#6366f1] to-[#818cf8]" },
    { icon: TrendingUp, title: "Career Tracking", desc: "See what to learn next for your target role.", color: "from-[#f59e0b] to-[#eab308]" },
];

const JOURNEY_STEPS = [
    {
        step: "01", icon: Map, title: "Pick Your Track",
        desc: "Web Dev, AI/ML, Cybersecurity, and more — matched to your goals.",
        detail: "Answer a short quiz and get a suggested starting track. Each path shows what to learn, why it matters, and which skills employers expect.",
    },
    {
        step: "02", icon: GitBranch, title: "Follow the Roadmap",
        desc: "Weekly modules with clear deliverables — no guesswork.",
        detail: "Curated resources, progress checkpoints, and AI summaries for every topic. The roadmap adapts as you go.",
    },
    {
        step: "03", icon: GitMerge, title: "Build & Compete",
        desc: "Mini-projects, team work, and live arena rounds.",
        detail: "Apply what you learn through hands-on labs, team contributions, and Neural Clash sessions that make revision stick.",
    },
    {
        step: "04", icon: Mic, title: "Practice Interviews",
        desc: "Mock sessions that mirror real technical interviews.",
        detail: "The Boardroom runs voice-based mock interviews with instant feedback, scorecards, and tips on clarity and confidence.",
    },
    {
        step: "05", icon: Star, title: "Show Your Work",
        desc: "A portfolio of projects, progress, and proof.",
        detail: "Ship projects, track completed topics, and walk into interviews with work you can actually talk about.",
    },
];

const TESTIMONIALS = [
    {
        quote: "Neural Clash makes studying fun. I picked up algorithms faster competing with classmates than reading alone.",
        name: "Ahmed K.", role: "CS Student", avatar: "A", color: "#6366f1",
    },
    {
        quote: "The AI Tutor explained recursion with examples I could follow step by step. Better than rewatching lectures.",
        name: "Sara M.", role: "Software Engineering Intern", avatar: "S", color: "#8b5cf6",
    },
    {
        quote: "After a few Boardroom sessions I felt ready for my technical interview. The voice practice made the difference.",
        name: "Omar L.", role: "Final-year CS student", avatar: "O", color: "#ec4899",
    },
];

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const canvasRef = useRef(null);
    const [openStep, setOpenStep] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const themeClass = isDark ? "bg-[#0a0e1a] text-white" : "bg-[#FAFAFF] text-slate-900";
    const textMuted = isDark ? "text-gray-400" : "text-slate-500";
    const cardBg = isDark
        ? "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.12]"
        : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100";

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = document.body.scrollHeight);
        const pts = Array.from({ length: 50 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.4 + 0.3,
            dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
            a: Math.random() * (isDark ? 0.4 : 0.2) + 0.06,
        }));
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            pts.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? `rgba(99,102,241,${p.a})` : `rgba(79,70,229,${p.a})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
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

    const scrollTo = (id) => {
        setMobileOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const btnPrimary = "inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-[15px] hover:shadow-xl hover:shadow-indigo-500/20 transition-all";
    const btnSecondary = isDark
        ? "inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/[0.06] text-white border border-white/10 hover:bg-white/10 font-medium text-[15px] transition-all"
        : "inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:shadow-md font-medium text-[15px] transition-all";

    return (
        <div id="main-content" tabIndex={-1} className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-[#6366f1]/30 overflow-x-hidden ${themeClass}`}>
            <style>{`
                html { scroll-behavior: smooth; }
                @keyframes marquee-left  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .marquee-track-left  { animation: marquee-left  30s linear infinite; }
                .marquee-track-right { animation: marquee-right 28s linear infinite; }
                .marquee-track-left:hover, .marquee-track-right:hover { animation-play-state: paused; }
                .step-detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; }
                .step-detail.open { grid-template-rows: 1fr; }
                .step-detail-inner { overflow: hidden; }
            `}</style>

            <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.45 }} />

            {/* Header */}
            <header className={`relative z-50 border-b ${isDark ? 'border-white/[0.04] bg-[#0a0e1a]/80 backdrop-blur-md' : 'border-slate-200 bg-[#FAFAFF]/90 backdrop-blur-md'}`}>
                <div className="flex justify-between items-center px-6 lg:px-12 py-4">
                    <div className="flex items-center gap-3">
                        <img src={mustLogo} alt="MustAcademy" className="h-11 w-auto object-contain" />
                        <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-semibold text-[17px] tracking-tight`}>
                            Must<span className="text-[#818cf8]">Academy</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ label, id }) => (
                            <button
                                key={id}
                                onClick={() => scrollTo(id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`p-2 rounded-full transition-all ${isDark ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className={`hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>Login</Link>
                        <Link to="/register" className={`hidden sm:inline-flex px-5 py-2 rounded-full text-sm font-medium transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'}`}>Get Started</Link>
                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen((v) => !v)}
                            className={`md:hidden p-2 rounded-lg ${isDark ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className={`md:hidden border-t px-6 py-4 space-y-2 ${isDark ? 'border-white/5 bg-[#0a0e1a]' : 'border-slate-200 bg-white'}`}>
                        {NAV_LINKS.map(({ label, id }) => (
                            <button key={id} onClick={() => scrollTo(id)} className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}>
                                {label}
                            </button>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <Link to="/login" onClick={() => setMobileOpen(false)} className={`flex-1 text-center py-3 rounded-xl text-sm font-medium border ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-700'}`}>Login</Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white">Get Started</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero */}
            <section className="relative z-10 pt-16 pb-20 lg:pt-24 lg:pb-28 px-6 lg:px-12">
                <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 right-0 w-[360px] h-[360px] bg-[#8b5cf6]/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
                    <div>
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border mb-6 ${isDark ? 'bg-[#6366f1]/10 border-[#6366f1]/20 text-[#818cf8]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                            <Sparkles className="w-3.5 h-3.5" /> Built for CS students
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] mb-5">
                            <span className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Learn by doing.</span>
                            <span className="block bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#c084fc] bg-clip-text text-transparent">Ship work you can show.</span>
                        </h1>
                        <p className={`text-[17px] leading-relaxed mb-8 max-w-lg ${textMuted}`}>
                            Roadmaps, AI tutoring, live quiz arenas, and voice mock interviews — one platform to go from coursework to interview-ready.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <Link to="/register" className={btnPrimary}>
                                Start free <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button type="button" onClick={() => scrollTo("features")} className={btnSecondary}>
                                <GraduationCap className="w-4 h-4 text-[#818cf8]" /> See what's inside
                            </button>
                        </div>
                        <ul className="space-y-2.5">
                            {["Structured CS roadmaps with interactive labs", "Neural Clash — live quiz battles with friends", "Boardroom voice interviews with AI feedback"].map((line) => (
                                <li key={line} className={`flex items-center gap-2.5 text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <HeroPreview isDark={isDark} />
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Features */}
            <section id="features" className="relative z-10 py-24 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <SectionLabel icon={Layers} label="Platform" isDark={isDark} />
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                            Everything you need to{" "}
                            <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-transparent">level up</span>
                        </h2>
                        <p className={`text-[16px] max-w-2xl mx-auto leading-relaxed ${textMuted}`}>
                            No scattered tutorials. One place to learn, practice, compete, and prepare for real interviews.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                        {FEATURES.map((f) => (
                            <div key={f.title} className={`group p-6 rounded-2xl border transition-all duration-300 ${cardBg}`}>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                                    <f.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                                <p className={`text-sm leading-relaxed ${textMuted}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link to="/register" className={btnPrimary}>Create your free account <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Tech marquee */}
            <section className="relative z-10 py-20 overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 lg:px-12 mb-10">
                    <h2 className={`text-center text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Skills you'll actually use on the job
                    </h2>
                </div>
                <div className="relative mb-4 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                    <div className="flex w-max marquee-track-left gap-3">
                        {[...TECHS_ROW1, ...TECHS_ROW1].map((t, i) => <TechBadge key={`r1-${i}`} t={t} isDark={isDark} />)}
                    </div>
                </div>
                <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                    <div className="flex w-max marquee-track-right gap-3">
                        {[...TECHS_ROW2, ...TECHS_ROW2].map((t, i) => <TechBadge key={`r2-${i}`} t={t} isDark={isDark} />)}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Signature: Arena + Boardroom */}
            <section id="arena" className="relative z-10 py-24 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <SectionLabel icon={Zap} label="Standout features" isDark={isDark} />
                        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Where MustAcademy feels different
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Arena */}
                        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'border-indigo-500/20 bg-white/[0.02]' : 'border-indigo-100 bg-white shadow-lg'}`}>
                            <div className="p-8 pb-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <Zap className="w-3.5 h-3.5" /> Neural Clash Arena
                                </div>
                                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Battle classmates in real time</h3>
                                <p className={`text-sm leading-relaxed mb-6 ${textMuted}`}>
                                    Host a live quiz on any CS topic. PIN-based rooms, leaderboards, and instant feedback — studying that feels like a game.
                                </p>
                            </div>
                            <div className="mx-6 mb-6 rounded-2xl overflow-hidden border border-indigo-500/20 shadow-xl">
                                <div className="bg-[#0d0f2b] px-5 py-4 text-center border-b border-white/5">
                                    <div className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Game PIN</div>
                                    <div className="text-3xl font-black text-white tracking-[0.35em] font-mono">8 4 7 2 1</div>
                                </div>
                                <div className="bg-[#111428] px-5 py-4 text-center">
                                    <p className="text-white font-semibold text-sm">What is the time complexity of binary search?</p>
                                </div>
                                <div className="grid grid-cols-2">
                                    {[
                                        { c: '#e21b3c', s: '▲', t: 'O(log n)' },
                                        { c: '#1368ce', s: '◆', t: 'O(n)' },
                                        { c: '#d89e00', s: '●', t: 'O(n²)' },
                                        { c: '#26890c', s: '■', t: 'O(1)' },
                                    ].map((a) => (
                                        <div key={a.t} className="flex items-center gap-2 px-4 py-3 text-white font-bold text-xs border-t border-r border-white/5" style={{ background: a.c }}>
                                            <span className="opacity-70">{a.s}</span> {a.t}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Boardroom */}
                        <div className={`rounded-3xl border overflow-hidden ${isDark ? 'border-indigo-500/20 bg-white/[0.02]' : 'border-indigo-100 bg-white shadow-lg'}`}>
                            <div className="p-8 pb-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <Mic className="w-3.5 h-3.5" /> Interview Boardroom
                                </div>
                                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Practice out loud, not on paper</h3>
                                <p className={`text-sm leading-relaxed mb-6 ${textMuted}`}>
                                    Voice mock interviews with an AI interviewer. Get a scorecard on technical depth, clarity, and confidence after each session.
                                </p>
                            </div>
                            <div className={`mx-6 mb-6 rounded-2xl border p-5 space-y-4 ${isDark ? 'border-white/10 bg-[#0d0f1e]' : 'border-slate-200 bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                                        <Mic className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Marcus Sterling</div>
                                        <div className={`text-[10px] ${textMuted}`}>Senior interviewer · Live session</div>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-emerald-500 font-semibold">Listening</span>
                                    </div>
                                </div>
                                <div className={`rounded-xl p-4 text-sm leading-relaxed ${isDark ? 'bg-white/5 text-gray-300' : 'bg-white text-slate-600 border border-slate-100'}`}>
                                    "Walk me through how you'd design a rate limiter for an API. What trade-offs would you consider?"
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <div className={`text-xs ${textMuted}`}>Technical score</div>
                                    <div className="text-2xl font-black text-indigo-500">78</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/register" className={btnPrimary}>Try it yourself <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Platform preview */}
            <section className="relative z-10 py-24 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center">
                        <SectionLabel icon={BookOpen} label="Inside the app" isDark={isDark} />
                        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Learn with structure, not chaos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <div className={`px-4 py-3 flex items-center gap-2 border-b ${isDark ? 'bg-[#0d0f1e] border-white/5' : 'bg-slate-800 border-white/10'}`}>
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                                <span className="ml-2 text-[11px] text-white/40 font-mono">1-on-1 AI Tutor</span>
                            </div>
                            <div className={`p-5 space-y-4 ${isDark ? 'bg-[#0d0f1e]' : 'bg-slate-900'}`}>
                                <p className="text-white/90 text-sm font-medium">How does a binary search tree stay balanced?</p>
                                <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-indigo-100/90 text-sm leading-relaxed">
                                    A balanced BST keeps height O(log n) so search stays fast. AVL and Red-Black trees re-balance after inserts by rotating nodes when subtrees grow uneven.
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-xs">Ask a follow-up</span>
                                    <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs">Quick quiz</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>A tutor on every topic</h3>
                            <p className={`text-[15px] leading-relaxed ${textMuted}`}>
                                Open any lesson and practice with a 1-on-1 AI Tutor — ask questions, get examples, run a quick quiz, and keep notes without sitting through a full lecture first.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="order-2 lg:order-1">
                            <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Know what to learn next</h3>
                            <p className={`text-[15px] leading-relaxed ${textMuted}`}>
                                Career roadmaps map your goal role to concrete skills. Track progress topic by topic and see what's left before you're interview-ready.
                            </p>
                        </div>
                        <div className={`order-1 lg:order-2 rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'border-white/10 bg-[#0d0f1e]' : 'border-slate-200 bg-white'}`}>
                            <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Frontend Engineer</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Your progress</div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { label: "HTML & CSS", pct: 100, color: '#10b981' },
                                    { label: "JavaScript", pct: 85, color: '#6366f1' },
                                    { label: "React", pct: 60, color: '#8b5cf6' },
                                    { label: "TypeScript", pct: 20, color: '#f59e0b' },
                                ].map((row) => (
                                    <div key={row.label} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{row.label}</span>
                                            <span className="text-[10px] font-bold" style={{ color: row.color }}>{row.pct}%</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                                            <div className="h-full rounded-full transition-all" style={{ width: `${row.pct}%`, background: row.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Testimonials */}
            <section className="relative z-10 py-20 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <SectionLabel icon={MessageSquare} label="Early feedback" isDark={isDark} />
                        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Students who've tried it
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className={`p-6 rounded-2xl border flex flex-col ${cardBg}`}>
                                <p className={`text-[15px] leading-relaxed mb-6 flex-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>"{t.quote}"</p>
                                <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: t.color }}>{t.avatar}</div>
                                    <div>
                                        <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</div>
                                        <div className={`text-xs ${textMuted}`}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Divider isDark={isDark} />

            {/* Journey */}
            <section id="journey" className="relative z-10 py-24 px-6 lg:px-12">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-14">
                        <SectionLabel icon={Rocket} label="How it works" isDark={isDark} />
                        <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            From first topic to interview day
                        </h2>
                        <p className={`text-[16px] ${textMuted}`}>Five steps. No fluff.</p>
                    </div>

                    <div className="space-y-3">
                        {JOURNEY_STEPS.map((s, i) => {
                            const isOpen = openStep === i;
                            return (
                                <div
                                    key={s.step}
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? (isDark ? "bg-white/[0.06] border-[#6366f1]/40 shadow-lg" : "bg-white border-indigo-200 shadow-md") : cardBg}`}
                                >
                                    <button type="button" onClick={() => setOpenStep(isOpen ? null : i)} className="w-full flex items-center gap-5 p-5 sm:p-6 text-left">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${isOpen ? "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" : "bg-gradient-to-br from-[#6366f1]/60 to-[#8b5cf6]/60"}`}>
                                            {s.step}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <s.icon className="w-4 h-4 text-[#818cf8] flex-shrink-0" />
                                                <span className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</span>
                                            </div>
                                            <p className={`text-sm ${textMuted}`}>{s.desc}</p>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#818cf8]" : "text-gray-500"}`} />
                                    </button>
                                    <div className={`step-detail${isOpen ? " open" : ""}`}>
                                        <div className="step-detail-inner">
                                            <div className="px-6 pb-6 pt-0">
                                                <div className={`ml-14 sm:ml-16 pl-4 border-l-2 ${isDark ? 'border-[#6366f1]/30' : 'border-indigo-100'}`}>
                                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{s.detail}</p>
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

            {/* Final CTA */}
            <section className="relative z-10 py-20 px-6 lg:px-12">
                <div className="max-w-3xl mx-auto">
                    <div className={`relative rounded-3xl overflow-hidden border p-12 lg:p-16 text-center ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg'}`}>
                        <Target className={`w-10 h-10 mx-auto mb-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h2 className={`text-3xl lg:text-4xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to start?</h2>
                        <p className={`text-[16px] max-w-md mx-auto mb-8 ${textMuted}`}>Free to join. Pick a track, open a lesson, or jump into the arena.</p>
                        <Link to="/register" className={btnPrimary}>Get started free <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`relative z-10 border-t px-6 lg:px-12 py-12 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={mustLogo} alt="" className="h-9 w-auto" />
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>MustAcademy</span>
                        </div>
                        <p className={`text-sm max-w-sm leading-relaxed ${textMuted}`}>
                            A CS learning platform for students who want roadmaps, practice, and proof of work — not another playlist.
                        </p>
                    </div>
                    <div>
                        <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Explore</div>
                        <ul className="space-y-2">
                            {NAV_LINKS.map(({ label, id }) => (
                                <li key={id}>
                                    <button type="button" onClick={() => scrollTo(id)} className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}>{label}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Account</div>
                        <ul className="space-y-2">
                            <li><Link to="/login" className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}>Login</Link></li>
                            <li><Link to="/register" className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}>Register</Link></li>
                        </ul>
                    </div>
                </div>
                <div className={`max-w-6xl mx-auto mt-10 pt-6 border-t text-center text-xs ${isDark ? 'border-white/5 text-gray-500' : 'border-slate-100 text-slate-400'}`}>
                    © {new Date().getFullYear()} MustAcademy. Built for CS students.
                </div>
            </footer>
        </div>
    );
}

function HeroPreview({ isDark }) {
    return (
        <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 rounded-3xl blur-2xl" />
            <div className={`relative rounded-2xl border overflow-hidden shadow-2xl ${isDark ? 'border-white/10 bg-[#0d0f1e]' : 'border-slate-200 bg-white'}`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <span className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-slate-600'}`}>Your dashboard</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold">On track</span>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className={isDark ? 'text-white/60' : 'text-slate-500'}>Data Structures</span>
                            <span className="text-indigo-400 font-bold">72%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                        </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-3`}>
                        <div className={`rounded-xl p-3 border ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50/50'}`}>
                            <Code2 className="w-4 h-4 text-indigo-400 mb-2" />
                            <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Next lesson</div>
                            <div className={`text-[11px] mt-0.5 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Binary Trees</div>
                        </div>
                        <div className={`rounded-xl p-3 border ${isDark ? 'border-fuchsia-500/20 bg-fuchsia-500/5' : 'border-fuchsia-100 bg-fuchsia-50/50'}`}>
                            <Zap className="w-4 h-4 text-fuchsia-400 mb-2" />
                            <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Arena live</div>
                            <div className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>PIN 84721</div>
                        </div>
                    </div>
                    <div className={`rounded-xl p-3 border flex items-center gap-3 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Boardroom ready</div>
                            <div className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Mock interview unlocked</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Divider({ isDark }) {
    return (
        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
            <div className={`h-px w-full bg-gradient-to-r from-transparent ${isDark ? 'via-white/[0.07]' : 'via-slate-200'} to-transparent`} />
        </div>
    );
}

function SectionLabel({ icon: Icon, label, isDark }) {
    return (
        <div className="flex justify-center mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border ${isDark ? 'bg-[#6366f1]/10 border-[#6366f1]/20 text-[#818cf8]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
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
