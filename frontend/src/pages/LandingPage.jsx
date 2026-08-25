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
    BookOpen,
    GitBranch,
    Users,
    Library,
    Radio,
    Layers,
    ChevronDown,
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import mustLogo from "../assets/must_logo.png";

/** Nav — short labels that mean something, not SaaS placeholders */
const NAV = [
    { id: "learn", label: "Learn" },
    { id: "compete", label: "Compete" },
    { id: "launch", label: "Launch" },
];

const PILLARS = [
    {
        n: "01",
        title: "Roadmaps that mean something",
        body: "Weekly modules, labs, and checkpoints — not a random YouTube queue.",
    },
    {
        n: "02",
        title: "Practice that sticks",
        body: "1-on-1 AI Tutor on every topic. Ask, quiz yourself, keep notes.",
    },
    {
        n: "03",
        title: "Pressure you can use",
        body: "Neural Clash arenas and Boardroom voice mocks — rehearse before it counts.",
    },
];

const TOOLKIT = [
    { icon: BookOpen, name: "Interactive lessons", desc: "Labs, visualizers, and topic notebooks on every module." },
    { icon: BrainIcon, name: "1-on-1 AI Tutor", desc: "Practice Q&A without sitting through a full lecture first." },
    { icon: GitBranch, name: "Career roadmaps", desc: "See skills mapped to real roles — frontend, ML, SRE, and more." },
    { icon: Library, name: "Course library", desc: "Structured CS courses with progress that actually tracks." },
    { icon: Users, name: "Team projects", desc: "Form squads, ship work, build something linkable on your profile." },
    { icon: Radio, name: "Podcast studio", desc: "Turn topics into audio — study while you commute." },
];

const TRACKS = [
    "Web & Frontend", "Backend & APIs", "AI / Machine Learning",
    "Cybersecurity", "Data Engineering", "Systems & OS",
    "Mobile Development", "Cloud & DevOps",
];

const PATH = [
    {
        step: "01",
        label: "Pick your track",
        detail: "Answer a short quiz or browse specializations. We suggest where to start based on your background.",
    },
    {
        step: "02",
        label: "Work the roadmap",
        detail: "Weekly sprints with lessons, labs, and checkpoints. AI summaries when you need a fast recap.",
    },
    {
        step: "03",
        label: "Build & compete",
        detail: "Mini-projects after modules. Join Neural Clash rounds with classmates when you need to stress-test knowledge.",
    },
    {
        step: "04",
        label: "Interview out loud",
        detail: "Boardroom voice mocks with scorecards — technical depth, clarity, and confidence, not typed answers.",
    },
    {
        step: "05",
        label: "Show your work",
        detail: "Portfolio of completed topics, projects, and session history. Walk in with proof, not just a CV line.",
    },
];

const VOICES = [
    {
        quote: "Neural Clash turned revision into something I'd actually show up for. I stopped rereading slides and started winning rounds.",
        name: "Ahmed K.",
        tag: "CS · Year 3",
    },
    {
        quote: "The tutor on binary trees answered follow-ups like a patient TA — except at 2am before my exam.",
        name: "Sara M.",
        tag: "SWE intern",
    },
    {
        quote: "Three Boardroom sessions and I stopped freezing on system design. Speaking out loud was the missing piece.",
        name: "Omar L.",
        tag: "Final year",
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

function BrainIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path d="M12 4.5c-2 0-3.5 1.5-3.5 3.5 0 .8.3 1.5.8 2-1.2.5-2 1.7-2 3.1 0 1.2.6 2.2 1.5 2.8-.3.6-.5 1.3-.5 2.1 0 2.2 1.8 4 4 4h.4c.3 1.2 1.4 2 2.6 2s2.3-.8 2.6-2H17c2.2 0 4-1.8 4-4 0-.8-.2-1.5-.5-2.1.9-.6 1.5-1.6 1.5-2.8 0-1.4-.8-2.6-2-3.1.5-.5.8-1.2.8-2C15.5 6 14 4.5 12 4.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const scrollTo = (id) => {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const fade = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
    });

    const muted = isDark ? "text-slate-400" : "text-neutral-600";
    const border = isDark ? "border-white/[0.06]" : "border-black/[0.06]";
    const panel = isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white";

    return (
        <div className={`landing-page min-h-screen ${isDark ? "mesh-bg text-[#f1f5f9]" : "bg-[#fafafa] text-[#141414]"}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
                .landing-page { font-family: 'DM Sans', system-ui, sans-serif; }
                .landing-display { font-family: 'Newsreader', Georgia, 'Times New Roman', serif; }
                .landing-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
                .landing-grid-bg {
                    background-image:
                        linear-gradient(${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px),
                        linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .landing-btn-primary { background: #c01636; color: #fff; }
                .landing-btn-primary:hover { background: #9b1c2e; }
                .landing-accent-line { background: ${isDark ? "#00f2ff" : "#c01636"}; }
                .faq-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
                .faq-panel.open { grid-template-rows: 1fr; }
                .faq-panel-inner { overflow: hidden; }
            `}</style>

            <header className={`relative z-50 border-b ${border} ${isDark ? "bg-[#050810]/90 backdrop-blur-md" : "bg-[#fafafa]/90 backdrop-blur-md"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src={mustLogo} alt="MustAcademy" className="h-9 w-auto" />
                        <span className="font-semibold text-[15px] tracking-tight">MustAcademy</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => scrollTo(id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className={`p-2 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"}`}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link to="/login" className={`hidden sm:inline-flex text-sm font-medium px-3 py-2 ${isDark ? "text-slate-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900"}`}>Log in</Link>
                        <Link to="/register" className="landing-btn-primary hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Sign up</Link>
                        <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)} className={`md:hidden p-2 rounded-lg ${isDark ? "hover:bg-white/5" : "hover:bg-black/[0.04]"}`}>
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

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="landing-grid-bg absolute inset-0 opacity-40 pointer-events-none" />
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 relative">
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-end">
                        <motion.div {...fade(0)}>
                            <p className={`landing-mono text-[11px] uppercase tracking-[0.2em] mb-6 ${isDark ? "text-[#00f2ff]/80" : "text-[#c01636]"}`}>
                                CS learning · built at MUST
                            </p>
                            <h1 className="landing-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] tracking-[-0.02em] mb-6">
                                Computer science
                                <br />
                                shouldn't feel like
                                <br />
                                <em className={isDark ? "text-[#00f2ff]" : "text-[#c01636]"}>a playlist.</em>
                            </h1>
                            <p className={`text-lg leading-relaxed max-w-md mb-9 ${muted}`}>
                                Structured roadmaps, hands-on labs, live quiz arenas, and voice mock interviews — one place to actually get good.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
                                    Start free <ArrowRight size={16} />
                                </Link>
                                <button type="button" onClick={() => scrollTo("learn")} className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors ${isDark ? "border-white/15 text-slate-200 hover:bg-white/5" : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"}`}>
                                    See how it works
                                </button>
                            </div>
                        </motion.div>
                        <motion.div {...fade(0.12)} className="relative lg:mb-2">
                            <BentoStack isDark={isDark} />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── LEARN ── */}
            <section id="learn" className={`border-y ${border} ${isDark ? "bg-[#080c12]/80" : "bg-white"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 mb-20 lg:mb-28">
                        <div>
                            <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${isDark ? "text-[#00f2ff]/70" : "text-[#c01636]"}`}>Learn</p>
                            <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight mb-5">
                                Structure beats scrolling
                            </h2>
                            <p className={`text-[15px] leading-relaxed ${muted}`}>
                                Most students don't lack content — they lack a sequence. MustAcademy gives you weekly modules, labs on every topic, and a tutor when you're stuck.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-10 lg:gap-12">
                            {PILLARS.map((p) => (
                                <article key={p.n} className="relative">
                                    <span className={`landing-mono text-xs block mb-3 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>{p.n}</span>
                                    <div className="landing-accent-line w-6 h-[2px] mb-4" />
                                    <h3 className="landing-display text-xl mb-2 leading-snug">{p.title}</h3>
                                    <p className={`text-sm leading-relaxed ${muted}`}>{p.body}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    {/* Tutor + roadmap deep dive */}
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-20 lg:mb-28">
                        <TutorPanel isDark={isDark} muted={muted} panel={panel} />
                        <RoadmapPanel isDark={isDark} muted={muted} panel={panel} />
                    </div>

                    {/* Toolkit grid */}
                    <div className="mb-16">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                            <h3 className="landing-display text-2xl sm:text-3xl">Everything else in the box</h3>
                            <p className={`text-sm max-w-xs ${muted}`}>Not bolted-on extras — part of the same loop.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-inherit bg-inherit">
                            {TOOLKIT.map(({ icon: Icon, name, desc }) => (
                                <div key={name} className={`p-6 sm:p-7 ${isDark ? "bg-[#0a0e14] border-white/[0.04]" : "bg-[#fafafa] border-neutral-100"}`}>
                                    <Icon size={20} strokeWidth={1.5} className={`mb-4 ${isDark ? "text-slate-500" : "text-neutral-400"}`} />
                                    <h4 className="font-semibold text-[15px] mb-2">{name}</h4>
                                    <p className={`text-sm leading-relaxed ${muted}`}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tracks */}
                    <div className={`rounded-2xl border p-8 sm:p-10 ${panel}`}>
                        <div className="flex items-start gap-3 mb-6">
                            <Layers size={22} className={`shrink-0 mt-0.5 ${isDark ? "text-slate-500" : "text-neutral-400"}`} strokeWidth={1.5} />
                            <div>
                                <h3 className="landing-display text-2xl mb-2">Pick a specialization</h3>
                                <p className={`text-sm ${muted}`}>Eight tracks — each with a visual roadmap, weekly deliverables, and role context.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {TRACKS.map((t) => (
                                <span key={t} className={`landing-mono text-xs px-3 py-1.5 rounded-md border ${isDark ? "border-white/10 bg-white/[0.03] text-slate-300" : "border-neutral-200 bg-white text-neutral-700"}`}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── COMPETE ── */}
            <section id="compete" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 mb-14 lg:mb-16 items-end">
                    <div>
                        <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${isDark ? "text-[#ff4d6d]/90" : "text-[#c01636]"}`}>Compete</p>
                        <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight">
                            Study hard.
                            <br />
                            <em className={isDark ? "text-[#00f2ff]" : "text-[#c01636]"}>Spar harder.</em>
                        </h2>
                    </div>
                    <p className={`text-[15px] leading-relaxed lg:pb-1 ${muted}`}>
                        Reading passively doesn't prepare you for a whiteboard or a mic. Neural Clash and the Boardroom add the kind of pressure you'll actually face — with feedback after every round.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-4 lg:gap-5 mb-10">
                    <ArenaPanel isDark={isDark} muted={muted} />
                    <BoardroomPanel isDark={isDark} muted={muted} />
                </div>

                <div className={`grid sm:grid-cols-2 gap-6 rounded-2xl border p-8 sm:p-10 ${panel}`}>
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Swords size={18} className={isDark ? "text-[#00f2ff]/80" : "text-[#c01636]"} />
                            Neural Clash — when you host
                        </h4>
                        <ul className={`space-y-2 text-sm ${muted}`}>
                            <li>· AI questions on any topic and difficulty</li>
                            <li>· PIN rooms — classmates join from their phones</li>
                            <li>· Live leaderboard and in-match chat</li>
                            <li>· Wrong answers get memorable feedback (yes, sounds included)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Mic size={18} className={isDark ? "text-[#ff4d6d]/90" : "text-[#c01636]"} />
                            Boardroom — when you rehearse
                        </h4>
                        <ul className={`space-y-2 text-sm ${muted}`}>
                            <li>· Voice mock with an AI interviewer (Marcus Sterling)</li>
                            <li>· Behavioral and technical phases</li>
                            <li>· Scorecard: technical depth, clarity, salary band estimate</li>
                            <li>· Session history so you can track improvement</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Voices */}
            <section className={`py-20 lg:py-28 ${isDark ? "bg-white/[0.02]" : "bg-neutral-100/80"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                    <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-10 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>From students</p>
                    <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
                        {VOICES.map((v, i) => (
                            <blockquote key={v.name} className={i === 0 ? "lg:col-span-1" : ""}>
                                <p className={`leading-relaxed mb-5 ${i === 0 ? "landing-display text-xl sm:text-2xl italic" : "text-[15px]"}`}>
                                    "{v.quote}"
                                </p>
                                <footer className={`flex items-center gap-2 text-sm ${muted}`}>
                                    <span className={`landing-mono text-[10px] px-2 py-0.5 rounded ${isDark ? "bg-white/5" : "bg-white border border-neutral-200"}`}>{v.tag}</span>
                                    {v.name}
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LAUNCH ── */}
            <section id="launch" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
                    <div>
                        <p className={`landing-mono text-[11px] uppercase tracking-[0.15em] mb-4 ${isDark ? "text-[#00f2ff]/70" : "text-[#c01636]"}`}>Launch</p>
                        <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight mb-5">
                            From first login to first offer
                        </h2>
                        <p className={`text-[15px] leading-relaxed mb-8 ${muted}`}>
                            No vague "learning journeys." Five concrete stages — each with something to show for it.
                        </p>
                        <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
                            Start stage 01 <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-0">
                        {PATH.map((item, i) => (
                            <div key={item.step} className={`flex gap-6 py-6 ${i < PATH.length - 1 ? `border-b ${border}` : ""}`}>
                                <span className={`landing-mono text-sm shrink-0 pt-0.5 ${isDark ? "text-[#00f2ff]/70" : "text-[#c01636]"}`}>{item.step}</span>
                                <div>
                                    <h3 className="font-semibold mb-1.5">{item.label}</h3>
                                    <p className={`text-sm leading-relaxed ${muted}`}>{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className={`border-t ${border} ${isDark ? "bg-[#080c12]/50" : "bg-white"}`}>
                <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-20 lg:py-24">
                    <h2 className="landing-display text-2xl sm:text-3xl mb-10">Common questions</h2>
                    <div className="space-y-2">
                        {FAQ.map((item, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={item.q} className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-neutral-200"}`}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-neutral-50"}`}
                                    >
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
                        <h2 className="landing-display text-3xl sm:text-4xl mb-3">Ready when you are.</h2>
                        <p className={`text-[15px] ${muted}`}>Free to join. Pick a track and open your first lesson.</p>
                    </div>
                    <Link to="/register" className="landing-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold shrink-0 transition-colors">
                        Create account <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <footer className={`border-t text-sm ${border} ${isDark ? "text-slate-500" : "text-neutral-500"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span>© {new Date().getFullYear()} MustAcademy</span>
                    <div className="flex flex-wrap gap-6">
                        {NAV.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => scrollTo(id)} className="hover:underline underline-offset-4">{label}</button>
                        ))}
                        <Link to="/login" className="hover:underline underline-offset-4">Log in</Link>
                    </div>
                </div>
            </footer>
        </div>
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
                Every lesson includes a 1-on-1 AI Tutor — ask follow-ups, request examples, run a quick quiz. Built for the moment you're stuck, not for replacing the whole course.
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
                    <div className={`rounded-xl p-4 text-sm leading-relaxed ${isDark ? "bg-white/[0.04] text-slate-300 border border-white/5" : "bg-white/5 text-slate-200 border border-white/10"}`}>
                        Unbalanced trees degrade to O(n) height — search becomes linear. AVL and Red-Black trees re-balance after inserts so height stays O(log n).
                    </div>
                    <div className="flex gap-2">
                        <span className="landing-mono text-[10px] px-2.5 py-1 rounded-md bg-white/5 text-white/50">follow-up</span>
                        <span className="landing-mono text-[10px] px-2.5 py-1 rounded-md bg-[#c01636]/30 text-white/80">quick quiz</span>
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
                Career roadmaps show what's done, what's next, and how each skill connects to the role you're aiming for.
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
                <p className={`text-sm leading-relaxed max-w-md ${muted}`}>
                    Host a room with a PIN. AI-generated questions, live leaderboard, classmates trash-talking your Big-O answer — the good kind of stress.
                </p>
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
                Voice mock sessions with an AI interviewer. You speak, it pushes back, you get a scorecard — not a textarea fantasy.
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
