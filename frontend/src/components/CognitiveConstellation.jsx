import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import io from "socket.io-client";
import { Sparkles, Star, Zap, Target, Binary, Cpu, Link as LinkIcon } from "lucide-react";

/**
 * COGNITIVE CONSTELLATION
 * A high-IQ 3D-feeling visualization of the scholar's knowledge graph.
 * Mastery scores > 70 translate into "Glowing Stars".
 * Connections represent course dependencies.
 */
const CognitiveConstellation = () => {
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [career, setCareer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const res = await api.get("/dashboard/knowledge-map");
                setNodes(res.data.map);
                setCareer(res.data.career);
            } catch (err) {
                console.error("Constellation sync failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMap();

        // Listen for real-time updates
        const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001");
        // Get current user to join room (we can fetch it from local storage or better pass it as prop)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            socket.emit("join_room", user.id);
        }

        socket.on("KNOWLEDGE_MAP_UPDATE", (data) => {
            console.log("[CONSTELLATION] Real-time neural sync triggered", data);
            setLastSync(Date.now());
            fetchMap();
        });

        return () => socket.disconnect();
    }, []);

    // Generate structured roadmap positions (Strict Column Stacking like roadmap.sh)
    const processedNodes = useMemo(() => {
        const mapped = [];
        const criticalPath = career?.criticalPath || [];

        // 1. Group nodes by Course
        const courseMap = {};
        nodes.forEach(node => {
            if (!courseMap[node.course_id]) {
                courseMap[node.course_id] = {
                    id: node.course_id,
                    name: node.course_name,
                    topics: [],
                    isCritical: criticalPath.some(c => node.course_name.toLowerCase().includes(c.toLowerCase())),
                    criticalIndex: criticalPath.findIndex(c => node.course_name.toLowerCase().includes(c.toLowerCase()))
                };
            }
            courseMap[node.course_id].topics.push(node);
        });

        const courses = Object.values(courseMap).sort((a, b) => {
            if (a.isCritical && b.isCritical) return a.criticalIndex - b.criticalIndex;
            if (a.isCritical) return -1;
            if (b.isCritical) return 1;
            return a.id - b.id;
        });

        // 2. Distribute Courses into Columns
        const columns = { 1: [], 2: [], 3: [] };
        courses.forEach(course => {
            let col = 1;
            if (course.isCritical) {
                if (course.criticalIndex >= 2) col = 2;
                if (course.criticalIndex >= 4) col = 3;
            } else {
                col = (course.id % 2) + 1;
            }
            columns[col].push(course);
        });

        // 3. Calculate Final Positions
        [1, 2, 3].forEach(col => {
            const colX = -350 + (col - 1) * 350;
            let currentY = -200; // Start near the top

            columns[col].forEach((course, courseIdx) => {
                // Add Course Header space if needed or just space between courses
                currentY += 20;

                course.topics.forEach((topic, topicIdx) => {
                    mapped.push({
                        ...topic,
                        x: colX + (course.isCritical ? 0 : 40),
                        y: currentY,
                        isCritical: course.isCritical
                    });
                    currentY += 45; // Fixed height for each block
                });

                currentY += 30; // Margin between courses
            });
        });

        // Add Future Horizon in Col 3
        if (career?.futureNodes) {
            let futureY = 150;
            career.futureNodes.forEach((milestone, i) => {
                mapped.push({
                    topic_id: `future-${i}`,
                    topic_name: milestone,
                    course_name: "Certifications / CTFs",
                    isFuture: true,
                    x: 350,
                    y: futureY,
                    col: 3
                });
                futureY += 60;
            });
        }

        // 4. Special logic for Concentration Areas (First 3 courses)
        mapped.forEach((n, idx) => {
            if (n.isCritical && (n.course_name.includes("Linux") || n.course_name.includes("Networking") || n.course_name.includes("Operating Systems"))) {
                n.isConcentration = true;
            }
        });

        return mapped;
    }, [nodes, career]);

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Sparkles className="animate-spin text-indigo-400" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Scanning Synapses...</p>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-[600px] bg-[#fdfdfd] rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm group/canvas">
            {/* Clean Light Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />

            {/* The Knowledge Map (With Panning Container) */}
            <div className="relative z-10 w-full h-full p-10 overflow-auto custom-scrollbar">
                <div className="relative min-w-[1200px] min-h-[800px] overflow-visible mx-auto">

                    {/* Constellation Lines (Clean blue/grey paths) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        {/* Phase Markers (Subtle Vertical Dividers) */}
                        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 5" />
                        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 5" />

                        {/* Connection from Genesis Point to First Node */}
                        {(() => {
                            const firstNode = processedNodes.sort((a, b) => a.x - b.x)[0];
                            if (!firstNode) return null;
                            return (
                                <motion.path
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.2 }}
                                    d={`M 5% 50% L calc(50% + ${firstNode.x}px) calc(50% + ${firstNode.y}px)`}
                                    stroke="#64748b"
                                    strokeWidth="1"
                                    fill="none"
                                    strokeDasharray="4 4"
                                />
                            );
                        })()}

                        {/* Roadmap Mainline Beam (Stepped path like the reference image) */}
                        {(() => {
                            const criticalNodes = processedNodes.filter(n => n.isCritical || n.isFuture).sort((a, b) => a.x - b.x || a.y - b.y);
                            return criticalNodes.map((node, i) => {
                                const next = criticalNodes[i + 1];
                                if (!next) return null;
                                return (
                                    <g key={`roadmap-path-${i}`}>
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.8 }}
                                            d={`M calc(50% + ${node.x}px) calc(50% + ${node.y}px) 
                                                L calc(50% + ${next.x}px) calc(50% + ${node.y}px) 
                                                L calc(50% + ${next.x}px) calc(50% + ${next.y}px)`}
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </g>
                                );
                            });
                        })()}
                    </svg>

                    {/* Neural Center (Identity) */}
                    {/* Genesis Point (Origin Circle) */}
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center z-20" style={{ left: '5%' }}>
                        <div className="absolute -bottom-8 whitespace-nowrap text-[8px] font-bold text-slate-400 uppercase tracking-widest">Start</div>
                        <Binary size={12} className="text-slate-400" />
                    </div>

                    {/* Vocation Title (Clean Light Header) */}
                    {career && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-px h-8 bg-yellow-500/50 mb-2" />
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em] bg-white px-8 py-3 border border-slate-200 rounded-2xl shadow-sm">
                                {career.job || "Curriculum"}
                            </h2>
                        </div>
                    )}

                    {/* Phase Labels (Minimalist) */}
                    <div className="absolute inset-0 pointer-events-none pt-12">
                        <div className="absolute left-[16%] top-0 transform -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Step 01: Basics</div>
                        <div className="absolute left-[50%] top-0 transform -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Step 02: Core</div>
                        <div className="absolute left-[84%] top-0 transform -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Step 03: Mastery</div>
                    </div>

                    {/* Empty State Fallback */}
                    {processedNodes.length === 0 && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center p-20 text-center">
                            <div className="max-w-md flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                                    <Target size={40} className="text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Neural Link Idle</h3>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] leading-loose">
                                        The Roadmap Oracle requires a set Vocation to project your path. Select your Dream Job in Profile Setup to begin.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/profile/setup')}
                                    className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold transition-colors"
                                >
                                    Initialize Vocation
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stars (Topic Nodes) */}
                    {processedNodes.map((node) => (
                        <motion.div
                            key={node.topic_id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: hoveredNode === node.topic_id ? 1.1 : 1,
                                opacity: 1,
                                x: `calc(50% + ${node.x}px)`,
                                y: `calc(50% + ${node.y}px)`
                            }}
                            whileHover={{ zIndex: 50 }}
                            onMouseEnter={() => setHoveredNode(node.topic_id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => navigate(`/topics/${node.topic_id}`)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/star"
                        >
                            {/* Tech Block Node (Inspired exactly by roadmap.sh) */}
                            <div
                                className={`px-4 py-2 rounded-md transition-all duration-300 border flex items-center justify-between gap-3 min-w-[160px] ${node.isFuture
                                    ? "bg-slate-50 border-slate-200 opacity-60"
                                    : node.isHologram
                                        ? "bg-white border-slate-300 border-dashed"
                                        : node.completed
                                            ? "bg-[#FFE699] border-[#D4A017] shadow-sm transform scale-105"
                                            : node.isConcentration
                                                ? "bg-[#FFE699]/30 border-[#D4A017] border-2 shadow-sm"
                                                : "bg-[#FFF2CC] border-[#FFD966]"
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-800 tracking-tight">
                                        {node.topic_name}
                                    </span>
                                    {node.isConcentration && (
                                        <span className="text-[7px] font-black text-[#D4A017] uppercase tracking-tighter">Foundation Focus</span>
                                    )}
                                </div>
                                {node.completed && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />}
                            </div>

                            {/* Tooltip Label */}
                            <AnimatePresence>
                                {hoveredNode === node.topic_id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: -45, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl whitespace-nowrap z-50 pointer-events-none"
                                    >
                                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${node.isCritical ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {node.isFuture ? "PORTFOLIO ZENITH" : node.isHologram ? "REQUIRED SKILL" : node.course_name}
                                            {node.isCritical && " • CRITICAL PATH"}
                                        </p>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">{node.topic_name}</p>
                                        {node.isFuture && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[8px] font-black text-blue-600/80 uppercase tracking-widest leading-normal whitespace-pre-wrap max-w-[200px]">
                                                    Portfolio Milestone: Aim to complete this for peak hireability.
                                                </span>
                                            </div>
                                        )}
                                        {!node.isFuture && !node.isHologram && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${node.score}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-300">{node.score}%</span>
                                            </div>
                                        )}
                                        {node.isHologram && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                                                <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest">Enrollment Required</span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Minimalist Info Overlay */}
            <div className="absolute bottom-6 left-8 z-20">
                <h4 className="text-slate-800 font-bold uppercase text-sm tracking-widest mb-1">
                    Knowledge Map
                </h4>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Mastery Status</p>
            </div>

            <div className="absolute bottom-6 right-8 z-20 flex gap-4">
                {career && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
                        <Target size={12} className="text-blue-500" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                            {career.percent}% Mastery
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CognitiveConstellation;
