import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Binary, ChevronDown, Info, Hash, Sparkles, Brain, Lightbulb } from 'lucide-react';

const RecurrenceVisualizer = () => {
    const [step, setStep] = useState(0);
    const [expansionMode, setExpansionMode] = useState('substitution'); // 'substitution', 'tree', or 'how-to'
    const [exampleIdx, setExampleIdx] = useState(0);

    const examples = [
        {
            name: "Merge Sort (Divide & Conquer)",
            recurrence: "T(n) = 2T(n/2) + n",
            complexity: "Θ(n log n)",
            forwardSteps: [
                {
                    title: "Step 1: Initial State",
                    math: "T(n) = 2T(n/2) + n",
                    explanation: "Our starting point. The problem is halved, and work is $n$."
                },
                {
                    title: "Step 2: Forward expansion (expand T(n/2))",
                    math: "T(n) = 2(2T(n/4) + n/2) + n",
                    mathDetails: "Substitute T(n/2) = 2T(n/4) + n/2",
                    explanation: "Distribute the 2: $T(n) = 4T(n/4) + n + n = 4T(n/4) + 2n$"
                },
                {
                    title: "Step 3: Expand again (expand T(n/4))",
                    math: "T(n) = 4(2T(n/8) + n/4) + 2n",
                    mathDetails: "Substitute T(n/4) = 2T(n/8) + n/4",
                    explanation: "Distribute the 4: $T(n) = 8T(n/8) + n + 2n = 8T(n/8) + 3n$"
                },
                {
                    title: "Step 4: Pattern Recognition",
                    math: "T(n) = 2^k T(n/2^k) + kn",
                    explanation: "After $k$ expansions, the coefficients match the powers of 2."
                },
                {
                    title: "Step 5: Stop Condition",
                    math: "n / 2^k = 1 \Rightarrow 2^k = n \Rightarrow k = \\log_2 n",
                    explanation: "The recursion hits bottom when the size is $1$."
                },
                {
                    title: "Step 6: Final Synthesis",
                    math: "T(n) = n \\cdot T(1) + n \\log_2 n",
                    mathDetails: "Assume T(1) = 1 (constant)",
                    explanation: "Complexity: $\\Theta(n \\log n)$!"
                }
            ],
            treeLevels: [
                { label: "Root (Level 0)", work: "n", branches: 2, size: "n" },
                { label: "Level 1", work: "n/2 + n/2 = n", branches: 2, size: "n/2" },
                { label: "Level 2", work: "4 * n/4 = n", branches: 4, size: "n/4" },
                { label: "Depth log n", work: "n * T(1) = n", branches: "n", size: "1" },
            ]
        },
        {
            name: "Binary Search",
            recurrence: "T(n) = T(n/2) + 1",
            complexity: "Θ(log n)",
            forwardSteps: [
                {
                    title: "Step 1",
                    math: "T(n) = T(n/2) + 1",
                    explanation: "One branch, constant work."
                },
                {
                    title: "Step 2",
                    math: "T(n) = (T(n/4) + 1) + 1 = T(n/4) + 2",
                    explanation: "Substituting T(n/2)."
                },
                {
                    title: "Pattern",
                    math: "T(n) = T(n/2^k) + k",
                    explanation: "k represents the depth."
                },
                {
                    title: "Stop",
                    math: "k = \\log_2 n",
                    explanation: "Final: $T(n) = T(1) + \\log_2 n = \\Theta(\\log n)$."
                }
            ],
            treeLevels: [
                { label: "Level 0", work: "1", branches: 1, size: "n" },
                { label: "Level 1", work: "1", branches: 1, size: "n/2" },
                { label: "Level 2", work: "1", branches: 1, size: "n/4" },
                { label: "Depth log n", work: "1", branches: 1, size: "1" },
            ]
        }
    ];

    const current = examples[exampleIdx % examples.length];

    const switchExample = () => {
        setExampleIdx(exampleIdx + 1);
        setStep(0);
    };

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col min-h-[750px] shadow-lg transition-all duration-700">
            {/* Glossy Header */}
            <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/20 shadow-lg">
                        <Calculator size={32} className="text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-1">{current.name}</h4>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{current.complexity}</h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 p-1.5 bg-white/[0.03] rounded-[2rem] border border-white/5 backdrop-blur-3xl">
                    <button
                        onClick={() => setExpansionMode('substitution')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${expansionMode === 'substitution' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Substitution
                    </button>
                    <button
                        onClick={() => setExpansionMode('tree')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${expansionMode === 'tree' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Recursion Tree
                    </button>
                    <button
                        onClick={() => setExpansionMode('how-to')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${expansionMode === 'how-to' ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        How-To Guide
                    </button>
                    <div className="w-[1px] h-6 bg-white/10 mx-2" />
                    <button
                        onClick={switchExample}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 active:scale-95 text-indigo-400 italic font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                        <Sparkles size={14} />
                        Next Concept
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Main Dynamic View */}
                <div className="flex-1 p-12 bg-gradient-to-br from-indigo-500/[0.02] to-transparent">
                    <AnimatePresence mode="wait">
                        {expansionMode === 'substitution' ? (
                            <motion.div
                                key="sub"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-8 max-w-4xl mx-auto"
                            >
                                <div className="text-center mb-16">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block mb-4">Neural Protocol</span>
                                    <h3 className="text-3xl font-black text-white uppercase italic">Forward Substitution Method</h3>
                                </div>

                                {current.forwardSteps.slice(0, step + 1).map((s, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`group relative p-10 rounded-[3rem] border transition-all duration-700 ${idx === step ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg ring-1 ring-white/10 scale-105 z-10' : 'bg-white/[0.02] border-white/5 opacity-40 blur-[1px]'}`}
                                    >
                                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover:rotate-12 transition-transform">{idx + 1}</div>

                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">{s.title}</h5>
                                                {idx === step && <div className="flex gap-1"><div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" /><div className="w-1 h-1 bg-indigo-500 rounded-full" /></div>}
                                            </div>

                                            <div className="text-3xl md:text-5xl font-serif text-white italic tracking-tight font-medium bg-black/20 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                                                {s.math}
                                            </div>

                                            {s.mathDetails && (
                                                <div className="p-4 px-6 bg-white/[0.03] rounded-xl border-l-2 border-indigo-500 text-[10px] font-mono text-white/50 lowercase tracking-wider">
                                                    ➜ {s.mathDetails}
                                                </div>
                                            )}

                                            <p className="text-base text-white/60 leading-relaxed font-medium mt-2 max-w-2xl italic">
                                                "{s.explanation}"
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {step < current.forwardSteps.length - 1 && (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="w-full py-10 rounded-[3rem] bg-indigo-600 text-white font-black uppercase tracking-[0.5em] text-xs shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        Initialize Next Expansion
                                    </button>
                                )}
                            </motion.div>
                        ) : expansionMode === 'tree' ? (
                            <motion.div
                                key="tree"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-16 py-12"
                            >
                                <div className="text-center mb-10">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block mb-4">Visual Architecture</span>
                                    <h3 className="text-3xl font-black text-white uppercase italic">Neural Recursion Tree</h3>
                                </div>

                                {current.treeLevels.map((lvl, idx) => (
                                    <div key={idx} className="flex flex-col items-center w-full max-w-5xl relative">
                                        {/* Level Metadata */}
                                        <div className="flex items-center justify-between w-full mb-8 px-12 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[9px] font-black text-white/20 bg-white/5">L{idx}</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{lvl.label}</span>
                                            </div>
                                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg">
                                                <span className="text-[10px] font-black text-indigo-300 uppercase italic">Level Work: </span>
                                                <span className="text-lg font-black text-white ml-2">{lvl.work}</span>
                                            </div>
                                        </div>

                                        {/* Tree Nodes */}
                                        <div className="flex justify-center gap-8 w-full">
                                            {idx === 0 ? (
                                                <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 border-2 border-indigo-400 shadow-lg flex items-center justify-center text-white font-black text-3xl italic animate-pulse">{lvl.size}</div>
                                            ) : idx === current.treeLevels.length - 1 ? (
                                                <div className="flex gap-4">
                                                    {[...Array(8)].map((_, i) => (
                                                        <div key={i} className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-[10px] shadow-lg">1</div>
                                                    ))}
                                                    <span className="text-white/20 pt-2 text-2xl">...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap justify-center gap-12">
                                                    {[...Array(Math.min(lvl.branches, 6))].map((_, i) => (
                                                        <div key={i} className="relative">
                                                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-lg italic shadow-xl hover:scale-110 transition-transform cursor-pointer">{lvl.size}</div>
                                                            {/* Flowing Lines */}
                                                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-indigo-500/40 to-transparent" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Connector to next level */}
                                        {idx < current.treeLevels.length - 1 && (
                                            <div className="h-16 w-px bg-white/5 my-4 overflow-visible relative">
                                                <div className="absolute top-0 left-0 w-32 h-px bg-indigo-500/20 -rotate-[30deg] origin-top-left" />
                                                <div className="absolute top-0 right-0 w-32 h-px bg-indigo-500/20 rotate-[30deg] origin-top-right" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="mt-20 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] max-w-2xl text-center shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full" />
                                    <p className="text-sm text-white/50 font-medium leading-relaxed italic relative z-10">
                                        "Total Work is the summation of work at each level across the entire tree depth. In Merge Sort, every level does $n$ work, and there are $\log n$ levels, resulting in $\Theta(n \log n)$."
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="how-to"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="max-w-4xl mx-auto space-y-12 py-10"
                            >
                                <div className="text-center mb-16">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] block mb-4">Strategic Framework</span>
                                    <h3 className="text-3xl font-black text-white uppercase italic">Forward Substitution Protocol</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { title: "Define Core", icon: <Binary size={20} />, text: "Write the recurrence relation clearly. Identify the split factor and work factor." },
                                        { title: "Level 1 Expansion", icon: <Lightbulb size={20} />, text: "Substitute the recursive call once. Distribute coefficients and group work terms." },
                                        { title: "Seek Pattern", icon: <Sparkles size={20} />, text: "Expand again if needed. Look for powers of base cases and growing linear terms." },
                                        { title: "Stopping Depth", icon: <Hash size={20} />, text: "Set the problem size to 1. Solve for 'k' to find the number of expansions needed." },
                                        { title: "Final Synthesis", icon: <Brain size={20} />, text: "Substitute k back into the general formula and use Big-O properties to simplify." }
                                    ].map((card, i) => (
                                        <div key={i} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.04] transition-all group shadow-xl">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-lg border border-emerald-500/20">{card.icon}</div>
                                                <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{card.title}</h4>
                                            </div>
                                            <p className="text-sm text-white/40 leading-relaxed font-medium">"{card.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cyber Sidebar Insights */}
                <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-white/5 p-12 flex flex-col gap-12 bg-white/[0.01] backdrop-blur-3xl">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <Binary className="text-indigo-500" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Synaptic Insights</span>
                        </div>
                        <div className="space-y-6">
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-2xl">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] rounded-full" />
                                <h6 className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-videst italic">The Scaling Paradox</h6>
                                <p className="text-sm text-white/40 leading-relaxed font-medium italic relative z-10">
                                    "When we divide by 2, we create $\log n$ levels. When we subtract 1, we create $n$ levels. In the world of high-performance computing, this logarithmic leap is the difference between seconds and centuries."
                                </p>
                            </div>

                            <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] shadow-xl">
                                <div className="flex items-center gap-3 mb-4 text-indigo-400 font-bold italic text-xs uppercase tracking-widest">
                                    <Info size={14} /> Critical Logic
                                </div>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                    Observe how Step 2 distributes the constant across both the subproblem AND the local work. Students often forget to multiply the local work by the branch count!
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-auto">
                        <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] relative overflow-hidden group hover:border-emerald-500/20 transition-all shadow-2xl">
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="text-emerald-500" size={16} />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Faculty Assistant</span>
                            </div>
                            <p className="text-[11px] text-white/30 font-medium leading-relaxed italic">
                                "This visual framework is modeled after the OpenDSA pedagogical standard. Each expansion layer is a transformation of cognitive effort into algorithmic intuition."
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RecurrenceVisualizer;

