import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowRight, Zap, Database, Cpu, Activity } from 'lucide-react';

const CMemoryMatrix = () => {
    const memorySize = 64;
    const [memory, setMemory] = useState(Array(memorySize).fill({ val: 0, type: 'free', owner: null }));
    const [pointer, setPointer] = useState({ name: 'ptr', target: 24, active: true });
    const [logs, setLogs] = useState(["Memory Link Initialized...", "Awaiting Instruction..."]);

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const allocate = () => {
        const start = Math.floor(Math.random() * (memorySize - 8));
        const size = Math.floor(Math.random() * 4) + 2;
        addLog(`Allocating ${size} bytes at 0x${start.toString(16).toUpperCase()}...`);
        
        setMemory(prev => {
            const next = [...prev];
            for (let i = start; i < start + size; i++) {
                next[i] = { val: Math.floor(Math.random() * 255), type: 'heap', owner: 'malloc' };
            }
            return next;
        });
    };

    const resetMemory = () => {
        setMemory(Array(memorySize).fill({ val: 0, type: 'free', owner: null }));
        addLog("Memory Purged. Protocol Reset.");
    };

    return (
        <div className="p-8 pb-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
            {/* Background scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent h-20 animate-scanline pointer-events-none opacity-20" />
            
            <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* Left: Memory Grid */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Memory Matrix</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">C-Level Low-Latency Architecture</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-8 gap-2 p-4 bg-white/[0.02] rounded-3xl border border-white/5 shadow-inner">
                        {memory.map((cell, i) => {
                            const isPointerTarget = pointer.active && pointer.target === i;
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        backgroundColor: cell.type === 'heap' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                        borderColor: isPointerTarget ? '#6366f1' : 'rgba(255, 255, 255, 0.05)'
                                    }}
                                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-[9px] font-mono transition-all relative ${isPointerTarget ? 'shadow-lg shadow-indigo-500/40 z-10 scale-110 border-indigo-500' : ''}`}
                                >
                                    <span className={cell.type === 'heap' ? 'text-indigo-400 font-bold' : 'text-slate-700'}>
                                        {cell.val.toString(16).padStart(2, '0').toUpperCase()}
                                    </span>
                                    {isPointerTarget && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                                    )}
                                    <div className="absolute bottom-0.5 right-1 p-0 text-[6px] text-white/10 font-bold uppercase tracking-tighter">0x{i.toString(16).toUpperCase()}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Controls & Logic */}
                <div className="w-full lg:w-80 flex flex-col gap-8">
                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Control Interface</span>
                        </div>
                        <button 
                            onClick={allocate}
                            className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-2xl border border-indigo-500/20 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 box-border"
                        >
                            <Box size={14} /> Malloc() Memory
                        </button>
                        <button 
                            onClick={resetMemory}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest transition-all"
                        >
                            Purge Heap
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex-1 min-h-[150px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Synthesis Log</span>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {logs.map((log, i) => (
                                    <motion.div 
                                        key={log + i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                        className="text-[10px] font-mono text-indigo-300 border-l-2 border-indigo-500/30 pl-3 py-1"
                                    >
                                        &gt; {log}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-4 text-white/40">
                            <Database size={16} />
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">Memory Map Architecture</span>
                                <span className="text-[10px] font-bold text-slate-400">0x0000 - 0x0FFF Locked Stack</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMemoryMatrix;
