import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Mic,
    Moon,
    Sun,
    Menu,
    X,
    Swords,
    GitBranch,
    Users,
    Library,
    Layers,
    ChevronDown,
    CheckCircle2,
    FileText,
    BarChart3,
    Map,
    Star,
    GitMerge,
    Code2,
    Rocket,
    Brain,
    Trophy,
    Zap,
    TrendingUp,
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import mustLogo from "../assets/must_logo.png";

const NAV = [
    { id: "learn", label: "Learn" },
    { id: "compete", label: "Compete" },
    { id: "launch", label: "Launch" },
];

const HERO_PILLARS = [
    { icon: Users, title: "Collaborate & form teams", desc: "Join projects, form squads, and ship things that matter." },
    { icon: Code2, title: "Battle with your friends", desc: "Neural Clash arenas — compete and level up every day." },
    { icon: Rocket, title: "Real-world experience", desc: "Build a portfolio of work employers actually care about." },
];

const FEATURES = [
    { icon: GitBranch, title: "Structured roadmaps", desc: "Curated paths from fundamentals to job-ready skills." },
    { icon: Brain, title: "1-on-1 AI Tutor", desc: "Ask questions, get examples, practice on every topic." },
    { icon: Zap, title: "Neural Clash Arena", desc: "Live quiz battles with classmates under real pressure." },
    { icon: Mic, title: "Interview Boardroom", desc: "Voice mocks with AI feedback and scorecards." },
    { icon: Trophy, title: "Project Corner", desc: "Implement ideas with guidance from idea to deploy." },
    { icon: TrendingUp, title: "Market trends", desc: "Stay current with live tech industry insights." },
];

const TECHS_ROW1 = [
    { name: "Python", color: "#3b82f6" },
    { name: "JavaScript", color: "#ca8a04" },
    { name: "React", color: "#0891b2" },
    { name: "Node.js", color: "#16a34a" },
    { name: "TypeScript", color: "#2563eb" },
    { name: "Java", color: "#c2410c" },
    { name: "SQL", color: "#db2777" },
    { name: "Docker", color: "#0284c7" },
    { name: "AWS", color: "#d97706" },
    { name: "Firebase", color: "#ea580c" },
];

const TECHS_ROW2 = [
    { name: "Git", color: "#dc2626" },
    { name: "Linux", color: "#a16207" },
    { name: "REST APIs", color: "#7c3aed" },
    { name: "GraphQL", color: "#c026d3" },
    { name: "Redis", color: "#e11d48" },
    { name: "MongoDB", color: "#15803d" },
    { name: "C++", color: "#1d4ed8" },
    { name: "Cloud", color: "#0e7490" },
    { name: "Security", color: "#be123c" },
    { name: "Algorithms", color: "#6d28d9" },
    { name: "System Design", color: "#b45309" },
];

const TEAM_BULLETS = [
    "Find teammates with complementary skills",
    "Collaborate on real open-source projects",
    "Build from idea to deployment",
    "Learn version control and team workflows",
    "Show employers team-based accomplishments",
];

const INTERVIEW_ITEMS = [
    { icon: Mic, title: "Mock interviews", desc: "Timed voice sessions that feel like the real room." },
    { icon: Brain, title: "AI analysis", desc: "Breakdowns of answers, tone, and confidence." },
    { icon: FileText, title: "Question bank", desc: "Curated questions by topic and difficulty." },
    { icon: BarChart3, title: "Performance tracking", desc: "See improvement across sessions over time." },
];

const JOURNEY_STEPS = [
    {
        step: "01", icon: Map, title: "Pick your track",
        desc: "Web, AI/ML, cybersecurity, systems — matched to your goals.",
        detail: "Answer a short quiz or browse specializations. Each track shows what to learn, why it matters, and which skills employers expect.",
    },
    {
        step: "02", icon: GitBranch, title: "Follow the roadmap",
        desc: "Weekly modules with clear deliverables — no guesswork.",
        detail: "Curated resources, labs, progress checkpoints, and AI summaries. The roadmap adapts as you go.",
    },
    {
        step: "03", icon: GitMerge, title: "Build & compete",
        desc: "Mini-projects, team work, and live arena rounds.",
        detail: "Apply skills through labs and Neural Clash sessions that make revision stick under pressure.",
    },
    {
        step: "04", icon: Mic, title: "Ace interviews",
        desc: "Practice out loud before it counts.",
        detail: "Boardroom voice mocks with scorecards on technical depth, clarity, and confidence — not typed fantasies.",
    },
    {
        step: "05", icon: Star, title: "Show your work",
        desc: "A portfolio of projects and proof.",
        detail: "Completed topics, shipped projects, and session history. Walk into interviews with something real to talk about.",
    },
];

const TESTIMONIALS = [
    {
        quote: "Neural Clash makes studying fun. I picked up algorithms faster competing with classmates than reading alone.",
        name: "Ahmed K.", role: "CS Student, Year 3", avatar: "A",
    },
    {
        quote: "The AI Tutor explained recursion with examples I could follow step by step. Better than rewatching lectures.",
        name: "Sara M.", role: "Software Engineering Intern", avatar: "S",
    },
    {
        quote: "After a few Boardroom sessions I felt ready for my technical interview. Speaking out loud made the difference.",
        name: "Omar L.", role: "Final-year CS student", avatar: "O",
    },
];

const FAQ = [
    {
        q: "Is MustAcademy free?",
        a: "Yes — create an account and start learning. Core roadmaps, lessons, arena, and tutor access are free to begin with.",
    },
    {
        q: "Who is this for?",
        a: "CS students who want structure, hands-on practice, and interview prep in one place — especially if playlists and PDF dumps aren't cutting it.",
    },
    {
        q: "How is this different from LeetCode or Coursera?",
        a: "Coursera gives you videos. LeetCode gives you problems. MustAcademy connects roadmaps, labs, live quiz battles, voice mocks, and progress tracking — the full loop from learning to interviewing.",
    },
];

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [menuOpen, setMenuOpen] = useState(false);
    const [openStep, setOpenStep] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    const scrollTo = (id) => {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const muted = isDark ? "text-slate-400" : "text-neutral-600";
    const border = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
    const panel = isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white";
    const accent = isDark ? "text-[#00f2ff]" : "text-[#c01636]";
    const accentSoft = isDark ? "text-[#00f2ff]/80" : "text-[#c01636]";

    return (
        <div className={`landing-page min-h-screen ${isDark ? "mesh-bg text-[#f1f5f9]" : "bg-[#fafafa] text-[#141414]"}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
                .landing-page { font-family: 'DM Sans', system-ui, sans-serif; }
                .landing-display { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; }
                .landing-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
                .landing-grid-bg {
                    background-image:
                        linear-gradient(${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px),
                        linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .landing-btn-primary { background: #c01636; color: #fff; }
                .landing-btn-primary:hover { background: #9b1c2e; }
                .landing-accent-line { background: ${isDark ? "#00f2ff" : "#c01636"}; }
                @keyframes marquee-left  { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .marquee-track-left  { animation: marquee-left  32s linear infinite; }
                .marquee-track-right { animation: marquee-right 30s linear infinite; }
                .marquee-track-left:hover, .marquee-track-right:hover { animation-play-state: paused; }
                .step-detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; }
                .step-detail.open { grid-template-rows: 1fr; }
                .step-detail-inner { overflow: hidden; }
                .faq-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
                .faq-panel.open { grid-template-rows: 1fr; }
                .faq-panel-inner { overflow: hidden; }
            `}</style>

            {/* Header */}
            <header className={`relative z-50 border-b sticky top-0 ${border} ${isDark ? "bg-[#050810]/90 backdrop-blur-md" : "bg-[#fafafa]/90 backdrop-blur-md"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src={mustLogo} alt="MustAcademy" className="h-9 w-auto" />
                        <span className="font-semibold text-[15px] tracking-tight">MustAcademy</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => scrollTo(id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"}`}>
                                {label}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={toggleTheme} aria-label="Toggle theme"
                            className={`p-2 rounded-lg ${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"}`}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className={`hidden sm:inline-flex text-sm font-medium px-3 py-2 ${isDark ? "text-slate-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900"}`}>Log in</Link>
                        <Link to="/register" className="landing-btn-primary hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Sign up</Link>
                        <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}
                            className={`md:hidden p-2 rounded-lg ${isDark ? "hover:bg-white/5" : "hover:bg-black/[0.04]"}`}>
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className={`md:hidden border-t px-5 py-4 space-y-1 ${border} ${isDark ? "bg-[#050810]" : "bg-white"}`}>
                        {NAV.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => scrollTo(id)} className={`block w-full text-left py-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>{label}</button>
                        ))}
                        <div className="flex gap-2 pt-3">
                            <Link to="/login" className={`flex-1 text-center py-2.5 rounded-lg text-sm border ${isDark ? "border-white/10" : "border-neutral-200"}`}>Log in</Link>
                            <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold landing-btn-primary">Sign up</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero — editorial + original 3 pillars */}
            <section className="relative overflow-hidden">
                <div className="landing-grid-bg absolute inset-0 opacity-40 pointer-events-none" />
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-16 pb-16 lg:pt-24 lg:pb-20 relative">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-end mb-14 lg:mb-16">
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                            <p className={`landing-mono text-[11px] uppercase tracking-[0.2em] mb-6 ${accentSoft}`}>
                                CS learning · built at MUST
                            </p>
                            <h1 className="landing-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] tracking-[-0.02em] mb-6">
                                Computer science
                                <br />
                                shouldn't feel like
                                <br />
                                <em className={accent}>a playlist.</em>
                            </h1>
                            <p className={`text-lg leading-relaxed max-w-md mb-9 ${muted}`}>
                                Structured roadmaps, hands-on labs, live quiz arenas, and voice mock interviews — one place to actually get good.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
                                    Start free <ArrowRight size={16} />
                                </Link>
                                <button type="button" onClick={() => scrollTo("learn")}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors ${isDark ? "border-white/15 text-slate-200 hover:bg-white/5" : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"}`}>
                                    See how it works
                                </button>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
                            <BentoStack isDark={isDark} />
                        </motion.div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 lg:gap-10">
                        {HERO_PILLARS.map((p, i) => (
                            <div key={p.title} className="relative">
                                <span className={`landing-mono text-xs block mb-3 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>0{i + 1}</span>
                                <div className="landing-accent-line w-6 h-[2px] mb-4" />
                                <div className="flex items-center gap-2 mb-2">
                                    <p.icon size={16} className={accentSoft} strokeWidth={1.75} />
                                    <h3 className="font-semibold text-[15px]">{p.title}</h3>
                                </div>
                                <p className={`text-sm leading-relaxed ${muted}`}>{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LEARN ── */}
            <section id="learn" className={`border-y ${border} ${isDark ? "bg-[#080c12]/80" : "bg-white"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${accentSoft}`}>Learn</p>
                        <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight mb-4">
                            Master CS with structure — not chaos
                        </h2>
                        <p className={`text-[15px] leading-relaxed ${muted}`}>
                            Your personalized journey from fundamentals to mastery. Roadmaps, labs, and a tutor when you're stuck.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                        {FEATURES.map((f) => (
                            <div key={f.title} className={`p-6 rounded-xl border transition-colors ${panel} ${isDark ? "hover:bg-white/[0.03]" : "hover:border-neutral-300"}`}>
                                <f.icon size={20} strokeWidth={1.5} className={`mb-4 ${accentSoft}`} />
                                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                                <p className={`text-sm leading-relaxed ${muted}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
                        <TutorPanel isDark={isDark} muted={muted} />
                        <RoadmapPanel isDark={isDark} muted={muted} panel={panel} />
                    </div>

                    <div className={`rounded-2xl border p-8 sm:p-10 ${panel}`}>
                        <div className="flex items-start gap-3 mb-6">
                            <Layers size={22} className={`shrink-0 mt-0.5 ${isDark ? "text-slate-500" : "text-neutral-400"}`} strokeWidth={1.5} />
                            <div>
                                <h3 className="landing-display text-2xl mb-2">Pick a specialization</h3>
                                <p className={`text-sm ${muted}`}>Eight tracks — each with a visual roadmap and weekly deliverables.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["Web & Frontend", "Backend & APIs", "AI / Machine Learning", "Cybersecurity", "Data Engineering", "Systems & OS", "Mobile Development", "Cloud & DevOps"].map((t) => (
                                <span key={t} className={`landing-mono text-xs px-3 py-1.5 rounded-md border ${isDark ? "border-white/10 bg-white/[0.03] text-slate-300" : "border-neutral-200 bg-[#fafafa] text-neutral-700"}`}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech marquee — from original */}
            <section className="relative py-16 lg:py-20 overflow-hidden">
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 mb-10 text-center">
                    <h2 className="landing-display text-2xl sm:text-3xl mb-3">Technologies you'll master</h2>
                    <p className={`text-sm max-w-lg mx-auto ${muted}`}>From foundational languages to tools companies actually hire for.</p>
                </div>
                <div className="relative mb-3 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
                    <div className="flex w-max marquee-track-left gap-2.5">
                        {[...TECHS_ROW1, ...TECHS_ROW1].map((t, i) => <TechBadge key={`a-${i}`} t={t} isDark={isDark} />)}
                    </div>
                </div>
                <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
                    <div className="flex w-max marquee-track-right gap-2.5">
                        {[...TECHS_ROW2, ...TECHS_ROW2].map((t, i) => <TechBadge key={`b-${i}`} t={t} isDark={isDark} />)}
                    </div>
                </div>
            </section>

            {/* ── COMPETE ── */}
            <section id="compete" className={`border-y ${border} ${isDark ? "bg-[#080c12]/50" : "bg-white"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 mb-14 items-end">
                        <div>
                            <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${isDark ? "text-[#ff4d6d]/90" : "text-[#c01636]"}`}>Compete</p>
                            <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight">
                                Study hard.
                                <br />
                                <em className={accent}>Spar harder.</em>
                            </h2>
                        </div>
                        <p className={`text-[15px] leading-relaxed ${muted}`}>
                            Reading passively doesn't prepare you for a whiteboard or a mic. Neural Clash and the Boardroom add the pressure you'll actually face.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-4 lg:gap-5 mb-12">
                        <ArenaPanel isDark={isDark} muted={muted} />
                        <BoardroomPanel isDark={isDark} muted={muted} />
                    </div>

                    {/* Interview prep grid — from original */}
                    <div className="mb-4">
                        <h3 className="landing-display text-2xl sm:text-3xl mb-2">Crack any interview</h3>
                        <p className={`text-sm mb-8 max-w-lg ${muted}`}>Land your role with mock sessions, curated questions, and real-time analysis.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        {INTERVIEW_ITEMS.map((item) => (
                            <div key={item.title} className={`p-6 rounded-xl border ${panel}`}>
                                <item.icon size={18} className={`mb-3 ${accentSoft}`} strokeWidth={1.5} />
                                <h4 className="font-semibold text-[15px] mb-2">{item.title}</h4>
                                <p className={`text-sm leading-relaxed ${muted}`}>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Teams — from original */}
                    <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center rounded-2xl border p-8 sm:p-10 ${panel}`}>
                        <div>
                            <p className={`landing-mono text-[10px] uppercase tracking-[0.15em] mb-3 ${accentSoft}`}>Collaboration</p>
                            <h3 className="landing-display text-2xl sm:text-3xl mb-4">Form teams & ship together</h3>
                            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                                Connect with classmates, share ideas, and deliver projects that showcase teamwork — not just solo coursework.
                            </p>
                            <ul className="space-y-2.5 mb-8">
                                {TEAM_BULLETS.map((b) => (
                                    <li key={b} className={`flex items-start gap-2.5 text-sm ${muted}`}>
                                        <CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${accentSoft}`} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                                Start collaborating <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: GitMerge, label: "Open-source PRs", sub: "Real workflows" },
                                { icon: Users, label: "Active teams", sub: "Peer matching" },
                                { icon: Library, label: "Projects shipped", sub: "Portfolio ready" },
                                { icon: Star, label: "Employer signals", sub: "Show your work" },
                            ].map((c) => (
                                <div key={c.label} className={`p-5 rounded-xl border text-center ${isDark ? "border-white/8 bg-white/[0.02]" : "border-neutral-100 bg-[#fafafa]"}`}>
                                    <c.icon size={18} className={`mx-auto mb-2 ${accentSoft}`} strokeWidth={1.5} />
                                    <div className="text-sm font-semibold">{c.label}</div>
                                    <div className={`text-xs mt-1 ${muted}`}>{c.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className={`py-20 lg:py-24 ${isDark ? "bg-white/[0.02]" : "bg-neutral-100/70"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                    <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 text-center ${isDark ? "text-slate-500" : "text-neutral-400"}`}>From students</p>
                    <h2 className="landing-display text-3xl sm:text-4xl text-center mb-12">Early feedback</h2>
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className={`p-6 rounded-xl border flex flex-col ${panel}`}>
                                <p className={`text-[15px] leading-relaxed mb-6 flex-1 ${muted}`}>"{t.quote}"</p>
                                <div className={`flex items-center gap-3 pt-4 border-t ${border}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${isDark ? "bg-[#c01636]/80" : "bg-[#c01636]"}`}>{t.avatar}</div>
                                    <div>
                                        <div className="font-semibold text-sm">{t.name}</div>
                                        <div className={`text-xs ${muted}`}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LAUNCH — journey accordion from original ── */}
            <section id="launch" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16">
                    <div>
                        <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${accentSoft}`}>Launch</p>
                        <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight mb-5">
                            From first login to first offer
                        </h2>
                        <p className={`text-[15px] leading-relaxed mb-8 ${muted}`}>
                            Five concrete stages. Expand any step for the details.
                        </p>
                        <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
                            Start stage 01 <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {JOURNEY_STEPS.map((s, i) => {
                            const isOpen = openStep === i;
                            return (
                                <div key={s.step} className={`rounded-xl border overflow-hidden transition-colors ${isOpen ? (isDark ? "border-[#00f2ff]/30 bg-white/[0.04]" : "border-[#c01636]/30 bg-white shadow-sm") : panel}`}>
                                    <button type="button" onClick={() => setOpenStep(isOpen ? null : i)} className="w-full flex items-center gap-4 p-5 text-left">
                                        <span className={`landing-mono text-sm shrink-0 ${accentSoft}`}>{s.step}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <s.icon size={14} className={accentSoft} />
                                                <span className="font-semibold text-[15px]">{s.title}</span>
                                            </div>
                                            <p className={`text-sm ${muted}`}>{s.desc}</p>
                                        </div>
                                        <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""} ${isDark ? "text-slate-500" : "text-neutral-400"}`} />
                                    </button>
                                    <div className={`step-detail${isOpen ? " open" : ""}`}>
                                        <div className="step-detail-inner">
                                            <p className={`px-5 pb-5 pl-[3.75rem] text-sm leading-relaxed border-l-2 ml-5 ${muted} ${isDark ? "border-[#00f2ff]/25" : "border-[#c01636]/20"}`}>
                                                {s.detail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={`border-t ${border} ${isDark ? "bg-[#080c12]/50" : "bg-white"}`}>
                <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-20">
                    <h2 className="landing-display text-2xl sm:text-3xl mb-10">Common questions</h2>
                    <div className="space-y-2">
                        {FAQ.map((item, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={item.q} className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-neutral-200"}`}>
                                    <button type="button" onClick={() => setOpenFaq(open ? null : i)}
                                        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50"}`}>
                                        {item.q}
                                        <ChevronDown size={18} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${isDark ? "text-slate-500" : "text-neutral-400"}`} />
                                    </button>
                                    <div className={`faq-panel${open ? " open" : ""}`}>
                                        <div className="faq-panel-inner">
                                            <p className={`px-5 pb-4 text-sm leading-relaxed ${muted}`}>{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={`border-t ${border}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div>
                        <h2 className="landing-display text-3xl sm:text-4xl mb-3">Ready to start your journey?</h2>
                        <p className={`text-[15px] ${muted}`}>Free to join. Pick a track and open your first lesson.</p>
                    </div>
                    <Link to="/register" className="landing-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold shrink-0 transition-colors">
                        Get started free <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <footer className={`border-t text-sm ${border} ${isDark ? "text-slate-500" : "text-neutral-500"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={mustLogo} alt="" className="h-8 w-auto" />
                            <span className={`font-semibold ${isDark ? "text-slate-300" : "text-neutral-800"}`}>MustAcademy</span>
                        </div>
                        <p className={`text-sm max-w-sm leading-relaxed ${muted}`}>
                            A CS learning platform for students who want roadmaps, practice, and proof of work — not another playlist.
                        </p>
                    </div>
                    <div>
                        <div className={`landing-mono text-[10px] uppercase tracking-widest mb-3 ${isDark ? "text-slate-600" : "text-neutral-400"}`}>Explore</div>
                        <ul className="space-y-2">
                            {NAV.map(({ id, label }) => (
                                <li key={id}><button type="button" onClick={() => scrollTo(id)} className="hover:underline underline-offset-4">{label}</button></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className={`landing-mono text-[10px] uppercase tracking-widest mb-3 ${isDark ? "text-slate-600" : "text-neutral-400"}`}>Account</div>
                        <ul className="space-y-2">
                            <li><Link to="/login" className="hover:underline underline-offset-4">Log in</Link></li>
                            <li><Link to="/register" className="hover:underline underline-offset-4">Sign up</Link></li>
                        </ul>
                    </div>
                </div>
                <div className={`max-w-[1200px] mx-auto px-5 sm:px-8 pb-8 text-xs ${isDark ? "text-slate-600" : "text-neutral-400"}`}>
                    © {new Date().getFullYear()} MustAcademy. Built for CS students.
                </div>
            </footer>
        </div>
    );
}

function TechBadge({ t, isDark }) {
    return (
        <span
            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap"
            style={{
                color: t.color,
                backgroundColor: isDark ? `${t.color}18` : `${t.color}12`,
                borderColor: isDark ? `${t.color}40` : `${t.color}35`,
            }}
        >
            {t.name}
        </span>
    );
}

function BentoStack({ isDark }) {
    return (
        <div className="space-y-3">
            <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-[#0d1222]/90" : "border-neutral-200 bg-white shadow-sm"}`}>
                <div className="flex items-center justify-between mb-3">
                    <span className={`landing-mono text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Progress</span>
                    <span className={`landing-mono text-xs font-medium ${isDark ? "text-[#00f2ff]" : "text-[#c01636]"}`}>72%</span>
                </div>
                <p className="text-sm font-medium mb-2">Data Structures</p>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
                    <div className={`h-full w-[72%] rounded-full ${isDark ? "bg-[#00f2ff]" : "bg-[#c01636]"}`} />
                </div>
            </div>
            <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-neutral-200 shadow-sm"}`}>
                <div className="bg-[#1a1033] px-4 py-3 flex items-center justify-between">
                    <span className="landing-mono text-[10px] text-violet-300/80 uppercase tracking-widest">Arena · live</span>
                    <Swords size={14} className="text-violet-300/60" />
                </div>
                <div className="bg-[#120a24] px-4 py-3">
                    <p className="text-white/90 text-xs font-medium mb-2">Time complexity of binary search?</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {["O(log n)", "O(n)", "O(n²)", "O(1)"].map((opt, i) => (
                            <div key={opt} className="text-[10px] font-semibold text-white/90 py-1.5 px-2 rounded" style={{ background: ["#c01636", "#1e3a5f", "#3d2c00", "#0a2e14"][i] }}>{opt}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${isDark ? "border-white/10 bg-[#0d1222]/90" : "border-neutral-200 bg-white"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-[#c01636]/20" : "bg-[#c01636]/10"}`}>
                    <Mic size={14} className={isDark ? "text-[#ff4d6d]" : "text-[#c01636]"} />
                </div>
                <div>
                    <p className="text-xs font-semibold">Boardroom session</p>
                    <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-neutral-500"}`}>Voice mock · scorecard ready</p>
                </div>
            </div>
        </div>
    );
}

function TutorPanel({ isDark, muted }) {
    return (
        <div>
            <h3 className="landing-display text-2xl mb-4">Open a topic. Get a tutor.</h3>
            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                Every lesson includes a 1-on-1 AI Tutor — ask follow-ups, request examples, run a quick quiz.
            </p>
            <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10" : "border-neutral-200 shadow-sm"}`}>
                <div className={`px-4 py-2.5 border-b flex items-center gap-2 ${isDark ? "bg-[#0d1222] border-white/5" : "bg-neutral-800 border-neutral-700"}`}>
                    <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                    <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    <span className="landing-mono text-[10px] text-white/40 ml-1">tutor · binary trees</span>
                </div>
                <div className={`p-5 space-y-4 ${isDark ? "bg-[#0a0e14]" : "bg-slate-900"}`}>
                    <p className="text-white/90 text-sm">Why do balanced BSTs matter if unbalanced trees still work?</p>
                    <div className="rounded-xl p-4 text-sm leading-relaxed bg-white/[0.04] text-slate-300 border border-white/5">
                        Unbalanced trees degrade to O(n) height — search becomes linear. AVL and Red-Black trees keep height O(log n).
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoadmapPanel({ isDark, muted, panel }) {
    const rows = [
        { label: "HTML & CSS", pct: 100 },
        { label: "JavaScript", pct: 85 },
        { label: "React", pct: 60 },
        { label: "TypeScript", pct: 20 },
        { label: "System design", pct: 0 },
    ];
    return (
        <div>
            <h3 className="landing-display text-2xl mb-4">See the whole path</h3>
            <p className={`text-sm leading-relaxed mb-6 ${muted}`}>
                Career roadmaps show what's done, what's next, and how each skill connects to your target role.
            </p>
            <div className={`rounded-2xl border p-6 ${panel}`}>
                <div className="mb-5">
                    <p className={`landing-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Track</p>
                    <p className="font-semibold">Frontend Engineer</p>
                </div>
                <div className="space-y-3">
                    {rows.map((row) => (
                        <div key={row.label}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className={muted}>{row.label}</span>
                                <span className={`landing-mono ${row.pct > 0 ? (isDark ? "text-[#00f2ff]" : "text-[#c01636]") : muted}`}>{row.pct}%</span>
                            </div>
                            <div className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-100"}`}>
                                <div className={`h-full rounded-full ${isDark ? "bg-[#00f2ff]" : "bg-[#c01636]"}`} style={{ width: `${row.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ArenaPanel({ isDark, muted }) {
    return (
        <div className={`lg:col-span-7 rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white shadow-sm"}`}>
            <div className="p-6 sm:p-8">
                <span className={`landing-mono text-[10px] uppercase tracking-[0.15em] ${isDark ? "text-[#00f2ff]/80" : "text-[#c01636]"}`}>Neural Clash</span>
                <h3 className="landing-display text-2xl sm:text-3xl mt-2 mb-4">Study like a game night</h3>
                <p className={`text-sm leading-relaxed max-w-md mb-4 ${muted}`}>
                    Host a room with a PIN. AI-generated questions, live leaderboard — the good kind of stress.
                </p>
                <ul className={`space-y-1.5 text-sm mb-2 ${muted}`}>
                    {["AI questions on any topic", "Real-time multiplayer with a PIN", "Live leaderboard & match chat"].map((b) => (
                        <li key={b} className="flex items-center gap-2"><CheckCircle2 size={14} className={isDark ? "text-[#00f2ff]/70" : "text-[#c01636]"} />{b}</li>
                    ))}
                </ul>
            </div>
            <div className="border-t border-inherit mx-6 sm:mx-8 mb-6 sm:mb-8 rounded-xl overflow-hidden">
                <div className="bg-[#0f0a1a] px-5 py-4 text-center border-b border-white/5">
                    <div className="landing-mono text-[9px] text-violet-400/90 uppercase tracking-[0.35em] mb-1">Join with PIN</div>
                    <div className="text-3xl font-bold text-white tracking-[0.3em] landing-mono">84721</div>
                </div>
                <div className="grid grid-cols-2">
                    {[{ c: "#c01636", t: "O(log n)" }, { c: "#1e4d7b", t: "O(n)" }, { c: "#8b6914", t: "O(n²)" }, { c: "#1a5c38", t: "O(1)" }].map((a) => (
                        <div key={a.t} className="py-3.5 px-4 text-white text-sm font-semibold border-t border-r border-white/5" style={{ background: a.c }}>{a.t}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BoardroomPanel({ isDark, muted }) {
    return (
        <div className={`lg:col-span-5 rounded-2xl border p-6 sm:p-8 flex flex-col ${isDark ? "border-white/10 bg-[#0d1222]" : "border-neutral-200 bg-neutral-50"}`}>
            <span className={`landing-mono text-[10px] uppercase tracking-[0.15em] ${isDark ? "text-[#ff4d6d]" : "text-[#c01636]"}`}>The Boardroom</span>
            <h3 className="landing-display text-2xl sm:text-3xl mt-2 mb-4">Interview out loud</h3>
            <p className={`text-sm leading-relaxed mb-6 flex-1 ${muted}`}>
                Voice mock sessions with an AI interviewer. You speak, it pushes back, you get a scorecard.
            </p>
            <div className={`rounded-xl border p-4 space-y-3 ${isDark ? "border-white/8 bg-black/25" : "border-neutral-200 bg-white"}`}>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="landing-mono text-[10px] text-emerald-500/90">Live · Marcus Sterling</span>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                    "How would you design a rate limiter? Walk me through the trade-offs."
                </p>
                <div className="flex items-end justify-between pt-1">
                    <span className={`text-xs ${muted}`}>Technical</span>
                    <span className={`landing-display text-3xl not-italic ${isDark ? "text-white" : "text-neutral-900"}`}>78</span>
                </div>
            </div>
        </div>
    );
}
