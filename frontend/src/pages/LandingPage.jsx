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
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import mustLogo from "../assets/must_logo.png";

const NAV = [
    { id: "platform", label: "Platform" },
    { id: "arena", label: "Arena" },
    { id: "path", label: "Path" },
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

const PATH = [
    { step: "01", label: "Choose a track", detail: "Web, systems, ML, security — start where you are." },
    { step: "02", label: "Work the roadmap", detail: "Lessons, labs, and progress you can see." },
    { step: "03", label: "Build & compete", detail: "Projects, teams, live quiz rounds." },
    { step: "04", label: "Interview out loud", detail: "Voice mocks with feedback and scorecards." },
];

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";
    const [menuOpen, setMenuOpen] = useState(false);

    const scrollTo = (id) => {
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const fade = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
    });

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
                .landing-btn-primary {
                    background: ${isDark ? "#c01636" : "#c01636"};
                    color: #fff;
                }
                .landing-btn-primary:hover {
                    background: ${isDark ? "#9b1c2e" : "#9b1c2e"};
                }
                .landing-accent-line {
                    background: ${isDark ? "#00f2ff" : "#c01636"};
                }
            `}</style>

            {/* Header */}
            <header className={`relative z-50 border-b ${isDark ? "border-white/[0.06]" : "border-black/[0.08]"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <img src={mustLogo} alt="MustAcademy" className="h-9 w-auto" />
                        <span className="font-semibold text-[15px] tracking-tight">MustAcademy</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {NAV.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => scrollTo(id)}
                                className={`text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`p-2 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-neutral-500 hover:text-neutral-900 hover:bg-black/[0.04]"}`}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link
                            to="/login"
                            className={`hidden sm:inline-flex text-sm font-medium px-3 py-2 ${isDark ? "text-slate-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900"}`}
                        >
                            Log in
                        </Link>
                        <Link to="/register" className="landing-btn-primary hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                            Sign up
                        </Link>
                        <button
                            type="button"
                            aria-label="Menu"
                            onClick={() => setMenuOpen((v) => !v)}
                            className={`md:hidden p-2 rounded-lg ${isDark ? "hover:bg-white/5" : "hover:bg-black/[0.04]"}`}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className={`md:hidden border-t px-5 py-4 space-y-1 ${isDark ? "border-white/[0.06] bg-[#050810]" : "border-black/[0.06] bg-white"}`}>
                        {NAV.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => scrollTo(id)} className={`block w-full text-left py-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                                {label}
                            </button>
                        ))}
                        <div className="flex gap-2 pt-3">
                            <Link to="/login" className={`flex-1 text-center py-2.5 rounded-lg text-sm border ${isDark ? "border-white/10" : "border-neutral-200"}`}>Log in</Link>
                            <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold landing-btn-primary">Sign up</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero — editorial, left-aligned */}
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
                            <p className={`text-lg leading-relaxed max-w-md mb-9 ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
                                Structured roadmaps, hands-on labs, live quiz arenas, and voice mock interviews — one place to actually get good.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/register" className="landing-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors">
                                    Start free <ArrowRight size={16} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => scrollTo("platform")}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors ${isDark ? "border-white/15 text-slate-200 hover:bg-white/5" : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"}`}
                                >
                                    See the platform
                                </button>
                            </div>
                        </motion.div>

                        <motion.div {...fade(0.12)} className="relative lg:mb-2">
                            <BentoStack isDark={isDark} />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pillars — typographic, not cards */}
            <section id="platform" className={`border-y ${isDark ? "border-white/[0.06] bg-[#080c12]/80" : "border-black/[0.06] bg-white"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-24">
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        {PILLARS.map((p, i) => (
                            <motion.article key={p.n} {...fade(i * 0.08)} className="relative">
                                <span className={`landing-mono text-xs block mb-4 ${isDark ? "text-slate-500" : "text-neutral-400"}`}>{p.n}</span>
                                <div className="landing-accent-line w-8 h-[2px] mb-5" />
                                <h2 className="landing-display text-2xl mb-3 leading-snug">{p.title}</h2>
                                <p className={`text-[15px] leading-relaxed ${isDark ? "text-slate-400" : "text-neutral-600"}`}>{p.body}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Signature bento — Arena + Boardroom */}
            <section id="arena" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
                    <div>
                        <h2 className="landing-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight max-w-lg">
                            The parts students actually remember
                        </h2>
                    </div>
                    <p className={`text-[15px] max-w-sm lg:text-right ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
                        Not another feature grid. Two modes that change how you study and how you interview.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
                    <ArenaPanel isDark={isDark} />
                    <BoardroomPanel isDark={isDark} />
                    <TutorStrip isDark={isDark} />
                </div>
            </section>

            {/* Quote — one voice, not three cards */}
            <section className={`py-20 lg:py-24 ${isDark ? "bg-white/[0.02]" : "bg-neutral-100/80"}`}>
                <div className="max-w-[800px] mx-auto px-5 sm:px-8">
                    <blockquote className="landing-display text-2xl sm:text-3xl lg:text-[2.1rem] leading-snug italic">
                        "Neural Clash turned revision into something I'd actually show up for. I stopped rereading slides and started{' '}
                        <span className={isDark ? "text-[#00f2ff] not-italic" : "text-[#c01636] not-italic"}>winning rounds</span>."
                    </blockquote>
                    <footer className={`mt-8 flex items-center gap-3 text-sm ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
                        <span className={`landing-mono text-xs px-2 py-1 rounded ${isDark ? "bg-white/5" : "bg-white border border-neutral-200"}`}>CS · Y3</span>
                        Ahmed K. · early tester
                    </footer>
                </div>
            </section>

            {/* Path */}
            <section id="path" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 lg:py-28">
                <h2 className="landing-display text-3xl sm:text-4xl mb-14">How it unfolds</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                    {PATH.map((item, i) => (
                        <div key={item.step} className="relative">
                            {i < PATH.length - 1 && (
                                <div className={`hidden lg:block absolute top-4 left-[calc(100%+0.5rem)] w-[calc(100%-2rem)] h-px ${isDark ? "bg-white/10" : "bg-neutral-200"}`} />
                            )}
                            <span className={`landing-mono text-[11px] ${isDark ? "text-[#00f2ff]/70" : "text-[#c01636]"}`}>{item.step}</span>
                            <h3 className="text-base font-semibold mt-2 mb-2">{item.label}</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-neutral-600"}`}>{item.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className={`border-t ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div>
                        <h2 className="landing-display text-3xl sm:text-4xl mb-3">Ready when you are.</h2>
                        <p className={`text-[15px] ${isDark ? "text-slate-400" : "text-neutral-600"}`}>Free to join. Pick a track and open your first lesson.</p>
                    </div>
                    <Link to="/register" className="landing-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold shrink-0 transition-colors">
                        Create account <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className={`border-t text-sm ${isDark ? "border-white/[0.06] text-slate-500" : "border-black/[0.06] text-neutral-500"}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span>© {new Date().getFullYear()} MustAcademy</span>
                    <div className="flex flex-wrap gap-6">
                        {NAV.map(({ id, label }) => (
                            <button key={id} type="button" onClick={() => scrollTo(id)} className="hover:underline underline-offset-4">
                                {label}
                            </button>
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
                            <div
                                key={opt}
                                className="text-[10px] font-semibold text-white/90 py-1.5 px-2 rounded"
                                style={{ background: ["#c01636", "#1e3a5f", "#3d2c00", "#0a2e14"][i] }}
                            >
                                {opt}
                            </div>
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

function ArenaPanel({ isDark }) {
    return (
        <div className={`lg:col-span-7 rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white shadow-sm"}`}>
            <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <span className={`landing-mono text-[10px] uppercase tracking-[0.15em] ${isDark ? "text-[#00f2ff]/80" : "text-[#c01636]"}`}>Neural Clash</span>
                        <h3 className="landing-display text-2xl sm:text-3xl mt-2">Study like a game night</h3>
                    </div>
                    <Swords className={`shrink-0 ${isDark ? "text-slate-600" : "text-neutral-300"}`} size={28} strokeWidth={1.25} />
                </div>
                <p className={`text-sm leading-relaxed max-w-md mb-6 ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
                    Host a room with a PIN. AI-generated questions, live leaderboard, classmates trash-talking your Big-O answer — the good kind of stress.
                </p>
            </div>
            <div className="border-t border-inherit mx-6 sm:mx-8 mb-6 sm:mb-8 rounded-xl overflow-hidden">
                <div className="bg-[#0f0a1a] px-5 py-4 text-center border-b border-white/5">
                    <div className="landing-mono text-[9px] text-violet-400/90 uppercase tracking-[0.35em] mb-1">Join with PIN</div>
                    <div className="text-3xl font-bold text-white tracking-[0.3em] landing-mono">84721</div>
                </div>
                <div className="grid grid-cols-2">
                    {[
                        { c: "#c01636", t: "O(log n)" },
                        { c: "#1e4d7b", t: "O(n)" },
                        { c: "#8b6914", t: "O(n²)" },
                        { c: "#1a5c38", t: "O(1)" },
                    ].map((a) => (
                        <div key={a.t} className="py-3.5 px-4 text-white text-sm font-semibold border-t border-r border-white/5" style={{ background: a.c }}>
                            {a.t}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BoardroomPanel({ isDark }) {
    return (
        <div className={`lg:col-span-5 rounded-2xl border p-6 sm:p-8 flex flex-col ${isDark ? "border-white/10 bg-[#0d1222]" : "border-neutral-200 bg-neutral-50"}`}>
            <span className={`landing-mono text-[10px] uppercase tracking-[0.15em] ${isDark ? "text-[#ff4d6d]" : "text-[#c01636]"}`}>The Boardroom</span>
            <h3 className="landing-display text-2xl sm:text-3xl mt-2 mb-4">Interview out loud</h3>
            <p className={`text-sm leading-relaxed mb-6 flex-1 ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
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
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-neutral-400"}`}>Technical</span>
                    <span className={`landing-display text-3xl not-italic ${isDark ? "text-white" : "text-neutral-900"}`}>78</span>
                </div>
            </div>
        </div>
    );
}

function TutorStrip({ isDark }) {
    return (
        <div className={`lg:col-span-12 grid sm:grid-cols-2 gap-4 lg:gap-5`}>
            <div className={`rounded-2xl border p-5 sm:p-6 flex gap-4 ${isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white"}`}>
                <BookOpen size={22} className={`shrink-0 mt-0.5 ${isDark ? "text-slate-500" : "text-neutral-400"}`} strokeWidth={1.5} />
                <div>
                    <h4 className="font-semibold mb-1">1-on-1 AI Tutor</h4>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
                        Every topic opens a tutor — ask, get examples, quick quiz. No 40-minute lecture dump on open.
                    </p>
                </div>
            </div>
            <div className={`rounded-2xl border p-5 sm:p-6 flex gap-4 ${isDark ? "border-white/10 bg-[#0a0e14]" : "border-neutral-200 bg-white"}`}>
                <GitBranch size={22} className={`shrink-0 mt-0.5 ${isDark ? "text-slate-500" : "text-neutral-400"}`} strokeWidth={1.5} />
                <div>
                    <h4 className="font-semibold mb-1">Career roadmaps</h4>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
                        Visual path to your target role. See what's done, what's next, and what employers actually ask for.
                    </p>
                </div>
            </div>
        </div>
    );
}
