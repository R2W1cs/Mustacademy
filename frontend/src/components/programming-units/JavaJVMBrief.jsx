import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RefreshCw, Hexagon, Database, Cpu, Activity, Play } from 'lucide-react';

const JavaJVMBrief = () => {
    const [stats, setStats] = useState({ eden: 0, survivor: 0, old: 0, meta: 20 });
    const [objects, setObjects] = useState([]);
    const [logs, setLogs] = useState(["JVM Process 4021 Initialized...", "Awaiting Class Loader..."]);

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const createObject = () => {
        if (stats.eden >= 100) {
            triggerGC();
            return;
        }
        const newObj = { id: Math.random().toString(36).substr(2, 4), age: 0 };
        setObjects(prev => [...prev, newObj]);
        setStats(prev => ({ ...prev, eden: prev.eden + 10 }));
        addLog(`new Object() created: @${newObj.id}`);
    };

    const triggerGC = () => {
        addLog("Critical: Eden Space Full. Triggering Minor GC...");
        setStats(prev => ({
            ...prev,
            eden: 0,
            survivor: Math.min(prev.survivor + 20, 100),
            old: Math.min(prev.old + 10, 100)
        }));
        setObjects(prev => prev.map(o => ({ ...o, age: o.age + 1 })));
    };

    return (
        <div className="p-8 pb-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full -top-20 -right-20 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Left: JVM Architecture Blueprint */}
                <div className="flex-1 space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                            <Hexagon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">JVM Blueprint</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Enterprise Runtime Environment</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Heap Space */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 col-span-2">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Layers size={14} className="text-amber-500" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white/80">The Heap (Object Storage)</span>
                                </div>
                                <span className="text-[10px] font-mono text-amber-500/60 uppercase tracking-tighter">0x00A - 0xFFF</span>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Eden */}
                                <div className="space-y-2 text-left">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Eden Space (Young Gen)</span>
                                        <span className={stats.eden > 80 ? "text-amber-500" : ""}>{stats.eden}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div animate={{ width: `${stats.eden}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    </div>
                                </div>

                                {/* Survivors */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Survivor S0</span>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div animate={{ width: `${stats.survivor / 2}%` }} className="h-full bg-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Survivor S1</span>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div animate={{ width: `${stats.survivor / 2}%` }} className="h-full bg-indigo-400 opacity-50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Old Gen */}
                                <div className="space-y-2 text-left pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                        <span>Old Generation (Tenured)</span>
                                        <span>{stats.old}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div animate={{ width: `${stats.old}%` }} className="h-full bg-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metaspace & Stack */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-4">Metaspace (Class Data)</span>
                            <div className="flex gap-1 flex-wrap">
                                {Array(8).fill(0).map((_, i) => (
                                    <div key={i} className={`w-3 h-3 rounded-sm border ${i < 3 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/5 border-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-4">The Stack (Frames)</span>
                            <div className="space-y-1">
                                <div className="h-2 bg-indigo-500/20 border border-indigo-500/30 rounded-md" />
                                <div className="h-2 bg-indigo-500/10 border border-indigo-500/20 rounded-md" />
                                <div className="h-2 bg-white/5 border border-white/10 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Interaction Center */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <Play size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Runtime Controls</span>
                        </div>
                        <button 
                            onClick={createObject}
                            className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-2xl border border-amber-500/20 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/5"
                        >
                            <RefreshCw size={14} /> instantiate()
                        </button>
                        <button 
                            onClick={triggerGC}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest transition-all"
                        >
                            System.gc()
                        </button>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 flex-1 max-h-[250px] overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">JVM Thread: main</span>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {logs.map((log, i) => (
                                    <motion.div 
                                        key={log + i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                        className="text-[10px] font-mono text-amber-200/80 border-l-2 border-amber-500/30 pl-3 py-1 text-left"
                                    >
                                        [{new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' })}] {log}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JavaJVMBrief;
