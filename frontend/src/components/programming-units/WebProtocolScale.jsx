import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Smartphone, Zap, ArrowRight, Layout, Code, Activity, Search } from 'lucide-react';

const WebProtocolScale = () => {
    const [step, setStep] = useState(0);
    const [ms, setMs] = useState(0);
    const [logs, setLogs] = useState(["Web Protocol Interface Initialized...", "Awaiting Query..."]);

    const pipeline = [
        { label: 'DNS Lookup', icon: <Search size={18} />, desc: 'Resolving domain to 104.21.3.1', duration: 42 },
        { label: 'TCP Handshake', icon: <Activity size={18} />, desc: 'SYN -> SYN-ACK -> ACK', duration: 15 },
        { label: 'TLS Protocol', icon: <Zap size={18} />, desc: 'Negotiating Encryption (ALPN)', duration: 28 },
        { label: 'HTTP GET', icon: <Globe size={18} />, desc: 'Requesting /index.html', duration: 210 },
        { label: 'DOM Parsing', icon: <Code size={18} />, desc: 'Building Tag Tree', duration: 110 },
        { label: 'Layout & Paint', icon: <Layout size={18} />, desc: 'Calculating Geometries', duration: 85 }
    ];

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const nextStep = () => {
        if (step < pipeline.length - 1) {
            const current = pipeline[step];
            addLog(`${current.label} complete: +${current.duration}ms`);
            setMs(prev => prev + current.duration);
            setStep(prev => prev + 1);
        } else {
            reset();
        }
    };

    const reset = () => {
        setStep(0);
        setMs(0);
        setLogs(["Sequence Reset. Re-initializing Protocol..."]);
    };

    return (
        <div className="p-8 pb-10 rounded-[3rem] bg-black/40 border border-white/5 backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-indigo-500/5 blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col gap-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg">
                            <Globe size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white">Full Stack Protocol</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">The Request-to-Pixel Pipeline</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] font-black uppercase text-indigo-400">Response Latency</span>
                            <span className="text-xl font-mono text-white font-bold">{ms}ms</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <button 
                            onClick={nextStep}
                            className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {step === pipeline.length - 1 ? 'Reset Protocol' : 'Next Chunk'}
                        </button>
                    </div>
                </div>

                {/* The Pipeline Visualization */}
                <div className="relative py-10 px-4">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/[0.03] -translate-y-1/2" />
                    <motion.div 
                        animate={{ width: `${(step / (pipeline.length - 1)) * 100}%` }}
                        className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-700"
                    />

                    <div className="flex justify-between items-center relative gap-4">
                        {pipeline.map((p, i) => {
                            const isPast = step > i;
                            const isCurrent = step === i;
                            return (
                                <div key={i} className="flex flex-col items-center gap-4 relative">
                                    <motion.div 
                                        animate={{ 
                                            scale: isCurrent ? 1.2 : 1,
                                            backgroundColor: isPast || isCurrent ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                                            color: isPast || isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.2)'
                                        }}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${isCurrent ? 'border-white z-20' : 'border-transparent'}`}
                                    >
                                        {p.icon}
                                    </motion.div>
                                    <div className="absolute -bottom-16 w-32 text-center pointer-events-none">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCurrent ? 'text-indigo-400' : 'text-slate-600'}`}>{p.label}</p>
                                        <p className={`text-[8px] font-bold text-slate-700 uppercase leading-tight ${isCurrent ? 'opacity-100' : 'opacity-0'}`}>{p.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-20 md:hidden" /> {/* Spacer for labels */}

                {/* Sub-UI: The DOM Browser Mock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                    <div className="p-8 rounded-[2.5rem] bg-indigo-600/[0.03] border border-indigo-500/10 space-y-6">
                        <div className="flex items-center gap-3">
                            <Layout size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Browser Layout Engine (Blink)</span>
                        </div>
                        <div className="aspect-video rounded-3xl bg-black/40 border border-white/5 p-6 flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                                    <div className="h-3 w-1/2 bg-white/5 rounded-full" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                <div className={`rounded-2xl border border-white/5 transition-all duration-1000 ${step >= 4 ? 'bg-indigo-500/10' : 'bg-transparent'}`} />
                                <div className={`rounded-2xl border border-white/5 transition-all duration-1000 ${step >= 5 ? 'bg-indigo-500/40' : 'bg-transparent'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Server size={14} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Network Telemetry</span>
                        </div>
                        <div className="space-y-3">
                             {logs.map((log, i) => (
                                <motion.div 
                                    key={log + i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1 - i * 0.2, x: 0 }}
                                    className="text-[10px] font-mono text-indigo-200/60 border-l-2 border-indigo-500/20 pl-4 py-2 text-left"
                                >
                                    [{new Date().toLocaleTimeString('en-US', { hour12: false })}] {log}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebProtocolScale;
