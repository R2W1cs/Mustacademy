import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, TrendingUp, Layers, RefreshCcw, LayoutTemplate, Workflow, Play, RotateCcw, ArrowRight, Server, Database, Code2, ShieldCheck, CheckCircle2, FlaskConical } from 'lucide-react';

const MethodologyVisualizer = ({ type = 'waterfall' }) => {
    // Normalize type string
    const normalizedType = type.toLowerCase().includes('waterfall') ? 'waterfall'
        : type.toLowerCase().includes('spiral') ? 'spiral'
            : type.toLowerCase().includes('scrum') ? 'scrum'
                : type.toLowerCase().includes('kanban') ? 'kanban'
                    : type.toLowerCase().includes('xp') || type.toLowerCase().includes('extreme') ? 'xp'
                        : 'waterfall';

    const [view, setView] = useState('simulation'); // 'simulation', 'principles', 'comparison'
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const getMaxSteps = (methodology) => {
        switch (methodology) {
            case 'waterfall': return 5;
            case 'spiral': return 4;
            case 'scrum': return 4;
            case 'kanban': return 5;
            case 'xp': return 4;
            default: return 5;
        }
    };

    // Auto-play logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setStep(s => {
                    const maxSteps = getMaxSteps(normalizedType);
                    if (s >= maxSteps - 1) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, normalizedType]);

    const reset = () => {
        setStep(0);
        setIsPlaying(false);
    };

    const nextStep = () => {
        if (step < getMaxSteps(normalizedType) - 1) setStep(s => s + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep(s => s - 1);
    };

    // Methodology configs
    const configs = {
        waterfall: {
            title: "Waterfall Protocol",
            icon: <Layers size={24} className="text-blue-400" />,
            color: "blue",
            steps: [
                { id: 0, title: "Requirements", desc: "Gather all requirements upfront. Freeze them.", icon: <CheckCircle2 size={20} /> },
                { id: 1, title: "System Design", desc: "Architect the complete system based on frozen requirements.", icon: <Server size={20} /> },
                { id: 2, title: "Implementation", desc: "Write all the code according to the design.", icon: <Code2 size={20} /> },
                { id: 3, title: "Testing", desc: "Test the entire system at once. Bugs are expensive here.", icon: <ShieldCheck size={20} /> },
                { id: 4, title: "Deployment", desc: "Release to production. Client sees it for the first time.", icon: <Zap size={20} /> }
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] max-w-sm flex flex-col justify-between z-0 pointer-events-none opacity-20">
                        {/* Connecting Lines */}
                        <div className="w-1 bg-gradient-to-b from-blue-500/50 to-blue-500/10 h-full mx-auto shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>

                    <div className="flex flex-col gap-4 w-full max-w-lg z-10 relative">
                        {configs.waterfall.steps.map((s, i) => {
                            const isActive = i === step;
                            const isDone = i < step;
                            const isPending = i > step;
                            return (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: isPending ? 0.3 : 1, x: i * 20, scale: isActive ? 1.05 : 1 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={`relative p-5 rounded-2xl border backdrop-blur-md flex items-center gap-4 transition-all duration-500
                                        ${isActive ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] z-20'
                                            : isDone ? 'bg-blue-900/40 border-blue-500/30 text-white/70'
                                                : 'bg-white/[0.02] border-white/5 grayscale'}
                                    `}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner
                                        ${isActive ? 'bg-blue-500 text-white shadow-blue-500/50' : 'bg-white/10'}`}>
                                        {s.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-white">{s.title}</h4>
                                        <p className="text-[10px] text-white/50 font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                    {isDone && (
                                        <div className="absolute right-4 text-green-400">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                    {isActive && (
                                        <motion.div layoutId="waterfall-active" className="absolute -left-3 -right-3 -top-3 -bottom-3 border-2 border-blue-400/50 rounded-[1.2rem] pointer-events-none" />
                                    )}
                                </motion.div>
                            )
                        })}
                        {/* No going back warning */}
                        <AnimatePresence>
                            {step > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -right-20 top-1/4 max-w-[120px] p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[9px] text-red-400 uppercase font-black tracking-widest text-center shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                >
                                    <Activity size={14} className="mx-auto mb-1 animate-pulse" />
                                    Cannot return to previous phases!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )
        },
        spiral: {
            title: "Spiral Framework",
            icon: <RefreshCcw size={24} className="text-rose-400" />,
            color: "rose",
            steps: [
                { id: 0, title: "Loop 1: Concept", desc: "Plan → Risk Analysis → Build Paper Prototype → Evaluate." },
                { id: 1, title: "Loop 2: Prototype", desc: "Plan → Heavy Risk Analysis → Build Working Demo → Evaluate." },
                { id: 2, title: "Loop 3: Beta", desc: "Plan → Resolve Final Risks → Build Full System → Evaluate." },
                { id: 3, title: "Loop 4: Release", desc: "Finalize → Test → Deploy secure system." }
            ],
            render: () => {
                // Loop expansion visualization
                const loopSizes = [80, 160, 240, 320];
                return (
                    <div className="flex items-center justify-center h-full relative p-10">
                        {/* Background Spirals */}
                        <div className="relative w-full h-[400px] flex items-center justify-center">
                            {loopSizes.map((size, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: step >= i ? 1 : 0.8,
                                        opacity: step >= i ? (i === step ? 1 : 0.4) : 0,
                                        borderColor: i === step ? 'rgba(244, 63, 94, 0.8)' : 'rgba(244, 63, 94, 0.2)'
                                    }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute rounded-full border-[3px] border-dashed pointer-events-none"
                                    style={{
                                        width: size,
                                        height: size,
                                        boxShadow: i === step ? '0 0 30px rgba(244,63,94,0.3) inset, 0 0 30px rgba(244,63,94,0.3)' : 'none'
                                    }}
                                />
                            ))}

                            {/* Center Origin Node */}
                            <div className="w-4 h-4 rounded-full bg-rose-500 z-10 shadow-[0_0_15px_rgba(244,63,94,1)] absolute" />

                            {/* Active Loop Pointer */}
                            {step >= 0 && (
                                <motion.div
                                    animate={{ rotate: isPlaying ? [0, 360] : 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-full flex items-center justify-center z-20 pointer-events-none"
                                >
                                    <div
                                        className="absolute bg-white rounded-full shadow-[0_0_15px_white]"
                                        style={{ width: 10, height: 10, transform: `translateY(-${loopSizes[step] / 2}px)` }}
                                    />
                                </motion.div>
                            )}

                            {/* Risk Quadrant Labels */}
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-40">
                                <div className="border-r border-b border-rose-500/10 flex items-center justify-center p-4">
                                    <span className="text-[9px] font-black uppercase text-rose-300 tracking-[0.2em] bg-black/50 px-2 py-1 rounded">2. Risk Analysis</span>
                                </div>
                                <div className="border-b border-rose-500/10 flex items-center justify-center p-4">
                                    <span className="text-[9px] font-black uppercase text-indigo-300 tracking-[0.2em] bg-black/50 px-2 py-1 rounded">3. Engineering</span>
                                </div>
                                <div className="border-r border-rose-500/10 flex items-center justify-center p-4">
                                    <span className="text-[9px] font-black uppercase text-blue-300 tracking-[0.2em] bg-black/50 px-2 py-1 rounded">1. Planning</span>
                                </div>
                                <div className="flex items-center justify-center p-4">
                                    <span className="text-[9px] font-black uppercase text-emerald-300 tracking-[0.2em] bg-black/50 px-2 py-1 rounded">4. Evaluation</span>
                                </div>
                            </div>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md text-center bg-black/60 p-5 rounded-2xl border border-rose-500/20 backdrop-blur-xl">
                            <h4 className="text-rose-400 font-black text-sm uppercase tracking-widest mb-2">{configs.spiral.steps[step].title}</h4>
                            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                {configs.spiral.steps[step].desc}
                            </p>
                        </div>
                    </div>
                );
            }
        },
        scrum: {
            title: "Scrum Framework",
            icon: <RefreshCcw size={24} className="text-emerald-400" />,
            color: "emerald",
            steps: [
                { id: 0, title: "Product Backlog", desc: "PO prioritizes all features." },
                { id: 1, title: "Sprint Planning", desc: "Team pulls items into the 2-week Sprint Backlog." },
                { id: 2, title: "The Sprint", desc: "Team builds. Daily 15-min standup syncs progress." },
                { id: 3, title: "Review & Retro", desc: "Demo to client, then improve process for next sprint." }
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4">
                    <div className="flex items-center justify-between w-full max-w-4xl gap-4">

                        {/* Product Backlog List */}
                        <div className={`flex flex-col gap-2 w-48 transition-all ${step === 0 ? 'scale-105' : 'opacity-60 grayscale'}`}>
                            <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest text-center mb-2">Product Backlog</h4>
                            {[1, 2, 3, 4, 5].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        backgroundColor: step >= 1 && (i === 1 || i === 2) ? 'rgba(255,255,255,0.02)' : 'rgba(16, 185, 129, 0.1)',
                                        borderColor: step >= 1 && (i === 1 || i === 2) ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.3)'
                                    }}
                                    className="p-3 border rounded-lg text-[9px] font-mono text-white/80 flex items-center gap-2"
                                >
                                    <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                    Feature {i}
                                </motion.div>
                            ))}
                        </div>

                        <ArrowRight size={20} className={`${step >= 1 ? 'text-emerald-500' : 'text-white/10'}`} />

                        {/* Sprint Box */}
                        <div className={`relative w-64 h-64 border-2 rounded-[2rem] flex flex-col items-center justify-center p-6 transition-all ${step === 2 ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-emerald-500/20 bg-white/5'}`}>
                            <h4 className="absolute top-4 text-[10px] font-black uppercase text-white tracking-widest text-center">Sprint (2 Weeks)</h4>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
                                        <div className="p-2 border border-emerald-500/40 bg-emerald-500/20 rounded text-[9px] text-white text-center">Sprint Planning</div>
                                        <div className="p-2 border border-emerald-500/40 bg-emerald-500/20 rounded text-[9px] text-white text-center">Pull Features 1 & 2</div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-[3px] border-emerald-500/30 border-t-emerald-400 rounded-full" />
                                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-emerald-300 uppercase leading-tight text-center">
                                            Daily<br />Scrum
                                        </div>
                                    </motion.div>
                                )}
                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 items-center">
                                        <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400 rounded-full flex items-center justify-center text-indigo-300">
                                            <Play size={16} />
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Sprint Review</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <ArrowRight size={20} className={`${step >= 3 ? 'text-emerald-500' : 'text-white/10'}`} />

                        {/* Increment */}
                        <div className={`w-32 h-32 border-2 rounded-2xl flex flex-col items-center justify-center transition-all ${step === 3 ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'border-white/10 bg-white/5 grayscale'}`}>
                            <Database size={32} className="text-emerald-400 mb-2" />
                            <span className="text-[10px] font-black uppercase text-center text-white">Working<br />Increment</span>
                        </div>

                    </div>

                    {/* Desc */}
                    <div className="mt-12 bg-black/60 px-8 py-4 rounded-full border border-emerald-500/20 max-w-xl text-center">
                        <span className="text-[11px] text-white/80 font-medium">{configs.scrum.steps[step].desc}</span>
                    </div>
                </div>
            )
        },
        kanban: {
            title: "Kanban Method",
            icon: <LayoutTemplate size={24} className="text-amber-400" />,
            color: "amber",
            steps: [
                { id: 0, title: "Visualize Flow", desc: "Columns map the stages (To Do, Doing, Done)." },
                { id: 1, title: "Pull System", desc: "Devs pull work from left to right when they have capacity." },
                { id: 2, title: "WIP Limits", desc: "Max 2 items in 'Doing'. Forcing teams to finish things first." },
                { id: 3, title: "Bottlenecks", desc: "If 'Review' piles up, the team sees the bottleneck visually." },
                { id: 4, title: "Continuous Delivery", desc: "No sprints. As soon as it hits 'Done', it can ship." }
            ],
            render: () => {
                const cols = ['To Do', 'Doing (WIP: 2)', 'Review', 'Done'];
                return (
                    <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4">
                        <div className="flex gap-4 w-full max-w-4xl h-72">
                            {cols.map((col, cIdx) => (
                                <div key={cIdx} className="flex-1 rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col">
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest text-center mb-4 pb-2 border-b 
                                        ${cIdx === 1 ? 'border-amber-500/50 text-amber-300' : 'border-white/10 text-white/50'}`}>
                                        {col}
                                    </h4>

                                    <div className="flex-1 flex flex-col gap-3 relative">
                                        {/* To Do Items */}
                                        {cIdx === 0 && (
                                            <>
                                                <motion.div animate={{ opacity: step >= 1 ? 0 : 1 }} className="h-16 rounded-xl bg-white/5 border border-white/10 p-3 text-[10px] text-white/60">Ticket 1</motion.div>
                                                <motion.div className="h-16 rounded-xl bg-white/5 border border-white/10 p-3 text-[10px] text-white/60">Ticket 2</motion.div>
                                                <motion.div className="h-16 rounded-xl bg-white/5 border border-white/10 p-3 text-[10px] text-white/60">Ticket 3</motion.div>
                                            </>
                                        )}

                                        {/* Doing Items */}
                                        {cIdx === 1 && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.8 }}
                                                    className="h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 p-3 text-[10px] text-white"
                                                >
                                                    Ticket 1 <span className="float-right text-amber-400"><Activity size={12} /></span>
                                                </motion.div>
                                                {step >= 2 && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        className="h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 p-3 text-[10px] text-white"
                                                    >
                                                        Ticket X
                                                    </motion.div>
                                                )}
                                                {/* WIP Limit Block */}
                                                {step >= 2 && (
                                                    <div className="absolute bottom-0 w-full p-2 bg-red-500/20 border border-red-500/30 rounded text-center text-[8px] text-red-400 font-bold uppercase">
                                                        WIP Limit Reached
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Review (Bottleneck) */}
                                        {cIdx === 2 && step >= 3 && (
                                            <>
                                                {[1, 2, 3, 4].map(k => (
                                                    <motion.div key={k} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.1 }} className="h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2 text-[10px] text-rose-200">
                                                        Stuck {k}
                                                    </motion.div>
                                                ))}
                                                <div className="absolute inset-0 border-2 border-rose-500/50 rounded-xl pointer-events-none animate-pulse" />
                                            </>
                                        )}

                                        {/* Done */}
                                        {cIdx === 3 && step >= 4 && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-16 rounded-xl bg-green-500/20 border border-green-500/40 p-3 text-[10px] text-green-300">
                                                Ticket Y <span className="float-right"><CheckCircle2 size={12} /></span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desc */}
                        <div className="mt-8 bg-amber-500/10 px-8 py-4 rounded-2xl border border-amber-500/30 max-w-xl text-center">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{configs.kanban.steps[step].title}</h4>
                            <p className="text-[11px] text-white/80 font-medium">{configs.kanban.steps[step].desc}</p>
                        </div>
                    </div>
                )
            }
        },
        xp: {
            title: "Extreme Programming",
            icon: <Workflow size={24} className="text-purple-400" />,
            color: "purple",
            steps: [
                { id: 0, title: "Pair Programming", desc: "Two devs, one keyboard. Constant real-time review." },
                { id: 1, title: "TDD: Red", desc: "Write a failing test first. (Test Driven Dev)" },
                { id: 2, title: "TDD: Green", desc: "Write minimum code to pass the test." },
                { id: 3, title: "TDD: Refactor", desc: "Clean up code structure without changing behavior." }
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4">
                    <div className="w-full max-w-3xl flex gap-8 items-center justify-center h-64">

                        {/* Pair Programming Node */}
                        <div className={`flex flex-col items-center justify-center w-48 h-48 rounded-full border-[3px] transition-all duration-500 ${step === 0 ? 'border-purple-400 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.3)]' : 'border-white/10 bg-white/5 grayscale opacity-50'}`}>
                            <div className="flex gap-2 mb-4 text-purple-400">
                                <Activity size={32} /> <Activity size={32} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center text-white">Pair<br />Programming</span>
                        </div>

                        {/* TDD Cycle */}
                        <div className={`relative w-64 h-64 rounded-full border-2 transition-all duration-500 ${step > 0 ? 'border-purple-500/30 bg-black/40 shadow-inner' : 'border-white/5 opacity-20'}`}>
                            <h4 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-purple-500 tracking-widest text-center">TDD<br />Cycle</h4>

                            <motion.div
                                animate={{ scale: step === 1 ? 1.2 : 1, opacity: step >= 1 ? 1 : 0 }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 p-3 bg-red-500 rounded-xl text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-white/20"
                            >
                                <span className="text-[8px] font-black uppercase tracking-widest">1. Write Test (FAILS)</span>
                            </motion.div>

                            <motion.div
                                animate={{ scale: step === 2 ? 1.2 : 1, opacity: step >= 2 ? 1 : 0 }}
                                className="absolute -bottom-4 right-0 p-3 bg-emerald-500 rounded-xl text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-white/20"
                            >
                                <span className="text-[8px] font-black uppercase tracking-widest">2. Code (PASS)</span>
                            </motion.div>

                            <motion.div
                                animate={{ scale: step === 3 ? 1.2 : 1, opacity: step >= 3 ? 1 : 0 }}
                                className="absolute -bottom-4 left-0 p-3 bg-blue-500 rounded-xl text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20"
                            >
                                <span className="text-[8px] font-black uppercase tracking-widest">3. Refactor</span>
                            </motion.div>
                        </div>

                    </div>

                    <div className="mt-12 bg-purple-500/10 px-8 py-4 rounded-2xl border border-purple-500/30 max-w-xl text-center">
                        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{configs.xp.steps[step].title}</h4>
                        <p className="text-[11px] text-white/80 font-medium">{configs.xp.steps[step].desc}</p>
                    </div>
                </div>
            )
        }
    };

    const config = configs[normalizedType] || configs.waterfall;

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="flex items-center gap-5">
                    <div 
                        className={`w-12 h-12 bg-${config.color}-500/20 rounded-2xl flex items-center justify-center border border-${config.color}-500/20`}
                        style={{ boxShadow: `0 0 20px rgba(var(--${config.color}-500), 0.2)` }}
                    >
                        {config.icon}
                    </div>
                    <div>
                        <h4 className={`text-[9px] font-black uppercase tracking-[0.4em] text-${config.color}-500 mb-0.5`}>Process Lab</h4>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{config.title} Visualizer</h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-1 bg-white/[0.03] rounded-[1.5rem] border border-white/5 backdrop-blur-3xl">
                    <button
                        onClick={() => setView('simulation')}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'simulation' ? `bg-${config.color}-600 text-white shadow-lg` : 'text-white/40 hover:text-white'}`}
                    >
                        Live Simulation
                    </button>
                    <button
                        onClick={() => setView('principles')}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'principles' ? `bg-${config.color}-600 text-white shadow-lg` : 'text-white/40 hover:text-white'}`}
                    >
                        Core Matrix
                    </button>
                </div>
            </div >

            {/* Stages */}
            < div className="relative flex flex-col min-h-[600px] bg-gradient-to-br from-white/[0.01] to-transparent" >
                <AnimatePresence mode="wait">
                    {view === 'simulation' ? (
                        <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">

                            {/* Visual Render */}
                            <div className="flex-1 overflow-hidden relative">
                                {config.render()}
                            </div>

                            {/* Controls Footer */}
                            <div className="h-20 border-t border-white/5 bg-black/40 flex items-center justify-between px-8 backdrop-blur-md">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Step {step + 1} / {getMaxSteps(normalizedType)}
                                </span>

                                <div className="flex items-center gap-4">
                                    <button onClick={prevStep} disabled={step === 0} className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors">
                                        <ArrowRight size={16} className="rotate-180" />
                                    </button>

                                    <button
                                        onClick={() => isPlaying ? setIsPlaying(false) : setIsPlaying(true)}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : `bg-${config.color}-500 hover:bg-${config.color}-600`}`}
                                        style={{ 
                                            boxShadow: isPlaying 
                                                ? '0 0 15px rgba(239, 68, 68, 0.3)' 
                                                : `0 0 15px rgba(var(--${config.color}-500), 0.3)` 
                                        }}
                                    >
                                        {isPlaying ? "Pause" : <><Play size={12} /> Auto Play</>}
                                    </button>

                                    <button onClick={nextStep} disabled={step === getMaxSteps(normalizedType) - 1} className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors">
                                        <ArrowRight size={16} />
                                    </button>

                                    <button onClick={reset} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 ml-4 transition-colors">
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.div key="prin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 p-12 overflow-y-auto custom-scrollbar min-h-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {config.steps.map((s, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:border-white/10 transition-all">
                                        <div className={`w-10 h-10 rounded-xl bg-${config.color}-500/10 flex items-center justify-center text-${config.color}-400 mb-2`}>
                                            <span className="font-black text-lg">{i + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-black italic uppercase text-white">{s.title}</h3>
                                        <p className="text-[11px] text-white/60 font-medium leading-relaxed">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div >
                    )}
                </AnimatePresence >
            </div >
        </div >
    );
};

export default MethodologyVisualizer;
