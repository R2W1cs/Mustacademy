import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactFlow, Background, useNodesState, useEdgesState, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronRight } from "lucide-react";

// ─── Schema normalizer — tolerates whatever the AI generates ─────────────────
function normalizeData(raw) {
    const data = { ...raw };

    // type aliases: "graph" → "bfs", anything with nodes+edges → "bfs"
    if (!data.type || data.type === 'graph' || data.type === 'directed' || data.type === 'undirected') {
        data.type = data.array ? 'sort' : (data.nodes ? 'bfs' : data.type || 'bfs');
    }

    // normalize edges: "from"/"to" → "source"/"target"
    if (Array.isArray(data.edges)) {
        data.edges = data.edges.map(e => ({
            source: String(e.source ?? e.from ?? ''),
            target: String(e.target ?? e.to ?? ''),
        }));
    }

    // normalize nodes: ensure each has { id, label }
    if (Array.isArray(data.nodes)) {
        data.nodes = data.nodes.map(n => ({
            id: String(n.id ?? n.node ?? n.name ?? '?'),
            label: String(n.label ?? n.name ?? n.id ?? '?'),
        }));
    }

    // normalize steps: handle {node, action} → {highlight_nodes, description}
    if (Array.isArray(data.steps)) {
        data.steps = data.steps.map(s => {
            const hn = s.highlight_nodes ?? (s.node ? [String(s.node)] : []);
            return {
                highlight_nodes:  Array.isArray(hn) ? hn.map(String) : [String(hn)],
                visited:          Array.isArray(s.visited)  ? s.visited.map(String)  : [],
                queue:            Array.isArray(s.queue)    ? s.queue.map(String)    : [],
                stack:            Array.isArray(s.stack)    ? s.stack.map(String)    : [],
                highlight_edges:  Array.isArray(s.highlight_edges) ? s.highlight_edges : [],
                comparing:        s.comparing ?? null,
                swapped:          s.swapped   ?? false,
                sorted_up_to:     s.sorted_up_to ?? undefined,
                array:            Array.isArray(s.array) ? s.array : data.array ?? [],
                description:      s.description ?? s.action ?? s.label ?? '',
            };
        });
    }

    return data;
}

// ─── Node colour by state ────────────────────────────────────────────────────
const NODE_COLOR = {
    default:  { bg: '#1e293b', border: '#334155', text: '#94a3b8' },
    visiting: { bg: '#1e40af', border: '#3b82f6', text: '#ffffff' },
    queued:   { bg: '#78350f', border: '#f59e0b', text: '#fde68a' },
    visited:  { bg: '#14532d', border: '#22c55e', text: '#86efac' },
};

function buildFlowNodes(nodes, step) {
    return nodes.map((n, i) => {
        const id = String(n.id);
        const isVisiting = step?.highlight_nodes?.includes(id);
        const isVisited  = step?.visited?.includes(id);
        const isQueued   = step?.queue?.includes(id);

        const col = isVisiting ? NODE_COLOR.visiting
                  : isVisited  ? NODE_COLOR.visited
                  : isQueued   ? NODE_COLOR.queued
                  : NODE_COLOR.default;

        // Arrange in a circle for force-directed feel
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        const radius = Math.min(120 + nodes.length * 8, 180);

        return {
            id,
            position: { x: 220 + radius * Math.cos(angle), y: 140 + radius * Math.sin(angle) },
            data: { label: n.label || id },
            style: {
                background: col.bg,
                border: `2px solid ${col.border}`,
                color: col.text,
                borderRadius: 12,
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: isVisiting ? `0 0 16px ${col.border}66` : 'none',
                transition: 'all 0.35s ease',
            },
        };
    });
}

function buildFlowEdges(edges, step) {
    return edges.map((e, i) => {
        const id = `${e.source}-${e.target}`;
        const isHighlighted = step?.highlight_edges?.includes(id) || step?.highlight_edges?.includes(`${e.source}->${e.target}`);
        return {
            id: `e${i}`,
            source: String(e.source),
            target: String(e.target),
            style: { stroke: isHighlighted ? '#6366f1' : '#334155', strokeWidth: isHighlighted ? 3 : 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: isHighlighted ? '#6366f1' : '#334155' },
            animated: isHighlighted,
        };
    });
}

// ─── Graph visualizer (BFS / DFS / tree) ────────────────────────────────────
function GraphViz({ data, stepIndex }) {
    const step = data.steps?.[stepIndex];
    const [nodes, , onNodesChange] = useNodesState(buildFlowNodes(data.nodes || [], step));
    const [edges, , onEdgesChange] = useEdgesState(buildFlowEdges(data.edges || [], step));

    useEffect(() => {
        const s = data.steps?.[stepIndex];
        onNodesChange(buildFlowNodes(data.nodes || [], s).map(n => ({ type: 'reset', item: n })));
        onEdgesChange(buildFlowEdges(data.edges || [], s).map(e => ({ type: 'reset', item: e })));
    }, [stepIndex, data]);

    return (
        <div className="w-full h-64 rounded-xl overflow-hidden border border-white/5" style={{ background: '#0a0e1a' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                nodesDraggable={false}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={false}
                elementsSelectable={false}
            >
                <Background color="#1e293b" gap={20} />
            </ReactFlow>
        </div>
    );
}

// ─── Sort / Array visualizer ─────────────────────────────────────────────────
function SortViz({ data, stepIndex }) {
    const step = data.steps?.[stepIndex] || {};
    const arr  = step.array || data.array || [];
    const maxVal = Math.max(...arr, 1);

    return (
        <div className="w-full h-48 flex items-end gap-1 px-4 pb-4 pt-4 rounded-xl border border-white/5" style={{ background: '#0a0e1a' }}>
            {arr.map((val, i) => {
                const isComparing = step.comparing?.includes(i);
                const isSwapping  = step.swapped && step.comparing?.includes(i);
                const isSorted    = step.sorted_up_to !== undefined && i >= arr.length - step.sorted_up_to;
                const color = isSwapping  ? '#ef4444'
                            : isComparing ? '#f59e0b'
                            : isSorted    ? '#22c55e'
                            : '#6366f1';
                return (
                    <motion.div
                        key={i}
                        layout
                        animate={{ height: `${(val / maxVal) * 100}%`, backgroundColor: color }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 rounded-t-sm min-h-[4px]"
                        style={{ backgroundColor: color }}
                    />
                );
            })}
        </div>
    );
}

// ─── Stack / Queue visualizer ────────────────────────────────────────────────
function StackQueueViz({ data, stepIndex, type }) {
    const step = data.steps?.[stepIndex] || {};
    const items = type === 'queue' ? (step.queue || []) : (step.stack || step.queue || []);

    return (
        <div className="w-full flex items-center justify-center py-4">
            <div className={`flex ${type === 'queue' ? 'flex-row gap-2' : 'flex-col-reverse gap-1.5'} items-center`}>
                {items.map((item, i) => (
                    <motion.div
                        key={`${item}-${i}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-bold text-sm min-w-[40px] text-center"
                    >
                        {item}
                    </motion.div>
                ))}
                {items.length === 0 && <span className="text-slate-600 text-sm">empty</span>}
            </div>
        </div>
    );
}

// ─── Main AlgoVizBlock ───────────────────────────────────────────────────────
export default function AlgoVizBlock({ children }) {
    const raw = Array.isArray(children) ? children.join('') : String(children || '');

    const [data, setData] = useState(null);
    const [parseError, setParseError] = useState(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(raw.trim());
            setData(normalizeData(parsed));
            setParseError(null);
        } catch (e) {
            setParseError('Invalid algo-viz JSON');
        }
    }, [raw]);

    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1); // 1=normal, 2=fast, 3=faster
    const intervalRef = useRef(null);

    const totalSteps = data?.steps?.length || 0;

    const next = useCallback(() => {
        setStepIndex(i => {
            if (i >= totalSteps - 1) { setIsPlaying(false); return i; }
            return i + 1;
        });
    }, [totalSteps]);

    const prev = () => { setIsPlaying(false); setStepIndex(i => Math.max(0, i - 1)); };
    const restart = () => { setIsPlaying(false); setStepIndex(0); };

    useEffect(() => {
        if (isPlaying) {
            const ms = speed === 3 ? 400 : speed === 2 ? 800 : 1400;
            intervalRef.current = setInterval(next, ms);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, speed, next]);

    if (parseError) {
        return (
            <div className="my-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-mono">
                {parseError}
            </div>
        );
    }

    if (!data) return null;

    const currentStep = data.steps?.[stepIndex];
    const isGraph = ['bfs', 'dfs', 'tree', 'graph', 'directed', 'undirected'].includes(data.type);
    const isSort  = data.type === 'sort';
    const isStackOrQueue = ['stack', 'queue'].includes(data.type);

    const speedMs = speed === 3 ? '0.4s' : speed === 2 ? '0.8s' : '1.4s';

    return (
        <div className="my-6 rounded-2xl overflow-hidden border border-indigo-500/15" style={{ background: '#070b15' }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5" style={{ background: '#090e1c' }}>
                <div className="flex gap-1.5">
                    {['bg-red-500/50','bg-yellow-500/50','bg-green-500/50'].map((c,i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${c}`} />
                    ))}
                </div>
                <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-indigo-400/70">
                    ◈ {data.title || data.type?.toUpperCase()}
                </span>
                <div className="ml-auto flex items-center gap-1">
                    {[1,2,3].map(s => (
                        <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`w-2 h-2 rounded-full transition-all ${speed >= s ? 'bg-indigo-500' : 'bg-white/10'}`}
                            title={`Speed ${s}`}
                        />
                    ))}
                    <span className="text-[9px] text-slate-600 ml-1 font-mono">{speedMs}/step</span>
                </div>
            </div>

            {/* Visualization */}
            <div className="px-4 pt-4">
                {isGraph && <GraphViz data={data} stepIndex={stepIndex} />}
                {isSort  && <SortViz  data={data} stepIndex={stepIndex} />}
                {isStackOrQueue && <StackQueueViz data={data} stepIndex={stepIndex} type={data.type} />}

                {/* State badges */}
                {currentStep && (isGraph || isStackOrQueue) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {currentStep.visited?.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-emerald-400 font-bold">Visited: {currentStep.visited.join(' → ')}</span>
                            </div>
                        )}
                        {currentStep.queue?.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] text-amber-400 font-bold">Queue: [{currentStep.queue.join(', ')}]</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="px-4 py-3 flex items-center gap-3">
                <button onClick={restart} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                    <RotateCcw size={15} />
                </button>
                <button onClick={prev} disabled={stepIndex === 0} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 transition-all">
                    <SkipBack size={15} />
                </button>
                <button
                    onClick={() => setIsPlaying(v => !v)}
                    disabled={stepIndex >= totalSteps - 1 && !isPlaying}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 disabled:opacity-30 transition-all"
                >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={next} disabled={stepIndex >= totalSteps - 1} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white disabled:opacity-20 transition-all">
                    <SkipForward size={15} />
                </button>

                {/* Step counter + description */}
                <div className="flex-1 min-w-0 ml-2">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                            Step {stepIndex + 1} / {totalSteps}
                        </span>
                        {/* Progress bar */}
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 100}%` }}
                            />
                        </div>
                    </div>
                    {currentStep?.description && (
                        <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                            <ChevronRight size={11} className="text-indigo-500 flex-shrink-0" />
                            {currentStep.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
