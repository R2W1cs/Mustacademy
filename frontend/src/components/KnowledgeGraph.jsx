import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Brain } from 'lucide-react';
import { useTheme } from '../auth/ThemeContext';
import { csKnowledgeData } from './cs_knowledge_data';

// --- DATA UTILS ---
const flattenTree = (root) => {
    let nodes = [];
    let links = [];

    // Recursive traversal
    const traverse = (node, parent = null, level = 0, angleRange = { start: 0, end: Math.PI * 2 }) => {
        // Prevent duplicates
        if (nodes.find(n => n.id === node.id)) return;

        // 1. Calculate Radius purely based on level
        const radius = Math.max(5, 30 - (level * 6)); // 30, 24, 18, 12, 6...

        // 2. Calculate Position (Radial)
        let x = 0, y = 0;
        if (parent) {
            const dist = 240 + (level * 100); // Massive spacing for "Global View"
            const angle = (angleRange.start + angleRange.end) / 2;
            x = parent.x + Math.cos(angle) * dist;
            y = parent.y + Math.sin(angle) * dist;
        }

        // 3. Create Node Object
        const newNode = {
            id: node.id,
            label: node.label,
            group: node.group || 'concept', // Default group
            level: level,
            x: x,
            y: y,
            homeX: x, // Anchor position for structure
            homeY: y,
            vx: 0,
            vy: 0,
            r: radius
        };

        nodes.push(newNode);

        // 4. Create Link
        if (parent) {
            links.push({ source: parent.id, target: node.id });
        }

        // 5. Recurse for Children
        if (node.children && node.children.length > 0) {
            const count = node.children.length;
            const sectorSize = (angleRange.end - angleRange.start) / count;

            node.children.forEach((child, i) => {
                let start = angleRange.start + (i * sectorSize);
                let end = start + sectorSize;

                // Root distributes 360 degrees
                if (level === 0) {
                    start = (i / count) * Math.PI * 2;
                    end = ((i + 1) / count) * Math.PI * 2;
                }

                traverse(child, newNode, level + 1, { start, end });
            });
        }
    };

    // Trigger traversal starting from root
    traverse(root);

    return { nodes, links };
};

export default function KnowledgeGraph() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const canvasRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);

    // Data State using ref to avoid re-renders during physics
    const graphData = useRef({ nodes: [], links: [] });
    // State for React UI to know about selected node details
    const [uiSelectedNode, setUiSelectedNode] = useState(null);
    const [nodeCount, setNodeCount] = useState(0);

    // Physics State
    const simulation = useRef(null);
    const transform = useRef({ x: 0, y: 0, k: 0.6 }); // Zoomed out initially
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Initialize Data
        const data = flattenTree(csKnowledgeData);
        setNodeCount(data.nodes.length);



        // Removed random jitter to enforce strict structure initially

        graphData.current = data;

        // Helper for physics tick
        const tick = () => {
            const { nodes, links } = graphData.current;

            // 0. Parameters
            const repulsion = 3500; // Extreme repulsion for clarity
            const springLen = 220; // Very long links for spacing
            const damping = 0.5; // High friction for stability
            const maxVel = 3; // Low velocity for slow, deliberate movement

            // 1. Repulsion
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    let distSq = dx * dx + dy * dy;
                    if (distSq === 0) distSq = 1;

                    // Optimization: Ignore far nodes
                    if (distSq > 900000) continue; // Increased interaction radius

                    const dist = Math.sqrt(distSq);
                    const force = repulsion / distSq;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (nodes[i] !== selectedNode) {
                        nodes[i].vx += fx;
                        nodes[i].vy += fy;
                    }
                    if (nodes[j] !== selectedNode) {
                        nodes[j].vx -= fx;
                        nodes[j].vy -= fy;
                    }
                }
            }

            // 2. Attraction (Springs)
            links.forEach(link => {
                const source = nodes.find(n => n.id === link.source);
                const target = nodes.find(n => n.id === link.target);
                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const currentSpringLen = springLen; // More uniform
                const force = (dist - currentSpringLen) * 0.03; // Softer springs

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                if (source !== selectedNode) {
                    source.vx += fx;
                    source.vy += fy;
                }
                if (target !== selectedNode) {
                    target.vx -= fx;
                    target.vy -= fy;
                }
            });

            // 3. Center Gravity & Damping & ANCHORING
            nodes.forEach(node => {
                const gravityStr = node.level === 0 ? 0.02 : 0.005; // Gentle gravity
                node.vx -= node.x * gravityStr;
                node.vy -= node.y * gravityStr;

                // ANCHORING FORCE: Pull towards calculated layout position
                // This enforces the "Clear Structure" the user requested
                const anchorStrength = 0.05; // Strong enough to hold shape, loose enough for drag
                node.vx += (node.homeX - node.x) * anchorStrength;
                node.vy += (node.homeY - node.y) * anchorStrength;

                node.vx *= 0.8; // Moderate damping
                node.vy *= 0.8;

                // Velocity Clamp
                const vel = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                if (vel > maxVel) {
                    node.vx = (node.vx / vel) * maxVel;
                    node.vy = (node.vy / vel) * maxVel;
                }

                if (node !== selectedNode) {
                    node.x += node.vx;
                    node.y += node.vy;
                }
            });

            draw();
            simulation.current = requestAnimationFrame(tick);
        };

        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const { width, height } = canvas;

            // --- THEME COLORS ---
            const bgColor = isDark ? '#0a0e1a' : '#f8fafc'; // Slate-50 in light
            const linkColor = isDark ? 'rgba(34, 211, 238, 0.15)' : 'rgba(71, 85, 105, 0.15)'; // Cyan vs Slate-600
            const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.9)'; // White vs Slate-900

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width / 2 + transform.current.x, height / 2 + transform.current.y);
            ctx.scale(transform.current.k, transform.current.k);

            // Draw Links
            graphData.current.links.forEach(link => {
                const source = graphData.current.nodes.find(n => n.id === link.source);
                const target = graphData.current.nodes.find(n => n.id === link.target);
                if (source && target) {
                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.strokeStyle = linkColor;
                    ctx.lineWidth = 1 / transform.current.k; // Constant generic width
                    ctx.stroke();
                }
            });

            // Draw Nodes
            graphData.current.nodes.forEach(node => {
                // --- NODE COLORS ---
                let primaryColor, glowColor;

                if (node.group === 'root') {
                    primaryColor = '#FFD700'; // Gold
                    glowColor = 'rgba(255, 215, 0, 0.6)';
                } else if (node.group === 'domain') {
                    primaryColor = isDark ? '#22d3ee' : '#0891b2'; // Cyan-400 vs Cyan-600
                    glowColor = isDark ? 'rgba(34, 211, 238, 0.4)' : 'rgba(8, 145, 178, 0.3)';
                } else if (node.group === 'core') {
                    primaryColor = isDark ? '#a855f7' : '#9333ea'; // Purple
                    glowColor = isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(147, 51, 234, 0.2)';
                } else {
                    primaryColor = isDark ? '#64748b' : '#94a3b8'; // Slate
                    glowColor = 'rgba(0,0,0,0)';
                }

                // Glow
                if (transform.current.k > 0.4 || node.level < 2) {
                    const glow = ctx.createRadialGradient(node.x, node.y, node.r * 0.5, node.x, node.y, node.r * 2);
                    glow.addColorStop(0, glowColor);
                    glow.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.r * 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Core
                ctx.fillStyle = primaryColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
                ctx.fill();

                // Inner Dot
                ctx.fillStyle = isDark ? '#fff' : '#fff';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.r * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Labels (LOD)
                // Show labels if zoomed in enough OR if high level node
                // Labels (LOD) - Relaxed to show all nodes initially as requested
                // Show labels if zoomed in slightly OR if it's a major node. 
                // Actually, user wants "everything", so let's show all labels if zoom > 0.3 (very zoomed out)
                if (transform.current.k > 0.3 || node.level < 4) {
                    ctx.fillStyle = textColor;
                    const fontSize = 10 / transform.current.k;
                    ctx.font = `${fontSize}px monospace`; // Scale text inverse to zoom for readability? No, usually text scales with zoom.
                    // Actually nicely scaled text:
                    ctx.font = 'bold 12px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.label, node.x, node.y + node.r + 15);
                }
            });

            ctx.restore();
        };

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        simulation.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(simulation.current);
        };
    }, [isDark]); // Re-init physics on theme change not strictly needed, but re-run effect ensures colors update if we used closures improperly. simpler to just let draw handle it. 
    // Actually, draw() is called by tick, which reads `isDark` from closure. The closure is created on mount. 
    // To make tick reactive to `isDark` without restarting physics, we should use a ref for isDark or restart.
    // Restarting physics is fine for theme toggle.

    // --- INTERACTION ---
    const handleMouseDown = (e) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left - canvas.width / 2 - transform.current.x) / transform.current.k;
        const my = (e.clientY - rect.top - canvas.height / 2 - transform.current.y) / transform.current.k;

        // Find clicked node
        // Search reverse to hit top z-index first
        const clicked = [...graphData.current.nodes].reverse().find(n => {
            const dx = n.x - mx;
            const dy = n.y - my;
            return Math.sqrt(dx * dx + dy * dy) < n.r * 2;
        });

        if (clicked) {
            setSelectedNode(clicked);
            setUiSelectedNode(clicked);
            clicked.kx = clicked.x; // Lock position if utilizing d3-force style overrides (custom here doesnt support yet, but setting vx=0 works)
        } else {
            setSelectedNode(null);
            setUiSelectedNode(null);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };

        if (selectedNode) {
            selectedNode.x += dx / transform.current.k;
            selectedNode.y += dy / transform.current.k;
            selectedNode.vx = 0;
            selectedNode.vy = 0;
        } else {
            transform.current.x += dx;
            transform.current.y += dy;
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        setSelectedNode(null); // Release drag lock
    };

    const handleWheel = (e) => {
        const scaleAmount = -e.deltaY * 0.001;
        transform.current.k = Math.max(0.05, Math.min(5, transform.current.k + scaleAmount));
    };

    return (
        <div className={`relative w-full h-screen overflow-hidden ${isDark ? 'bg-[#0a0e1a]' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
                <div onClick={() => navigate('/dashboard')} className={`pointer-events-auto cursor-pointer p-3 rounded-full backdrop-blur-md border transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white/60 hover:bg-white border-slate-200'}`}>
                    <ArrowLeft className={isDark ? "text-white" : "text-slate-800"} size={24} />
                </div>
                <div className="text-right">
                    <h1 className={`text-2xl font-black uppercase tracking-[0.2em] flex items-center justify-end gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Cognitive <span className="text-cyan-500">Hub</span>
                        <Brain size={24} className="text-cyan-500" />
                    </h1>
                    <p className={`text - xs font - mono mt - 1 ${isDark ? 'text-white/50' : 'text-slate-500'} `}>
                        {nodeCount} NODES INITIALIZED
                    </p>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="cursor-crosshair active:cursor-grabbing block"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
            />

            {/* Sidebar */}
            <AnimatePresence>
                {uiSelectedNode && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className={`absolute top-0 right-0 w-80 h-full backdrop-blur-xl border-l p-8 shadow-2xl z-20 ${isDark ? 'bg-[#0f1729]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}
                    >
                        <div className="mt-20">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded mb-4 inline-block ${isDark ? 'bg-cyan-900/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>
                                Type: {uiSelectedNode.group}
                            </span>
                            <h2 className={`text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{uiSelectedNode.label}</h2>
                            <p className={`leading-relaxed text-sm mb-8 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                                Explore learning paths, resources, and specific modules related to {uiSelectedNode.label}.
                            </p>

                            <div className="space-y-3">
                                <button className={`w-full py-3 border rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}>
                                    <Maximize size={14} /> Focus Node
                                </button>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="w-full py-3 bg-[#FFD700] hover:bg-[#FDB931] text-black rounded-lg text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 shadow-lg shadow-amber-500/20"
                                >
                                    Start Module
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`absolute bottom-6 left-6 flex items-center gap-2 pointer-events-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {/* Controls hint could go here */}
            </div>
        </div>
    );
}
