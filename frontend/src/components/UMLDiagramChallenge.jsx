import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Network, User, Box, ArrowRight, ArrowRightLeft, Square, Eye, RefreshCcw, CheckCircle2, Zap, Circle, Diamond, CircleDot, Folder, ArrowDown, Play, ChevronRight } from 'lucide-react';

const UMLDiagramChallenge = ({ type = 'use case' }) => {

    const normalizedType = type.toLowerCase().includes('use case') ? 'usecase'
        : type.toLowerCase().includes('sequence') ? 'sequence'
            : type.toLowerCase().includes('activity') ? 'activity'
                : type.toLowerCase().includes('class') ? 'class'
                    : type.toLowerCase().includes('package') ? 'package'
                        : 'usecase';

    const canvasRef = useRef(null);
    const [nodes, setNodes] = useState([]);
    const [showSolution, setShowSolution] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const toolboxes = {
        usecase: [
            { type: 'actor', label: 'Actor', icon: <User size={24} />, colorClass: 'border-yellow-500/50 text-yellow-400' },
            { type: 'usecase', label: 'Use Case', icon: <Network size={24} />, colorClass: 'border-blue-500/50 text-blue-400' },
            { type: 'boundary', label: 'Boundary', icon: <Square size={24} />, colorClass: 'border-white/20 text-white/50' },
            { type: 'arrow', label: 'Arrow', icon: <ArrowRight size={24} />, colorClass: 'border-white/20 text-white/50' }
        ],
        sequence: [
            { type: 'lifeline', label: 'Lifeline', icon: <ArrowRightLeft size={24} />, colorClass: 'border-blue-500/50 text-blue-400' },
            { type: 'message', label: 'Message', icon: <ArrowRight size={24} />, colorClass: 'border-emerald-500/50 text-emerald-400' },
            { type: 'activation', label: 'Bar', icon: <Box size={24} />, colorClass: 'border-purple-500/50 text-purple-400' }
        ],
        activity: [
            { type: 'start', label: 'Start / End', icon: <Circle size={24} className="fill-yellow-500/50" />, colorClass: 'border-yellow-500/50 text-yellow-400' },
            { type: 'activity', label: 'Activity', icon: <Square size={24} className="rounded-xl" />, colorClass: 'border-blue-500/50 text-blue-400' },
            { type: 'decision', label: 'Decision', icon: <Diamond size={24} />, colorClass: 'border-purple-500/50 text-purple-400' },
            { type: 'arrow', label: 'Flow', icon: <ArrowDown size={24} />, colorClass: 'border-white/20 text-white/50' }
        ],
        class: [
            { type: 'class', label: 'Class Box', icon: <Square size={24} />, colorClass: 'border-emerald-500/50 text-emerald-400' },
            { type: 'line', label: 'Relation', icon: <ArrowRightLeft size={24} />, colorClass: 'border-white/20 text-white/50' }
        ],
        package: [
            { type: 'package', label: 'Package', icon: <Folder size={24} />, colorClass: 'border-blue-500/50 text-blue-400' },
            { type: 'arrow', label: 'Dependency', icon: <ArrowDown size={24} />, colorClass: 'border-white/20 text-white/50' }
        ]
    };

    const scenarios = {
        usecase: [
            {
                title: "Library Book Checkout",
                context: "Draw a Use Case diagram. Include a 'Member' Actor who can 'Search Book' and 'Borrow Book'. 'Borrow Book' should <<include>> 'Check Availability'.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                        <div className="absolute top-8 left-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <User size={32} className="text-yellow-400 mx-auto" />
                            <span className="text-[10px] uppercase font-black text-yellow-300 mt-2 block">Member</span>
                        </div>
                        <div className="w-64 h-64 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center gap-6 relative">
                            <span className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-white/50">Library System</span>
                            <div className="p-3 border border-blue-500/50 bg-blue-500/10 rounded-full text-[10px] font-black uppercase text-blue-300">Search Book</div>
                            <div className="p-3 border border-blue-500/50 bg-blue-500/10 rounded-full text-[10px] font-black uppercase text-blue-300">Borrow Book</div>
                            <div className="absolute -right-32 top-1/2 p-3 border border-emerald-500/50 bg-emerald-500/10 rounded-full text-[10px] font-black uppercase text-emerald-300 whitespace-nowrap">Check Availability</div>
                            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible', zIndex: -1 }}>
                                <line x1="-80" y1="50" x2="20" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <line x1="-80" y1="50" x2="20" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <line x1="200" y1="160" x2="300" y2="130" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeDasharray="4 4" />
                            </svg>
                            <span className="absolute right-[-40px] top-[120px] text-[8px] text-yellow-400">&lt;&lt;include&gt;&gt;</span>
                        </div>
                    </div>
                )
            },
            {
                title: "ATM Withdrawal System",
                context: "Draw an ATM Use Case. Actor 'Customer' can 'Withdraw Cash' and 'Check Balance'. Additionally, 'Admin' can 'Refill Cash'.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                        <div className="absolute top-8 left-8 flex flex-col items-center">
                            <User size={32} className="text-yellow-400 mx-auto" />
                            <span className="text-[10px] uppercase font-black text-yellow-300 mt-2 block">Customer</span>
                        </div>
                        <div className="absolute bottom-8 right-8 flex flex-col items-center">
                            <User size={32} className="text-yellow-400 mx-auto" />
                            <span className="text-[10px] uppercase font-black text-yellow-300 mt-2 block">Admin</span>
                        </div>
                        <div className="w-64 h-64 border-2 border-white/20 rounded-2xl flex flex-col items-center justify-center gap-6 relative">
                            <span className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-white/50">ATM System</span>
                            <div className="p-3 border border-blue-500/50 bg-blue-500/10 rounded-full text-[10px] font-black uppercase text-blue-300">Withdraw Cash</div>
                            <div className="p-3 border border-blue-500/50 bg-blue-500/10 rounded-full text-[10px] font-black uppercase text-blue-300">Check Balance</div>
                            <div className="p-3 border border-purple-500/50 bg-purple-500/10 rounded-full text-[10px] font-black uppercase text-purple-300">Refill Cash</div>
                            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible', zIndex: -1 }}>
                                <line x1="-80" y1="-80" x2="20" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <line x1="-80" y1="-80" x2="20" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <line x1="280" y1="280" x2="160" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                )
            }
        ],
        sequence: [
            {
                title: "User Login Flow",
                context: "Draw a Sequence Diagram. Include 3 lifelines: 'User', 'Frontend', 'Auth Service'. Flow: login() -> validate() -> return success Token.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8 px-20">
                        <div className="flex justify-between w-full relative h-[300px]">
                            {['User', 'Frontend', 'Auth Server'].map(n => (
                                <div key={n} className="flex flex-col items-center h-full">
                                    <div className="px-4 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase rounded-lg z-10">{n}</div>
                                    <div className="w-0.5 h-full bg-blue-500/20 border-l border-dashed border-blue-500/40 mt-2" />
                                </div>
                            ))}
                            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible', zIndex: 5 }}>
                                <line x1="10%" y1="100" x2="50%" y2="100" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
                                <text x="30%" y="90" fill="#93c5fd" fontSize="10" textAnchor="middle" fontFamily="monospace">login()</text>
                                <line x1="50%" y1="150" x2="90%" y2="150" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
                                <text x="70%" y="140" fill="#93c5fd" fontSize="10" textAnchor="middle" fontFamily="monospace">validate()</text>
                                <line x1="90%" y1="200" x2="50%" y2="200" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                                <text x="70%" y="190" fill="#6ee7b7" fontSize="10" textAnchor="middle" fontFamily="monospace">Token</text>
                            </svg>
                        </div>
                    </div>
                )
            }
        ],
        activity: [
            {
                title: "Online Checkout Process",
                context: "Draw an Activity diagram. Flow: Start -> Enter Address -> [Decision: Valid?] -> Create Order -> End.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/50 border-2 border-yellow-400"></div>
                            <div className="w-1 h-6 bg-white/20"></div>
                            <div className="px-6 py-2 border border-blue-500/50 bg-blue-500/10 rounded-xl text-[10px] font-black uppercase text-blue-300">Enter Address</div>
                            <div className="w-1 h-6 bg-white/20"></div>
                            <div className="px-6 py-2 border border-purple-500/50 bg-purple-500/10 rounded-xl text-[10px] font-black uppercase text-purple-300 rotate-45 w-12 h-12 flex items-center justify-center"><span className="-rotate-45 block">Valid?</span></div>
                            <div className="w-1 h-6 bg-white/20"></div>
                            <div className="px-6 py-2 border border-emerald-500/50 bg-emerald-500/10 rounded-xl text-[10px] font-black uppercase text-emerald-300">Create Order</div>
                            <div className="w-1 h-6 bg-white/20"></div>
                            <div className="w-8 h-8 rounded-full bg-transparent border-4 border-yellow-400 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-yellow-400"></div></div>
                        </div>
                    </div>
                )
            }
        ],
        class: [
            {
                title: "E-Commerce Entities",
                context: "Draw a Class Diagram connecting a 'Customer' to an 'Order'. Ensure 'Customer' has a 1 to 0..* cardinality to 'Order'.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                        <div className="flex justify-center gap-32 items-center w-full relative">
                            <div className="w-48 border border-emerald-500/30 rounded-lg overflow-hidden bg-black z-10">
                                <div className="bg-emerald-500/20 text-emerald-300 font-black text-[10px] text-center py-2 border-b border-emerald-500/30">Customer</div>
                                <div className="p-2 font-mono text-[9px] text-white/50">- id: int<br />- name: str</div>
                                <div className="p-2 border-t border-white/5 font-mono text-[9px] text-white/50">+ placeOrder()</div>
                            </div>
                            <div className="w-48 border border-emerald-500/30 rounded-lg overflow-hidden bg-black z-10">
                                <div className="bg-emerald-500/20 text-emerald-300 font-black text-[10px] text-center py-2 border-b border-emerald-500/30">Order</div>
                                <div className="p-2 font-mono text-[9px] text-white/50">- orderId: UUID<br />- total: decimal</div>
                                <div className="p-2 border-t border-white/5 font-mono text-[9px] text-white/50">+ process()</div>
                            </div>
                            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                <line x1="30%" y1="50%" x2="70%" y2="50%" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                <text x="35%" y="45%" fill="#34d399" fontSize="10" fontWeight="bold">1</text>
                                <text x="65%" y="45%" fill="#34d399" fontSize="10" fontWeight="bold">0..*</text>
                            </svg>
                        </div>
                    </div>
                )
            }
        ],
        package: [
            {
                title: "Layered Architecture",
                context: "Draw a Package diagram with 'Presentation', 'Business Logic', and 'Data Access'. Draw dependencies pointing downwards.",
                solution: (
                    <div className="w-full h-full flex flex-col items-center justify-center relative p-8 gap-12">
                        <div className="w-48 h-24 border-2 border-blue-500/30 bg-blue-500/10 rounded-lg flex items-center justify-center relative z-10">
                            <span className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-blue-300">Presentation</span>
                        </div>
                        <div className="w-48 h-24 border-2 border-purple-500/30 bg-purple-500/10 rounded-lg flex items-center justify-center relative z-10">
                            <span className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-purple-300">Business Logic</span>
                        </div>
                        <div className="w-48 h-24 border-2 border-emerald-500/30 bg-emerald-500/10 rounded-lg flex items-center justify-center relative z-10">
                            <span className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-emerald-300">Data Access</span>
                        </div>
                        <svg className="absolute inset-0 w-full h-full z-0" style={{ overflow: 'visible' }}>
                            <line x1="50%" y1="35%" x2="50%" y2="45%" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                            <line x1="50%" y1="55%" x2="50%" y2="65%" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                        </svg>
                    </div>
                )
            }
        ]
    };

    if (!scenarios[normalizedType]) {
        scenarios[normalizedType] = scenarios.usecase;
    }

    const currentExercises = scenarios[normalizedType];
    const challenge = currentExercises[currentIndex];
    const toolbox = toolboxes[normalizedType];

    const addNodeToCanvas = (type) => {
        const offset = (nodes.length * 20) % 200;
        const newNode = {
            id: `node-${nodes.length}-${type}`,
            type,
            x: 50 + offset,
            y: 50 + offset
        };
        setNodes(prev => [...prev, newNode]);
    };

    const clearCanvas = () => {
        setNodes([]);
        setShowSolution(false);
    };

    const nextExercise = () => {
        setNodes([]);
        setShowSolution(false);
        setCurrentIndex(prev => (prev + 1) % currentExercises.length);
    };

    const renderNode = (node) => {
        switch (node.type) {
            case 'actor':
                return (
                    <div className="flex flex-col items-center">
                        <User size={32} className="text-yellow-400" />
                        <input type="text" defaultValue="Actor" className="bg-transparent text-[9px] font-black uppercase text-yellow-500 text-center w-20 outline-none border-b border-transparent focus:border-yellow-500/50 mt-1 pointer-events-auto" />
                    </div>
                );
            case 'usecase':
            case 'activity':
                return (
                    <div className="px-6 py-3 border border-blue-500/50 bg-blue-500/10 rounded-full flex items-center justify-center min-w-[100px]">
                        <input type="text" defaultValue="Action" className="bg-transparent text-[10px] font-black uppercase text-blue-300 text-center w-full outline-none pointer-events-auto" />
                    </div>
                );
            case 'boundary':
                return (
                    <div className="w-64 h-64 border-2 border-dashed border-white/20 rounded-xl relative pointer-events-none">
                        <input type="text" defaultValue="System" className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-white/50 w-24 outline-none pointer-events-auto" />
                    </div>
                );
            case 'class':
                return (
                    <div className="w-40 border border-emerald-500/50 rounded-lg overflow-hidden bg-black shadow-xl">
                        <input type="text" defaultValue="ClassName" className="w-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] text-center py-2 outline-none pointer-events-auto" />
                        <textarea defaultValue="- prop: type" className="w-full h-16 bg-transparent text-[9px] font-mono text-white/50 p-2 outline-none resize-none pointer-events-auto" />
                    </div>
                );
            case 'package':
                return (
                    <div className="w-48 h-32 border-2 border-blue-500/30 bg-blue-500/10 rounded-lg flex items-start justify-start relative">
                        <input type="text" defaultValue="Package" className="absolute -top-3 left-4 bg-[#0a0a0c] px-2 text-[10px] font-black uppercase text-blue-300 outline-none pointer-events-auto w-24" />
                    </div>
                );
            case 'lifeline':
                return (
                    <div className="flex flex-col items-center h-64">
                        <input type="text" defaultValue="Participant" className="px-4 py-2 border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase rounded-lg outline-none w-28 text-center pointer-events-auto" />
                        <div className="w-0.5 flex-1 bg-blue-500/20 border-l border-dashed border-blue-500/40 mt-2" />
                    </div>
                );
            case 'start':
                return <div className="w-8 h-8 rounded-full bg-yellow-500/50 border-2 border-yellow-400"></div>;
            case 'end':
                return <div className="w-8 h-8 rounded-full bg-transparent border-4 border-yellow-400 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-yellow-400"></div></div>;
            case 'decision':
                return <div className="w-12 h-12 border-2 border-purple-500/50 bg-purple-500/10 rotate-45 flex items-center justify-center"><input type="text" defaultValue="?" className="w-8 text-center bg-transparent -rotate-45 text-[10px] text-purple-300 outline-none pointer-events-auto" /></div>;
            case 'arrow':
            case 'line':
            case 'message':
                return (
                    <div className="w-32 h-12 flex flex-col items-center justify-center relative group">
                        <input type="text" defaultValue="action()" className="bg-transparent text-[9px] text-white/50 text-center w-full outline-none mb-1 pointer-events-auto" />
                        <div className="w-full h-0.5 bg-white/30 relative">
                            {node.type !== 'line' && <div className="absolute right-0 top-1/2 -translate-y-1/2 border-l-[6px] border-l-white/30 border-y-[4px] border-y-transparent w-0 h-0"></div>}
                        </div>
                    </div>
                );
            case 'activation':
                return <div className="w-3 h-16 bg-purple-500 border border-purple-400 rounded-sm"></div>;
            default:
                return <div className="p-2 border bg-white/10 rounded text-[9px]">Unknown</div>;
        }
    };

    if (!isStarted) {
        return (
            <section className="mt-16 bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center py-20 px-8 text-center shadow-lg">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/30 mb-8 shadow-lg">
                    <Zap size={40} className="text-indigo-400" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Practical Challenge</h2>
                <p className="text-white/50 max-w-lg mb-10 leading-relaxed">
                    Test your understanding of {type.toUpperCase()} diagrams. You will be given scenarios and an interactive toolbox to build the correct architecture.
                </p>
                <button
                    onClick={() => setIsStarted(true)}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] shadow-lg transition-all flex items-center gap-3"
                >
                    <Play size={18} />
                    Start Practical Exercises
                </button>
            </section>
        );
    }

    return (
        <section className="mt-16 bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-lg">
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg">
                            <Zap size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">
                                Exercise {currentIndex + 1} of {currentExercises.length}
                            </h3>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{challenge.title}</h2>
                        </div>
                    </div>
                    {currentExercises.length > 1 && (
                        <button
                            onClick={nextExercise}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center gap-2"
                        >
                            Next Exercise <ChevronRight size={14} />
                        </button>
                    )}
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[12px] text-indigo-100/70 font-medium leading-relaxed">
                        {challenge.context}
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[500px]">
                <div className="w-full lg:w-64 border-r border-white/5 bg-white/[0.01] p-6 flex flex-col gap-6 z-20">
                    <div>
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-4 pb-2 border-b border-white/5">Toolkit</h4>
                        <p className="text-[10px] text-white/30 mb-4 italic">Click to add shapes.</p>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            {toolbox.map((tool, i) => (
                                <button
                                    key={i}
                                    onClick={() => addNodeToCanvas(tool.type)}
                                    className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center gap-2 bg-[#0a0a0c] hover:bg-white/5 transition-all shadow-lg ${tool.colorClass}`}
                                >
                                    {tool.icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{tool.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                        <button
                            onClick={clearCanvas}
                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={14} /> Clear Canvas
                        </button>
                        <button
                            onClick={() => setShowSolution(!showSolution)}
                            className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                ${showSolution ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg'}
                            `}
                        >
                            {showSolution ? <><Eye size={14} /> Hide Solution</> : <><CheckCircle2 size={14} /> Show Solution</>}
                        </button>
                    </div>
                </div>

                <div
                    ref={canvasRef}
                    className="flex-1 relative bg-[#0a0a0c] overflow-hidden"
                    style={{
                        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {showSolution ? (
                            <motion.div
                                key="solution"
                                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                                animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 z-50 flex flex-col pt-12"
                            >
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-300 z-10 shadow-lg">
                                    Solution Reference
                                </div>
                                {challenge.solution}
                            </motion.div>
                        ) : (
                            <motion.div key="canvas" className="absolute inset-0">
                                {nodes.map(node => (
                                    <motion.div
                                        key={node.id}
                                        drag
                                        dragMomentum={false}
                                        initial={{ x: node.x, y: node.y }}
                                        style={{ position: 'absolute' }}
                                        className="cursor-grab active:cursor-grabbing z-10 hover:ring-2 ring-white/10 group rounded-xl p-1"
                                    >
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-auto border border-red-500/50" onClick={(e) => { e.stopPropagation(); setNodes(prev => prev.filter(n => n.id !== node.id)) }}>×</div>
                                        {renderNode(node)}
                                    </motion.div>
                                ))}
                                {nodes.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/10 pointer-events-none">
                                        Canvas is empty. Click tools to add shapes.
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default UMLDiagramChallenge;

