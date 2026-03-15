import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, User, ArrowRight, Package, Box, ArrowRightLeft, Spline, Zap, Play, RotateCcw, BoxSelect, Columns, Route } from 'lucide-react';

const UMLDiagramVisualizer = ({ type = 'use case' }) => {

    const normalizedType = type.toLowerCase().includes('use case') ? 'usecase'
        : type.toLowerCase().includes('sequence') ? 'sequence'
            : type.toLowerCase().includes('activity') ? 'activity'
                : type.toLowerCase().includes('class') ? 'class'
                    : type.toLowerCase().includes('package') ? 'package'
                        : 'usecase';

    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const getMaxSteps = (methodology) => {
        switch (methodology) {
            case 'usecase': return 4;
            case 'sequence': return 4;
            case 'activity': return 5;
            case 'class': return 4;
            case 'package': return 4;
            default: return 4;
        }
    };

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
            }, 2500);
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

    const configs = {
        usecase: {
            title: "Use Case Diagram",
            icon: <Network size={24} className="text-yellow-400" />,
            color: "yellow",
            desc: "Shows WHO interacts with the system and WHAT they can do.",
            steps: [
                "Step 1: Identify Actors (Users or External Systems)",
                "Step 2: Define System Boundary",
                "Step 3: Add Use Cases (Actions)",
                "Step 4: Connect constraints (<<include>> / <<extend>>)"
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
                    {/* System Boundary */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: step >= 1 ? 1 : 0, height: step >= 1 ? 320 : 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-sm border-2 border-yellow-500/30 rounded-3xl bg-white/[0.02] flex flex-col items-center py-8 relative mt-10"
                    >
                        <h4 className="absolute -top-3 left-6 px-2 bg-[#0a0a0c] text-[10px] font-black uppercase text-yellow-500 tracking-widest">Library System</h4>

                        <div className="flex flex-col gap-6 w-full px-12 mt-4">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: step >= 2 ? 1 : 0 }} className="p-3 rounded-full border border-yellow-400/50 bg-yellow-500/10 text-center text-[10px] text-yellow-100 uppercase font-bold w-full">Search Book</motion.div>

                            <div className="relative w-full">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: step >= 2 ? 1 : 0 }} className="p-3 rounded-full border border-yellow-400/50 bg-yellow-500/10 text-center text-[10px] text-yellow-100 uppercase font-bold w-full relative z-10">Borrow Book</motion.div>

                                {step >= 3 && (
                                    <>
                                        <motion.svg className="absolute top-1/2 left-full w-20 h-2 -translate-y-1/2 -z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <line x1="0" y1="4" x2="80" y2="4" stroke="rgba(234,179,8,0.5)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                                        </motion.svg>
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 left-[120%] -translate-y-1/2 p-3 rounded-full border border-blue-400/50 bg-blue-500/10 text-center text-[9px] text-blue-200 uppercase font-bold w-32 whitespace-nowrap">
                                            <span className="text-blue-400 text-[8px] block">&lt;&lt;include&gt;&gt;</span> Check Availability
                                        </motion.div>
                                    </>
                                )}
                            </div>

                            <motion.div initial={{ scale: 0 }} animate={{ scale: step >= 2 ? 1 : 0 }} className="p-3 rounded-full border border-yellow-400/50 bg-yellow-500/10 text-center text-[10px] text-yellow-100 uppercase font-bold w-full">Return Book</motion.div>
                        </div>
                    </motion.div>

                    {/* Actor */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: step >= 0 ? 1 : 0, x: step >= 0 ? 0 : -50 }}
                        className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/80 border border-white/20"><User size={24} /></div>
                        <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">Member</span>
                    </motion.div>

                    {/* Lines from Actor to Use Cases */}
                    {step >= 2 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="18%" y1="50%" x2="35%" y2="35%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="18%" y1="50%" x2="35%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="18%" y1="50%" x2="35%" y2="65%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                        </svg>
                    )}
                </div>
            )
        },
        sequence: {
            title: "Sequence Diagram",
            icon: <ArrowRightLeft size={24} className="text-blue-400" />,
            color: "blue",
            desc: "Shows the chronological conversation between actors and the system.",
            steps: [
                "Step 1: Define Lifelines (Participants)",
                "Step 2: Add Request Message (Solid Arrow)",
                "Step 3: Add Processing (Activation Bar)",
                "Step 4: Add Reply Message (Dashed Arrow)"
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
                    <div className="flex justify-between w-full max-w-xl h-[400px] relative">
                        {/* Lifelines */}
                        {['User', 'Frontend', 'Auth API'].map((entity, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: -20 }} animate={{ opacity: step >= 0 ? 1 : 0, y: 0 }} className="flex flex-col items-center relative h-full">
                                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase text-blue-300 z-10">{entity}</div>
                                <div className="w-0.5 h-full bg-blue-500/20 border-l border-dashed border-blue-500/40 mt-2" />

                                {/* Activation bars */}
                                {i === 1 && step >= 2 && <motion.div initial={{ height: 0 }} animate={{ height: 120 }} className="absolute top-[100px] w-3 bg-blue-400 border border-blue-300 rounded-sm shadow-[0_0_15px_rgba(96,165,250,0.5)] z-0" />}
                                {i === 2 && step >= 2 && <motion.div initial={{ height: 0 }} animate={{ height: 60 }} className="absolute top-[130px] w-3 bg-emerald-400 border border-emerald-300 rounded-sm shadow-[0_0_15px_rgba(52,211,153,0.5)] z-0" />}
                            </motion.div>
                        ))}

                        {/* Messages */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Msg 1 */}
                            {step >= 1 && (
                                <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} className="absolute top-[100px] left-0 h-0.5 bg-blue-400 overflow-visible origin-left">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-blue-200 font-mono">login(usr, pwd)</div>
                                    <div className="absolute -right-1 -top-1.5 w-0 h-0 border-l-8 border-l-blue-400 border-y-4 border-y-transparent" />
                                </motion.div>
                            )}
                            {/* Msg 2 */}
                            {step >= 2 && (
                                <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} className="absolute top-[130px] left-[50%] h-0.5 bg-emerald-400 overflow-visible origin-left">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-emerald-200 font-mono">validateToken()</div>
                                    <div className="absolute -right-1 -top-1.5 w-0 h-0 border-l-8 border-l-emerald-400 border-y-4 border-y-transparent" />
                                </motion.div>
                            )}
                            {/* Reply 1 */}
                            {step >= 3 && (
                                <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} className="absolute top-[190px] right-[0%] h-0 border-b-2 border-dashed border-emerald-400 overflow-visible origin-right relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-emerald-200 font-mono">return success</div>
                                    <div className="absolute -left-1 -top-1.5 w-0 h-0 border-r-8 border-r-emerald-400 border-y-4 border-y-transparent" />
                                </motion.div>
                            )}
                            {/* Reply 2 */}
                            {step >= 3 && (
                                <motion.div initial={{ width: 0 }} animate={{ width: "50%" }} className="absolute top-[220px] right-[50%] h-0 border-b-2 border-dashed border-blue-400 overflow-visible origin-right relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-blue-200 font-mono">showDashboard()</div>
                                    <div className="absolute -left-1 -top-1.5 w-0 h-0 border-r-8 border-r-blue-400 border-y-4 border-y-transparent" />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        activity: {
            title: "Activity Diagram",
            icon: <Route size={24} className="text-orange-400" />,
            color: "orange",
            desc: "Flowchart detailing the state execution of a process handling control flow.",
            steps: [
                "Step 1: Initial Node (Start)",
                "Step 2: Action Nodes (Verbs)",
                "Step 3: Decision Nodes (Branching)",
                "Step 4: Fork/Join (Parallel Processing)",
                "Step 5: Final Node (End)"
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
                    <div className="flex flex-col items-center gap-6 relative">
                        {/* Start */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: step >= 0 ? 1 : 0 }} className="w-6 h-6 bg-orange-500 rounded-full border-4 border-black ring-2 ring-orange-500 z-10" />

                        {/* Action 1 */}
                        {step >= 1 && (
                            <>
                                <div className="w-0.5 h-6 bg-white/20" />
                                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-[10px] font-black uppercase text-orange-200">Process Order</motion.div>
                            </>
                        )}

                        {/* Decision */}
                        {step >= 2 && (
                            <>
                                <div className="w-0.5 h-6 bg-white/20" />
                                <motion.div initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500/40 rotate-45 flex items-center justify-center relative my-2">
                                    <span className="absolute -rotate-45 text-[8px] font-black uppercase text-blue-200 mt-2">Valid?</span>
                                </motion.div>

                                <div className="absolute left-1/2 translate-x-8 top-[165px] h-0.5 w-24 bg-white/20">
                                    <span className="absolute -top-4 left-4 text-[8px] text-white/50">[No]</span>
                                </div>
                                <div className="absolute left-1/2 translate-x-32 top-[165px] w-0.5 h-[160px] bg-white/20" />
                            </>
                        )}

                        {/* Fork */}
                        {step >= 3 && (
                            <>
                                <div className="w-0.5 h-8 bg-white/20">
                                    <span className="absolute ml-2 text-[8px] text-white/50">[Yes]</span>
                                </div>
                                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-48 h-2 bg-white/40 rounded-full" />

                                <div className="flex gap-16 mt-4">
                                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[9px] font-black uppercase text-purple-200 text-center">Update<br />Stock</motion.div>
                                    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black uppercase text-emerald-200 text-center">Charge<br />Card</motion.div>
                                </div>

                                {/* Join */}
                                <div className="flex gap-[120px] mt-4 z-0">
                                    <div className="w-0.5 h-6 bg-white/20" />
                                    <div className="w-0.5 h-6 bg-white/20" />
                                </div>
                                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="w-48 h-2 bg-white/40 rounded-full mt-[-24px] z-10" />
                            </>
                        )}

                        {/* End */}
                        {step >= 4 && (
                            <>
                                <div className="w-0.5 h-6 bg-white/20" />
                                <div className="flex items-center gap-16">
                                    {/* Success End */}
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-black">
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full" />
                                    </motion.div>

                                    {/* Failure End from decision */}
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center bg-black absolute" style={{ left: '50%', transform: 'translateX(112px)', marginTop: '-8px' }}>
                                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )
        },
        class: {
            title: "Class Diagram",
            icon: <BoxSelect size={24} className="text-emerald-400" />,
            color: "emerald",
            desc: "Static structure showing classes, attributes, methods, and their relationships.",
            steps: [
                "Step 1: Class Definition (Nouns)",
                "Step 2: Attributes (State) & Methods (Behavior)",
                "Step 3: Associations (Lines connecting classes)",
                "Step 4: Cardinality / Multiplicity (1..*)"
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
                    <div className="w-full max-w-2xl flex justify-between gap-12 relative px-10">
                        {/* Class 1 */}
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: step >= 0 ? 1 : 0, scale: 1 }} className="w-64 border-2 border-emerald-500/30 rounded-xl overflow-hidden bg-black shadow-2xl z-10">
                            <div className="bg-emerald-500/20 p-3 text-center border-b border-emerald-500/30 font-black text-[12px] text-emerald-300">User</div>

                            {step >= 1 && (
                                <div className="p-3 border-b border-emerald-500/10 font-mono text-[9px] text-white/60 space-y-1">
                                    <div>- id : int</div>
                                    <div>- email : string</div>
                                    <div>- passwordHash : string</div>
                                </div>
                            )}

                            {step >= 1 && (
                                <div className="p-3 font-mono text-[9px] text-emerald-200/80 space-y-1 bg-emerald-500/5">
                                    <div>+ login() : boolean</div>
                                    <div>+ updateProfile() : void</div>
                                </div>
                            )}
                        </motion.div>

                        {/* Class 2 */}
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: step >= 0 ? 1 : 0, scale: 1 }} className="w-64 border-2 border-emerald-500/30 rounded-xl overflow-hidden bg-black shadow-2xl z-10">
                            <div className="bg-emerald-500/20 p-3 text-center border-b border-emerald-500/30 font-black text-[12px] text-emerald-300">Order</div>

                            {step >= 1 && (
                                <div className="p-3 border-b border-emerald-500/10 font-mono text-[9px] text-white/60 space-y-1">
                                    <div>- orderId : UUID</div>
                                    <div>- totalAmount : decimal</div>
                                    <div>- status : OrderStatus</div>
                                </div>
                            )}

                            {step >= 1 && (
                                <div className="p-3 font-mono text-[9px] text-emerald-200/80 space-y-1 bg-emerald-500/5">
                                    <div>+ processPayment() : void</div>
                                    <div>+ cancelOrder() : void</div>
                                </div>
                            )}
                        </motion.div>

                        {/* Connection */}
                        {step >= 2 && (
                            <div className="absolute top-1/2 left-[275px] right-[275px] h-0.5 bg-white/30 -translate-y-1/2 z-0" />
                        )}

                        {/* Cardinality */}
                        {step >= 3 && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 left-[285px] -translate-y-6 text-[10px] font-black text-emerald-400 bg-black px-1">1</motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 right-[285px] -translate-y-6 text-[10px] font-black text-emerald-400 bg-black px-1">0..*</motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-[8px] font-bold text-white/40 uppercase tracking-widest bg-black px-2">places</motion.div>
                            </>
                        )}
                    </div>
                </div>
            )
        },
        package: {
            title: "Package Diagram",
            icon: <Package size={24} className="text-purple-400" />,
            color: "purple",
            desc: "Organizes elements into logical groupings, showing dependencies between modules.",
            steps: [
                "Step 1: Create Packages (Folders)",
                "Step 2: Place Classes Inside",
                "Step 3: Define Dependencies (Dashed Arrows)",
                "Step 4: Ensure Layering (Top-to-Bottom Flow)"
            ],
            render: () => (
                <div className="flex flex-col items-center justify-center h-full w-full py-10 px-4 relative">
                    <div className="flex flex-col items-center gap-12 w-full max-w-xl relative">
                        {/* Presentation Layer */}
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: step >= 0 ? 1 : 0, y: 0 }} className="w-full relative">
                            {/* Folder Tab */}
                            <div className="w-24 h-6 bg-purple-500/20 border-t border-l border-r border-purple-500/30 rounded-t-lg -mb-[1px] relative z-20 flex items-center px-2">
                                <span className="text-[8px] font-black text-purple-300 uppercase">UI Layer</span>
                            </div>
                            <div className="w-full p-6 border-2 border-purple-500/30 bg-purple-500/5 rounded-tr-xl rounded-b-xl relative z-10 flex gap-4 justify-center">
                                {step >= 1 && (
                                    <>
                                        <div className="px-4 py-2 bg-black border border-white/10 rounded text-[9px] text-white/70">Controllers</div>
                                        <div className="px-4 py-2 bg-black border border-white/10 rounded text-[9px] text-white/70">Views</div>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Business Logic Layer */}
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: step >= 0 ? 1 : 0, y: 0 }} className="w-3/4 relative">
                            <div className="w-24 h-6 bg-blue-500/20 border-t border-l border-r border-blue-500/30 rounded-t-lg -mb-[1px] relative z-20 flex items-center px-2">
                                <span className="text-[8px] font-black text-blue-300 uppercase">Domain</span>
                            </div>
                            <div className="w-full p-6 border-2 border-blue-500/30 bg-blue-500/5 rounded-tr-xl rounded-b-xl relative z-10 flex gap-4 justify-center">
                                {step >= 1 && (
                                    <>
                                        <div className="px-4 py-2 bg-black border border-white/10 rounded text-[9px] text-white/70">Services</div>
                                        <div className="px-4 py-2 bg-black border border-white/10 rounded text-[9px] text-white/70">Models</div>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Data Layer */}
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: step >= 0 ? 1 : 0, y: 0 }} className="w-1/2 relative">
                            <div className="w-24 h-6 bg-emerald-500/20 border-t border-l border-r border-emerald-500/30 rounded-t-lg -mb-[1px] relative z-20 flex items-center px-2">
                                <span className="text-[8px] font-black text-emerald-300 uppercase">Data</span>
                            </div>
                            <div className="w-full p-6 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-tr-xl rounded-b-xl relative z-10 flex gap-4 justify-center">
                                {step >= 1 && (
                                    <>
                                        <div className="px-4 py-2 bg-black border border-white/10 rounded text-[9px] text-white/70">Repositories</div>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Dependency Arrows */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                            {step >= 2 && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 48 }} className="absolute left-1/2 top-[105px] border-l-2 border-dashed border-white/30 -translate-x-1/2 origin-top flex flex-col items-center justify-end">
                                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-white/30 absolute -bottom-2" />
                                </motion.div>
                            )}
                            {step >= 2 && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 48 }} className="absolute left-1/2 top-[240px] border-l-2 border-dashed border-white/30 -translate-x-1/2 origin-top flex flex-col items-center justify-end">
                                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-8 border-t-white/30 absolute -bottom-2" />
                                </motion.div>
                            )}

                            {/* Layer validation message */}
                            {step >= 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute right-0 top-1/2 -translate-y-1/2 w-32 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                                    <span className="text-[8px] font-black uppercase text-red-400 tracking-widest">Rule:</span><br />
                                    <span className="text-[9px] text-white/60">Arrows must point down. Layers only know what's below them.</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }
    };

    const config = configs[normalizedType] || configs.usecase;

    return (
        <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-b from-white/[0.03] to-transparent">
                <div className="flex items-center gap-5">
                    <div 
                        className={`w-12 h-12 bg-${config.color}-500/20 rounded-2xl flex items-center justify-center border border-${config.color}-500/20 shadow-lg`}
                    >
                        {config.icon}
                    </div>
                    <div>
                        <h4 className={`text-[9px] font-black uppercase tracking-[0.4em] text-${config.color}-500 mb-0.5`}>UML Blueprint Lab</h4>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{config.title} Builder</h2>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="text-[9px] font-black uppercase text-white/30 tracking-widest px-4">Interactive Construction</div>
                    <span className="text-[10px] text-white/50 px-4">{config.desc}</span>
                </div>
            </div >

            <div className="relative min-h-[500px] flex flex-col bg-gradient-to-br from-white/[0.01] to-transparent">
                {/* Visual Render */}
                <div className="flex-1 overflow-hidden relative">
                    {config.render()}
                </div>

                {/* Step Descriptions overlay */}
                <div className="absolute top-6 left-6 max-w-sm">
                    {config.steps.map((st, i) => (
                        <motion.div key={i} animate={{ opacity: i <= step ? 1 : 0.2, x: i === step ? 10 : 0 }} className="flex items-center gap-2 mb-2">
                            <div 
                                className={`w-1.5 h-1.5 rounded-full ${i === step ? `bg-${config.color}-400` : 'bg-white/20'}`} 
                                style={{ 
                                    boxShadow: i === step 
                                        ? `0 0 10px rgba(var(--${config.color}-400), 0.8)` 
                                        : 'none' 
                                }}
                            />
                            <span className={`text-[10px] uppercase font-black tracking-widest ${i === step ? 'text-white' : 'text-white/40'}`}>{st}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Controls Footer */}
                <div className="h-20 border-t border-white/5 bg-black/40 flex items-center justify-between px-8 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Stage {step + 1} / {getMaxSteps(normalizedType)}
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
                            {isPlaying ? "Pause" : <><Play size={12} /> Auto Build</>}
                        </button>

                        <button onClick={nextStep} disabled={step === getMaxSteps(normalizedType) - 1} className="p-2 rounded-lg bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors">
                            <ArrowRight size={16} />
                        </button>

                        <button onClick={reset} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 ml-4 transition-colors">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default UMLDiagramVisualizer;
