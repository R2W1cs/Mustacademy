import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Unlock, Zap, Share2, Binary, Activity, Code } from 'lucide-react';

const PythonRuntime = () => {
    const [isGILocked, setIsGILocked] = useState(true);
    const [bytecode, setBytecode] = useState([
        { op: 'LOAD_CONST', arg: '10' },
        { op: 'STORE_NAME', arg: 'x' },
        { op: 'LOAD_NAME', arg: 'x' },
        { op: 'PRINT_ITEM', arg: '' }
    ]);
    const [pc, setPc] = useState(0);
    const [objects, setObjects] = useState([
        { id: '0x7f1', type: 'int', val: '10', refs: 1 }
    ]);
    const [logs, setLogs] = useState(["CPython VM 3.12 Initialized...", "GIL: Engaged"]);

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const step = () => {
        if (!isGILocked) {
            addLog("Error: Execution halted. Thread must acquire GIL.");
            return;
        }
        
        const current = bytecode[pc];
        addLog(`Executing ${current.op} ${current.arg}...`);
        
        if (current.op === 'LOAD_CONST') {
            // Object space simulation
        }

        setPc(prev => (prev + 1) % bytecode.length);
    };

    const toggleGIL = () => {
        setIsGILocked(!isGILocked);
        addLog(isGILocked ? "GIL Released. Context Switch Pending..." : "GIL Acquired. Thread execution resumed.");
    };

    return (
        <div className="p-8 pb-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Left: Python Interpreter Loop */}
                <div className="flex-1 space-y-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                            <Binary size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Python Runtime</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High-Level Dynamic Interpretation</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bytecode Stream */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal size={14} className="text-emerald-400" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/80">Bytecode Queue (CEval.c)</span>
                            </div>
                            <div className="space-y-2">
                                {bytecode.map((op, i) => (
                                    <motion.div 
                                        key={i}
                                        animate={{ 
                                            backgroundColor: pc === i ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                                            x: pc === i ? 10 : 0
                                        }}
                                        className="p-3 rounded-xl border border-white/5 flex items-center justify-between font-mono text-xs"
                                    >
                                        <span className={pc === i ? "text-emerald-400" : "text-slate-500"}>{op.op}</span>
                                        <span className="text-slate-700">{op.arg}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Object Space */}
                        <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Share2 size={14} className="text-emerald-400" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/80">PyObject Space (Heap)</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {objects.map((obj, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between text-left">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase">Address: {obj.id}</span>
                                            <span className="text-[12px] font-bold text-white uppercase">{obj.type}({obj.val})</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-500">Refs: {obj.refs}</span>
                                            <div className="flex gap-0.5 mt-1">
                                                {Array(obj.refs).fill(0).map((_, j) => (
                                                    <div key={j} className="w-1 h-3 bg-emerald-500 rounded-full" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest text-left">Automatic Reference Counting Protocol Active</p>
                        </div>
                    </div>
                </div>

                {/* Right: The GIL Control */}
                <div className="w-full lg:w-80 flex flex-col gap-8">
                    <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 relative flex flex-col items-center">
                        <motion.div 
                            animate={{ rotate: isGILocked ? 360 : 0 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="w-32 h-32 rounded-full border-4 border-dashed border-emerald-500/20 flex items-center justify-center mb-6 relative"
                        >
                            <div className={`p-6 rounded-full ${isGILocked ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-500 ring-1 ring-white/10'}`}>
                                {isGILocked ? <Lock size={32} /> : <Unlock size={32} />}
                            </div>
                        </motion.div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-2 underline decoration-emerald-500/50 underline-offset-8">The Global Interpreter Lock</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-8 text-center">{isGILocked ? "Single-Threaded Safety Locked" : "System Halt: Safety Violation"}</p>
                        
                        <button 
                            onClick={toggleGIL}
                            className={`w-full py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${isGILocked ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-emerald-500 text-black border-emerald-500 shadow-xl'}`}
                        >
                            {isGILocked ? "Release GIL" : "Acquire GIL"}
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex-1 min-h-[150px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bytecode Telemetry</span>
                        </div>
                        <button 
                            onClick={step}
                            className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest transition-all mb-4 flex items-center justify-center gap-2"
                        >
                            <Code size={14} /> Step Instruction
                        </button>
                        <div className="space-y-2">
                             {logs.map((log, i) => (
                                <motion.div 
                                    key={log + i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                    className="text-[9px] font-mono text-emerald-300 border-l-2 border-emerald-500/30 pl-3 py-1 text-left"
                                >
                                    &gt;&gt;&gt; {log}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PythonRuntime;
