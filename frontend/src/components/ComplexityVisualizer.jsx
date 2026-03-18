import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Zap, TrendingUp, FlaskConical, Beaker, Terminal } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import * as math from 'mathjs';

const ComplexityVisualizer = () => {
    const [view, setView] = useState('curves'); // 'curves', 'limits', or 'definitions'
    const [nValue, setNValue] = useState(15);
    const [customFunc, setCustomFunc] = useState('n * log2(n)');
    const [funcError, setFuncError] = useState(null);

    const colors = {
        constant: '#10b981',
        log: '#3b82f6',
        linear: '#6366f1',
        linearithmic: '#8b5cf6',
        quadratic: '#ec4899',
        exponential: '#ef4444',
        custom: '#f59e0b'
    };

    const data = useMemo(() => {
        const result = [];
        let compiled = null;
        try {
            compiled = math.compile(customFunc);
            setFuncError(null);
        } catch (e) {
            setFuncError('Invalid Equation');
        }

        for (let n = 1; n <= Math.max(nValue, 10); n++) {
            let customVal = 0;
            if (compiled) {
                try {
                    customVal = compiled.evaluate({ n, log2: Math.log2 });
                } catch (e) {
                    // Ignore math errors for specific points
                }
            }

            result.push({
                n,
                constant: 10,
                log: Math.log2(n) * 5,
                linear: n * 2,
                linearithmic: n * Math.log2(n),
                quadratic: n * n * 0.5,
                exponential: Math.pow(1.5, n),
                custom: customVal
            });
        }
        return result;
    }, [nValue, customFunc]);

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[750px] shadow-lg">
            {/* Header - Downscaled Typography */}
            <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg">
                        <TrendingUp size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 mb-0.5">Asymptotic Lab</h4>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Growth Synthesis</h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 p-1 bg-white/[0.03] rounded-[1.5rem] border border-white/5 backdrop-blur-3xl">
                    {['curves', 'limits', 'definitions'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            {v === 'curves' ? 'Function Forge' : v === 'limits' ? 'Limit Test' : 'Logic Matrix'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Main Interactive Stage */}
                <div className="flex-1 p-8 bg-gradient-to-br from-blue-500/[0.01] to-transparent leading-relaxed">
                    <AnimatePresence mode="wait">
                        {view === 'curves' ? (
                            <motion.div
                                key="curves"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col gap-8"
                            >
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Beaker className="text-blue-400" size={16} />
                                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight">The Function Forge</h3>
                                        </div>
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Inject Custom Function f(n)</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={customFunc}
                                                        onChange={(e) => setCustomFunc(e.target.value)}
                                                        className={`w-full bg-black/40 border ${funcError ? 'border-red-500/40' : 'border-white/10'} rounded-2xl px-5 py-3 text-sm font-mono text-blue-400 outline-none focus:border-blue-500/30 transition-all`}
                                                        placeholder="e.g. n * log2(n)"
                                                    />
                                                    <Terminal className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={16} />
                                                </div>
                                                {funcError && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest pl-1">{funcError}</p>}
                                            </div>

                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex-1">
                                                    <input
                                                        type="range"
                                                        min="5"
                                                        max="100"
                                                        value={nValue}
                                                        onChange={(e) => setNValue(parseInt(e.target.value))}
                                                        className="w-full accent-blue-600"
                                                    />
                                                </div>
                                                <div className="bg-blue-500/10 px-4 py-1.5 rounded-lg border border-blue-500/20">
                                                    <span className="text-xs font-black text-white">n = {nValue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 relative min-h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                <XAxis dataKey="n" stroke="#ffffff10" fontSize={9} hide />
                                                <YAxis stroke="#ffffff10" fontSize={9} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', color: '#fff' }}
                                                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px' }} />
                                                <Line type="monotone" dataKey="constant" stroke={colors.constant} strokeWidth={2} dot={false} strokeOpacity={0.3} name="O(1)" />
                                                <Line type="monotone" dataKey="log" stroke={colors.log} strokeWidth={2} dot={false} strokeOpacity={0.3} name="O(log n)" />
                                                <Line type="monotone" dataKey="linear" stroke={colors.linear} strokeWidth={2} dot={false} strokeOpacity={0.3} name="O(n)" />
                                                <Line type="monotone" dataKey="quadratic" stroke={colors.quadratic} strokeWidth={2} dot={false} strokeOpacity={0.3} name="O(n²)" />
                                                <Line type="monotone" dataKey="custom" stroke={colors.custom} strokeWidth={4} dot={false} name="f(n) Inject" shadow="0 0 10px #f59e0b" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        ) : view === 'limits' ? (
                            <motion.div
                                key="limits"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8 max-w-4xl mx-auto py-4"
                            >
                                <div className="text-center mb-10">
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-3">Calculus Verification</span>
                                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Limit Test Synthesis</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { title: "CASE 1: INFERIOR GROWTH", math: "\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = 0", result: "f(n) = o(g(n))", explanation: "f is mathematically too small. Denominator overflows.", color: "blue" },
                                        { title: "CASE 2: ISOMORPHIC GROWTH", math: "\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = c", result: "f(n) = \\Theta(g(n))", explanation: "Algorithms race at identical physics. Tight bounds.", color: "emerald" },
                                        { title: "CASE 3: SUPERIOR GROWTH", math: "\\lim_{n \\to \\infty} \\frac{f(n)}{g(n)} = \\infty", result: "f(n) = \\omega(g(n))", explanation: "f escapes g's gravity. It grows exponentially faster.", color: "red" }
                                    ].map((card, i) => (
                                        <div key={i} className={`px-8 py-6 rounded-[2rem] border transition-all bg-gradient-to-br from-${card.color}-500/5 to-transparent border-white/5 shadow-xl flex items-center justify-between gap-8 group`}>
                                            <div className="space-y-3">
                                                <h4 className={`text-[9px] font-black text-${card.color}-400 uppercase tracking-[0.3em] italic`}>{card.title}</h4>
                                                <div className="text-2xl text-white">
                                                    <BlockMath math={card.math} />
                                                </div>
                                                <p className="text-[11px] text-white/40 font-medium italic">"{card.explanation}"</p>
                                            </div>
                                            <div className="px-6 py-4 bg-black/40 rounded-2xl border border-white/5 text-center min-w-[160px]">
                                                <span className="text-[8px] font-black text-blue-400 uppercase block mb-1 tracking-widest">Logic Result</span>
                                                <div className="text-lg font-black text-white italic"><InlineMath math={card.result} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="defs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4"
                            >
                                {[
                                    { title: "Big-O", subtitle: "Upper Bound", sym: "O(g)", logic: "f(n) \\le c \\cdot g(n)", color: "text-blue-400" },
                                    { title: "Big-Ω", subtitle: "Lower Bound", sym: "\\Omega(g)", logic: "f(n) \\ge c \\cdot g(n)", color: "text-emerald-400" },
                                    { title: "Big-Θ", subtitle: "Tight Bound", sym: "\\Theta(g)", logic: "c_1 g \\le f \\le c_2 g", color: "text-indigo-400" },
                                    { title: "little-o", subtitle: "Strictly Smaller", sym: "o(g)", logic: "\\text{Limit} = 0", color: "text-sky-400" },
                                    { title: "little-ω", subtitle: "Strictly Bigger", sym: "\\omega(g)", logic: "\\text{Limit} = \\infty", color: "text-rose-400" }
                                ].map((def, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col gap-5 group">
                                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                                            <div>
                                                <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${def.color}`}>{def.title}</h3>
                                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{def.subtitle}</span>
                                            </div>
                                            <div className="text-lg text-white/60"><InlineMath math={def.sym} /></div>
                                        </div>
                                        <div className="flex-1 py-4 flex items-center justify-center text-lg text-white italic">
                                            <InlineMath math={def.logic} />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cognitive Sidebar - Downscaled */}
                <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-white/5 p-8 flex flex-col gap-10 bg-white/[0.01] backdrop-blur-3xl">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2.5">
                            <Activity className="text-blue-500" size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Cognitive Rules</span>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase">
                                <Zap size={12} /> The Golden Rule
                            </div>
                            <p className="text-[11px] text-white/40 leading-relaxed font-medium italic">
                                "The bigger function always goes inside. Constants are noise; we only care about the curve as <InlineMath math="n \to \infty" />."
                            </p>
                        </div>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                            <h6 className="text-[9px] font-black text-blue-400 uppercase mb-4 tracking-widest">Growth Priority Matrix</h6>
                            <div className="space-y-2.5">
                                {[
                                    { f: "1", g: "\\log n" },
                                    { f: "\\log n", g: "n" },
                                    { f: "n", g: "n \\log n" },
                                    { f: "n \\log n", g: "n^2" },
                                    { f: "n^2", g: "2^n" }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] font-mono text-white/30 border-b border-white/5 pb-1">
                                        <InlineMath math={row.f} />
                                        <span className="text-[10px] text-blue-500/40">{'<<'}</span>
                                        <InlineMath math={row.g} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ComplexityVisualizer;

