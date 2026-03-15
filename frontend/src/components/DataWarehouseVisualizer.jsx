import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database,
    ArrowRight,
    Zap,
    RefreshCcw,
    Layers,
    Building2,
    Filter,
    Cpu,
    Activity,
    BarChart3,
    Users,
    Wallet,
    CheckCircle2,
    Calendar,
    Package,
    MapPin,
    TrendingUp,
    Monitor,
    PieChart,
    Server,
    LineChart,
    Globe,
    ExternalLink,
    Terminal
} from 'lucide-react';

const DataWarehouseVisualizer = ({ type = 'etl' }) => {
    const [view, setView] = useState('simulation'); // 'simulation', 'logic'
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const isETL = type.toLowerCase().includes('etl');
    const isDataMart = type.toLowerCase().includes('mart');
    const isModeling = type.toLowerCase().includes('modeling') || type.toLowerCase().includes('star') || type.toLowerCase().includes('snowflake');
    const isComparison = type.toLowerCase().includes('oltp') || type.toLowerCase().includes('olap') || type.toLowerCase().includes('comparison');
    const isArchitecture = type.toLowerCase().includes('architecture');

    const etlSteps = [
        { id: 0, title: "Extract", desc: "Pulling raw data from ERP, CRM, and Flat Files.", icon: <ArrowRight size={20} /> },
        { id: 1, title: "Staging", desc: "Temporary storage for raw data before processing.", icon: <Layers size={20} /> },
        { id: 2, title: "Transform", desc: "Cleaning, mapping, and normalizing data to a unified schema.", icon: <Cpu size={20} /> },
        { id: 3, title: "Load", desc: "Pushing processed data into the Central Data Warehouse.", icon: <RefreshCcw size={20} /> },
        { id: 4, title: "Analytics", desc: "Business Intelligence tools consume the data.", icon: <BarChart3 size={20} /> }
    ];

    const dataMartSteps = [
        { id: 0, title: "Data Warehouse", desc: "The 'Single Source of Truth' for the entire enterprise.", icon: <Database size={20} /> },
        { id: 1, title: "Partitioning", desc: "Filtering data based on departmental needs.", icon: <Filter size={20} /> },
        { id: 2, title: "Data Marts", desc: "Small, subject-oriented databases (Sales, HR, Finance).", icon: <Building2 size={20} /> },
        { id: 3, title: "Consumption", desc: "Departmental analysts run specialized reports.", icon: <Users size={20} /> }
    ];

    const modelingSteps = [
        { id: 0, title: "Fact Table", desc: "Central table containing quantitative measures (e.g., Sales, Temperature).", icon: <Zap size={20} /> },
        { id: 1, title: "Dimension Tables", desc: "Surrounding tables with descriptive attributes (Customer, Time, Store).", icon: <Layers size={20} /> },
        { id: 2, title: "Relationships", desc: "Foreign key joins creating the 'Star' pattern for query performance.", icon: <RefreshCcw size={20} /> },
        { id: 3, title: "Analysis", desc: "Aggregating metrics across multiple descriptive axes.", icon: <BarChart3 size={20} /> }
    ];

    const oltpVsOlapSteps = [
        { id: 0, title: "Request Patterns", desc: "OLTP: Millions of small atomic transactions. OLAP: Broad, complex analytical queries.", icon: <Zap size={20} /> },
        { id: 1, title: "Data Volume", desc: "OLTP: Small, operational datasets. OLAP: Gigabytes to Petabytes of historical data.", icon: <Database size={20} /> },
        { id: 2, title: "Processing Engine", desc: "OLTP: Row-based indexing for speed. OLAP: Columnar storage for aggregation performance.", icon: <Cpu size={20} /> },
        { id: 3, title: "Output", desc: "OLTP: Real-time application state. OLAP: strategic business insights and trends.", icon: <BarChart3 size={20} /> }
    ];

    const architectureSteps = [
        { id: 0, title: "Data Sources", desc: "Heterogeneous systems: ERP, CRM, Logs, and Third-party APIs.", icon: <Globe size={20} /> },
        { id: 1, title: "Staging Area", desc: "Validation, Deduplication, and Landing for batch processing.", icon: <Terminal size={20} /> },
        { id: 2, title: "DW Core", desc: "Unified, Integrated, and Time-variant relational storage.", icon: <Database size={20} /> },
        { id: 3, title: "Data Marts", desc: "Optimized silos for Finance, Sales, and Marketing reporting.", icon: <Layers size={20} /> },
        { id: 4, title: "Access Layer", desc: "Semantic views, BI tools, and predictive ML integration.", icon: <BarChart3 size={20} /> }
    ];

    const getSteps = () => {
        if (isArchitecture) return architectureSteps;
        if (isComparison) return oltpVsOlapSteps;
        if (isModeling) return modelingSteps;
        if (isDataMart) return dataMartSteps;
        return etlSteps;
    };

    const steps = getSteps();

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setStep(s => {
                    if (s >= steps.length - 1) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, steps.length]);

    const reset = () => {
        setStep(0);
        setIsPlaying(false);
    };

    const renderArchitecture = () => (
        <div className="flex flex-col items-center justify-center h-full w-full py-16 px-6">
            <div className="flex items-center justify-between w-full max-w-6xl relative">
                {/* Connection lines */}
                <div className="absolute left-0 right-0 h-px bg-white/5 top-1/2 -z-10" />

                {architectureSteps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-6 relative">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: step === i ? 1.1 : 1,
                                opacity: step >= i ? 1 : 0.2,
                                borderColor: step === i ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                                backgroundColor: step === i ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)'
                            }}
                            className={`w-28 h-28 rounded-[2rem] border-2 flex flex-col items-center justify-center p-4 transition-all duration-500 shadow-2xl
                                ${step === i ? 'shadow-indigo-500/20' : ''}
                            `}
                        >
                            <div className={`p-3 rounded-xl ${step === i ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40'}`}>
                                {s.icon}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-center mt-3 text-white">
                                {s.title}
                            </span>
                        </motion.div>

                        {/* Flow Pulse */}
                        {isPlaying && step === i && (
                            <motion.div
                                initial={{ x: 60, opacity: 0 }}
                                animate={{ x: 140, opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-1 bg-indigo-500 rounded-full blur-sm"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Explanation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-20 bg-white/[0.03] px-12 py-8 rounded-[3rem] border border-white/5 max-w-4xl text-center backdrop-blur-3xl"
                >
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">{architectureSteps[step].title}</h4>
                    </div>
                    <p className="text-[13px] text-white/50 font-medium tracking-wide leading-relaxed max-w-2xl mx-auto">
                        {architectureSteps[step].desc}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const renderComparison = () => (
        <div className="flex flex-col items-center justify-center h-full w-full py-10 px-6 gap-10">
            <div className="grid grid-cols-2 w-full max-w-5xl gap-12 relative">
                {/* Mid Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden lg:block" />

                {/* OLTP Side */}
                <div className={`p-8 rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center gap-6
                    ${step % 2 === 0 ? 'border-sky-500/40 bg-sky-500/5' : 'border-white/5 bg-white/2'}
                `}>
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="text-sky-400" size={24} />
                        <h4 className="text-xl font-black italic uppercase text-white">OLTP</h4>
                    </div>

                    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
                        {isPlaying && step === 0 && Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: -100, opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                className="absolute w-1 h-4 bg-sky-500/60 rounded-full"
                                style={{ left: `${(i * 100) / 15}%` }}
                            />
                        ))}
                        <Database size={48} className="text-white/20 relative z-10" />
                    </div>

                    <ul className="text-[10px] space-y-3 font-mono text-white/40">
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-sky-500" /> High concurrency</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-sky-500" /> Row-level reads/writes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-sky-500" /> Normalized (3NF)</li>
                    </ul>
                </div>

                {/* OLAP Side */}
                <div className={`p-8 rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center gap-6
                    ${step % 2 === 1 ? 'border-fuchsia-500/40 bg-fuchsia-500/5' : 'border-white/5 bg-white/2'}
                `}>
                    <div className="flex items-center gap-3 mb-4">
                        <PieChart className="text-fuchsia-400" size={24} />
                        <h4 className="text-xl font-black italic uppercase text-white">OLAP</h4>
                    </div>

                    <div className="relative w-full h-40 flex items-center justify-center overflow-hidden">
                        {isPlaying && step === 2 && (
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute w-32 h-32 rounded-full bg-fuchsia-500/20 blur-2xl"
                            />
                        )}
                        <Layers size={48} className="text-white/20 relative z-10" />
                    </div>

                    <ul className="text-[10px] space-y-3 font-mono text-white/40">
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-500" /> Low concurrency</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-500" /> Columnar aggregation</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-500" /> Denormalized (Star)</li>
                    </ul>
                </div>
            </div>

            {/* Step Explanation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/[0.03] px-12 py-6 rounded-[2rem] border border-white/5 max-w-4xl text-center"
                >
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic py-1 px-3 bg-indigo-500/10 rounded-full border border-indigo-500/20">Phase {step + 1}</span>
                        <h4 className="text-xl font-black text-white italic uppercase">{oltpVsOlapSteps[step].title}</h4>
                    </div>
                    <p className="text-[12px] text-white/60 font-medium tracking-wide">
                        {oltpVsOlapSteps[step].desc}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const renderETL = () => (
        <div className="flex flex-col items-center justify-center h-full w-full py-10 relative">
            <div className="flex items-center justify-between w-full max-w-5xl gap-4 px-10">
                {/* Source Systems */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest text-center mb-2">Sources</h4>
                    {[
                        { icon: <Building2 size={16} />, label: "CRM" },
                        { icon: <Wallet size={16} />, label: "Finance" },
                        { icon: <Database size={16} />, label: "ERP" }
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: step === 0 ? 1 : 0.4,
                                borderColor: step === 0 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255,255,255,0.05)'
                            }}
                            className="p-3 border rounded-xl bg-white/5 flex items-center gap-3"
                        >
                            <div className="text-indigo-400">{s.icon}</div>
                            <span className="text-[9px] font-mono text-white/70">{s.label}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.div animate={{ opacity: step >= 0 ? 1 : 0.1 }} className="text-white/20">
                    <ArrowRight size={24} className={step === 0 && isPlaying ? "animate-pulse" : ""} />
                </motion.div>

                {/* Staging & Transform Node */}
                <div className="flex flex-col items-center gap-8">
                    <div className={`relative w-48 h-48 rounded-[2.5rem] border-2 transition-all duration-700 flex flex-col items-center justify-center p-6
                        ${step === 1 || step === 2 ? 'border-indigo-400 bg-indigo-500/10 shadow-lg' : 'border-white/10 bg-white/5'}
                    `}>
                        <AnimatePresence mode="wait">
                            {step < 2 ? (
                                <motion.div key="staging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                                    <Layers className={step === 1 ? "text-indigo-400" : "text-white/20"} size={32} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Staging Area</span>
                                    {step === 1 && <Activity className="text-indigo-400 animate-pulse" size={12} />}
                                </motion.div>
                            ) : (
                                <motion.div key="transform" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2">
                                    <Cpu className="text-indigo-400 animate-spin-slow" size={32} />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Transformation</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <motion.div animate={{ opacity: step >= 2 ? 1 : 0.1 }} className="text-white/20">
                    <ArrowRight size={24} className={step === 2 && isPlaying ? "animate-pulse" : ""} />
                </motion.div>

                {/* Data Warehouse */}
                <div className={`w-56 h-56 border-2 rounded-[3rem] p-8 flex flex-col items-center justify-center transition-all duration-700
                    ${step === 3 ? 'border-emerald-400 bg-emerald-500/10 shadow-lg' : 'border-white/10 bg-white/5 grayscale'}
                `}>
                    <Database size={48} className={step === 3 ? "text-emerald-400" : "text-white/20"} />
                    <h4 className={`text-[11px] font-black uppercase tracking-widest mt-4 text-center ${step === 3 ? "text-white" : "text-white/30"}`}>Central Data Warehouse</h4>
                    {step >= 3 && <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} className="h-1 bg-emerald-500/30 rounded-full mt-4 overflow-hidden">
                        <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-1/2 bg-emerald-400" />
                    </motion.div>}
                </div>

                <motion.div animate={{ opacity: step >= 3 ? 1 : 0.1 }} className="text-white/20">
                    <ArrowRight size={24} className={step === 3 && isPlaying ? "animate-pulse" : ""} />
                </motion.div>

                {/* BI Layer */}
                <div className={`flex flex-col gap-3 p-4 rounded-3xl border transition-all
                    ${step === 4 ? 'border-amber-400 bg-amber-500/10' : 'border-white/5 opacity-30'}
                `}>
                    <BarChart3 className="text-amber-400 mb-2 mx-auto" size={24} />
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-[0.2em] text-center">BI Dashboard</span>
                </div>
            </div>

            {/* Step Detail Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-16 bg-black/60 px-10 py-6 rounded-[2rem] border border-white/10 backdrop-blur-3xl max-w-2xl text-center shadow-2xl"
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 border border-white/10">
                            {etlSteps[step].icon}
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">{etlSteps[step].title}</h4>
                    </div>
                    <p className="text-[12px] text-white/50 font-medium leading-relaxed max-w-md mx-auto">{etlSteps[step].desc}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const renderModeling = () => (
        <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
            <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center">

                {/* Fact Table (Center) */}
                <motion.div
                    animate={{
                        scale: step === 0 ? 1.1 : 1,
                        boxShadow: step === 0 ? "0 0 50px rgba(244, 63, 94, 0.3)" : "0 0 0px rgba(0,0,0,0)"
                    }}
                    className={`w-40 h-40 rounded-3xl border-2 flex flex-col items-center justify-center z-20 transition-all duration-700
                        ${step >= 0 ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 bg-white/5'}
                    `}
                >
                    <Zap size={40} className="text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-3 text-white">Fact Table</span>
                    <span className="text-[8px] font-mono text-rose-400/60 mt-1">Orders_Fact</span>
                </motion.div>

                {/* Dimension Tables (Orbiting) */}
                {[
                    { title: "Date Dim", icon: <Calendar size={20} />, pos: "top-0 left-1/4", color: "blue" },
                    { title: "Product Dim", icon: <Package size={20} />, pos: "top-0 right-1/4", color: "emerald" },
                    { title: "Store Dim", icon: <MapPin size={20} />, pos: "bottom-0 left-1/4", color: "amber" },
                    { title: "Customer Dim", icon: <Users size={20} />, pos: "bottom-0 right-1/4", color: "indigo" }
                ].map((dim, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: step >= 1 ? 1 : 0.1,
                            scale: step === 1 ? 1.1 : 1,
                            x: 0, y: 0
                        }}
                        className={`absolute ${dim.pos} w-32 h-32 rounded-2xl border-2 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl transition-all duration-700
                            ${step >= 1 ? `border-${dim.color}-500/40 shadow-lg` : 'border-white/5'}
                        `}
                    >
                        <div className={`text-${dim.color}-400 mb-2`}>{dim.icon}</div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{dim.title}</span>
                    </motion.div>
                ))}

                {/* Relationship Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <AnimatePresence>
                        {step >= 2 && [
                            { x1: "25%", y1: "20%", x2: "50%", y2: "50%" },
                            { x1: "75%", y1: "20%", x2: "50%", y2: "50%" },
                            { x1: "25%", y1: "80%", x2: "50%", y2: "50%" },
                            { x1: "75%", y1: "80%", x2: "50%", y2: "50%" }
                        ].map((line, i) => (
                            <motion.line
                                key={i}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        ))}
                    </AnimatePresence>
                </svg>

                {/* Analysis Flow (Step 3) */}
                {step === 3 && (
                    <div className="absolute inset-0 pointer-events-none z-30">
                        {[1, 2, 3, 4].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1.5, 0.5],
                                    x: i % 2 === 0 ? [100, 0] : [-100, 0],
                                    y: i < 3 ? [100, 0] : [-100, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-white shadow-lg"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-16 bg-white/[0.03] px-12 py-6 rounded-full border border-white/5 max-w-2xl text-center"
                >
                    <span className="text-[11px] text-white/50 font-medium tracking-wide leading-relaxed">
                        <span className="text-white font-black uppercase tracking-[0.2em] mr-3">{modelingSteps[step].title}:</span>
                        {modelingSteps[step].desc}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    const renderMart = () => (
        <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4">
            <div className="flex items-center justify-between w-full max-w-5xl gap-8">

                {/* Central DW */}
                <div className={`flex-1 max-w-xs h-72 border-2 rounded-[3rem] p-10 flex flex-col items-center justify-center relative transition-all duration-700
                    ${step === 0 ? 'border-indigo-400 bg-indigo-500/10 shadow-lg' : 'border-white/10 bg-white/5'}
                `}>
                    <Database size={64} className={step === 0 ? "text-indigo-400" : "text-white/20"} />
                    <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80 mt-6 text-center">Central Warehouse</h4>
                    <div className="absolute top-4 right-6 text-[8px] font-black text-indigo-500/40 uppercase tracking-widest">Single Source of Truth</div>
                    {step === 0 && isPlaying && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -bottom-10 h-2 px-4 py-1 bg-indigo-500/20 text-indigo-400 text-[8px] font-bold rounded-full">SYNCHRONIZING...</motion.div>}
                </div>

                {/* Filtering / Partitioning Node */}
                <div className="flex flex-col items-center justify-center gap-4">
                    <motion.div animate={{ rotate: step === 1 ? 360 : 0 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className={`w-24 h-24 rounded-full border-2 flex items-center justify-center
                        ${step === 1 ? 'border-amber-400 bg-amber-500/10 shadow-lg' : 'border-white/5'}
                    `}>
                        <Filter className={step === 1 ? "text-amber-400" : "text-white/10"} size={32} />
                    </motion.div>
                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Partitioning</span>
                </div>

                {/* Data Marts Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { title: "Sales Mart", color: "rose", icon: <TrendingUp size={20} /> },
                        { id: 2, title: "HR Mart", color: "blue", icon: <Users size={20} /> },
                        { title: "Finance Mart", color: "emerald", icon: <Wallet size={20} /> }
                    ].map((mart, i) => {
                        const isActive = step === 2;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: step >= 2 ? 1 : 0.1, x: 0 }}
                                className={`w-48 p-5 rounded-2xl border backdrop-blur-md flex items-center gap-4 transition-all
                                    ${isActive ? `border-${mart.color}-500/40 bg-${mart.color}-500/10 shadow-lg` : 'border-white/5 bg-white/5'}
                                `}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? `text-${mart.color}-400` : 'text-white/20'}`}>
                                    {mart.icon}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{mart.title}</h4>
                                    <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <motion.div animate={{ width: step >= 2 ? "100%" : "0%" }} className={`h-full bg-${mart.color}-500`} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex flex-col items-center justify-center gap-6">
                    <ArrowRight size={24} className={step === 2 ? "text-emerald-500" : "text-white/5"} />
                    <div className={`w-32 h-32 rounded-3xl border-2 flex flex-col items-center justify-center p-4 transition-all
                        ${step === 3 ? 'border-emerald-400 bg-emerald-500/10 shadow-lg' : 'border-white/5 opacity-20'}
                    `}>
                        <Users size={32} className={step === 3 ? "text-emerald-400" : ""} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center mt-3 text-white">Subject Specialists</span>
                    </div>
                </div>
            </div>

            {/* Detail */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-16 bg-white/[0.03] px-12 py-6 rounded-full border border-white/5 max-w-2xl text-center"
                >
                    <span className="text-[11px] text-white/50 font-medium tracking-wide leading-relaxed">
                        <span className="text-white font-black uppercase tracking-[0.2em] mr-3">{dataMartSteps[step].title}:</span>
                        {dataMartSteps[step].desc}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-lg selection:bg-indigo-500/30">
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-gradient-to-b from-white/[0.04] to-transparent">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
                        {isETL ? <Zap size={32} className="text-indigo-400 relative z-10" /> : <Layers size={32} className="text-indigo-400 relative z-10" />}
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1">Architectural Lab</h4>
                        <h2 className="text-3xl font-black text-white tracking-tightest uppercase italic leading-none">
                            {isArchitecture ? "DW Architecture" : isComparison ? "OLTP vs OLAP" : isModeling ? "Star / Snowflake Schema" : isDataMart ? "Data Mart" : "ETL Pipeline"} Visualizer
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 backdrop-blur-2xl">
                        <button
                            onClick={() => setView('simulation')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'simulation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                            Sync Simulation
                        </button>
                        <button
                            onClick={() => setView('logic')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'logic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                            Logic Pillars
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="relative flex flex-col min-h-[650px] bg-gradient-to-tr from-[#0a0f1a] to-transparent">
                <AnimatePresence mode="wait">
                    {view === 'simulation' ? (
                        <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                            <div className="flex-1">
                                {isArchitecture ? renderArchitecture() : (isComparison ? renderComparison() : (isModeling ? renderModeling() : (isDataMart ? renderMart() : renderETL())))}
                            </div>

                            {/* Controls */}
                            <div className="h-24 border-t border-white/5 bg-black/40 flex items-center justify-between px-10 backdrop-blur-2xl">
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                                        Sequence {step + 1} / {steps.length}
                                    </span>
                                    <div className="flex gap-1.5">
                                        {steps.map((_, i) => (
                                            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setStep(s => Math.max(0, s - 1))}
                                        disabled={step === 0}
                                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all hover:-translate-x-1"
                                    >
                                        <ArrowRight size={18} className="rotate-180" />
                                    </button>

                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPlaying ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'} shadow-2xl active:scale-95`}
                                    >
                                        {isPlaying ? "Abort Sync" : "Initiate Proto-Sync"}
                                        {isPlaying ? <Activity size={14} className="animate-pulse" /> : <Zap size={14} />}
                                    </button>

                                    <button
                                        onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                                        disabled={step === steps.length - 1}
                                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all hover:translate-x-1"
                                    >
                                        <ArrowRight size={18} />
                                    </button>

                                    <div className="w-px h-8 bg-white/5 mx-2" />

                                    <button onClick={reset} className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all">
                                        <RefreshCcw size={18} className={isPlaying ? "animate-spin-slow" : ""} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="logic" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex-1 p-16 overflow-y-auto custom-scrollbar min-h-[650px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {steps.map((s, i) => (
                                    <div key={i} className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] flex flex-col gap-6 group hover:border-indigo-500/20 transition-all hover:-translate-y-2">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                            {s.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase text-white mb-2">{s.title}</h3>
                                            <p className="text-[12px] text-white/50 font-medium leading-[1.8]">{s.desc}</p>
                                        </div>
                                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[9px] font-black text-white/20 uppercase">Module {i + 1}</span>
                                            <CheckCircle2 size={16} className="text-indigo-500/20 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DataWarehouseVisualizer;

