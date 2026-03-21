import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../auth/ThemeContext';
import { 
    RefreshCw, 
    Target, 
    RotateCcw, 
    Info, 
    Trophy, 
    ListFilter, 
    Brain, 
    Settings2, 
    Play, 
    Search, 
    Boxes, 
    CheckCircle2 
} from 'lucide-react';

const nodeNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const generateRandomGraph = (directed = false) => {
    const numNodes = 7;
    const nodes = [];
    const edges = [];

    // Create nodes in a circular/distributed layout
    for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * 2 * Math.PI;
        nodes.push({
            id: String(i + 1),
            data: { label: nodeNames[i] },
            position: { x: 250 + 150 * Math.cos(angle), y: 150 + 150 * Math.sin(angle) },
            type: 'default',
            style: {
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '800',
                background: '#fff',
                color: '#1e293b',
                border: '2px solid #1e293b',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
                cursor: 'pointer'
            }
        });
    }

    // Ensure connectivity (Spanning Tree)
    for (let i = 1; i < numNodes; i++) {
        const source = String(Math.floor(Math.random() * i) + 1);
        const target = String(i + 1);
        const weight = Math.floor(Math.random() * 9) + 1;
        edges.push({
            id: `e${source}-${target}`,
            source,
            target,
            label: String(weight),
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#94a3b8' } : undefined
        });
    }

    // Add some random extra edges
    for (let i = 0; i < 3; i++) {
        const s = String(Math.floor(Math.random() * numNodes) + 1);
        const t = String(Math.floor(Math.random() * numNodes) + 1);
        if (s !== t && !edges.some(e => (e.source === s && e.target === t) || (e.source === t && e.target === s))) {
            const weight = Math.floor(Math.random() * 9) + 1;
            edges.push({
                id: `e${s}-${t}`,
                source: s,
                target: t,
                label: String(weight),
                animated: false,
                style: { stroke: '#94a3b8', strokeWidth: 2 },
                markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#94a3b8' } : undefined
            });
        }
    }

    return { nodes, edges };
};

const GraphVisualizer = ({ algorithm: initialAlgorithm = 'BFS' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [algorithm, setAlgorithm] = useState(initialAlgorithm);
    const [isExercise, setIsExercise] = useState(false);

    useEffect(() => {
        setAlgorithm(initialAlgorithm);
        reset();
    }, [initialAlgorithm]);

    const [directed, setDirected] = useState(false);
    const [graph, setGraph] = useState(() => generateRandomGraph(false));

    const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
    const [step, setStep] = useState(0);
    const [queue, setQueue] = useState([]); // Used as queue for BFS, stack for DFS
    const [visited, setVisited] = useState(new Set());
    const [activeNode, setActiveNode] = useState(null);
    const [explanation, setExplanation] = useState('Select the algorithm and initialize the synaptic protocol.');
    const [isComplete, setIsComplete] = useState(false);

    // Dijkstra/Prim States
    const [distances, setDistances] = useState({});

    // Kruskal's States
    const [mstEdges, setMstEdges] = useState(new Set()); // Edges added to MST
    const [unionFind, setUnionFind] = useState(null);

    // Helper: Union-Find for Kruskal's
    const find = (parent, i) => {
        if (parent[i] === i) return i;
        return find(parent, parent[i]);
    };

    const union = (parent, rank, x, y) => {
        let xroot = find(parent, x);
        let yroot = find(parent, y);
        if (rank[xroot] < rank[yroot]) parent[xroot] = yroot;
        else if (rank[xroot] > rank[yroot]) parent[yroot] = xroot;
        else {
            parent[yroot] = xroot;
            rank[xroot]++;
        }
    };

    const isWeighted = !algorithm.includes('BFS') && !algorithm.includes('DFS');

    useEffect(() => {
        setEdges(eds => eds.map(e => ({
            ...e,
            label: isWeighted ? e.label : undefined
        })));
    }, [algorithm]);

    // Exercise States
    const [score, setScore] = useState(0);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [pointsRemaining, setPointsRemaining] = useState(6);
    const [pointsLost, setPointsLost] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const getNodeStyle = (nodeId) => {
        const isVisited = visited.has(nodeId);
        const isActive = activeNode === nodeId;
        const isInQueue = queue.some(item => (typeof item === 'object' ? item.id === nodeId : item === nodeId));

        if (isActive) return { background: '#6366f1', color: '#fff', border: '3px solid #1e293b', boxShadow: '0 0 20px rgba(99,102,241,0.5)' };
        if (isVisited) return { background: '#10b981', color: '#fff', border: '2px solid #1e293b', opacity: 0.8 };
        if (isInQueue) return { background: '#f59e0b', color: '#fff', border: '2px solid #1e293b', opacity: 1 };
        return { 
            background: isDark ? '#1e293b' : '#fff', 
            color: isDark ? '#f8fafc' : '#1e293b', 
            border: isDark ? '2px solid #334155' : '2px solid #1e293b' 
        };
    };

    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                style: { ...node.style, ...getNodeStyle(node.id) },
            }))
        );
    }, [activeNode, visited, queue]);

    const reset = () => {
        setStep(0);
        setQueue([]);
        setVisited(new Set());
        setMstEdges(new Set());
        setUnionFind(null);
        setActiveNode(null);
        setIsComplete(false);
        setExplanation(isExercise ? 'Reproduce the behavior of the algorithm. Click the next node/edge.' : 'System probe reset. Neural links ready.');
        setScore(0);
        setAttemptsLeft(3);
        setPointsLost(0);
        setFeedback(null);
        setPointsRemaining(nodes.length - 1);
        setDistances({});
        setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: isDark ? '#475569' : '#94a3b8', strokeWidth: 2 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: isDark ? '#475569' : '#94a3b8' } : undefined })));
    };

    const regenerateGraph = () => {
        const newGraph = generateRandomGraph(directed);
        setGraph(newGraph);
        setNodes(newGraph.nodes);
        setEdges(newGraph.edges);
        reset();
    };

    const getExpectedNextNodes = () => {
        if (algorithm.includes('Dijkstra')) {
            const candidates = nodes
                .filter(n => !visited.has(n.id) && distances[n.id] !== undefined && distances[n.id] < Infinity)
                .sort((a, b) => {
                    if (distances[a.id] !== distances[b.id]) return distances[a.id] - distances[b.id];
                    return nodeNames[parseInt(a.id) - 1].localeCompare(nodeNames[parseInt(b.id) - 1]);
                });
            return candidates.map(n => n.id);
        }

        if (algorithm.includes('Prim')) {
            let minWeight = Infinity;
            let candidates = [];
            edges.forEach(e => {
                const sV = visited.has(e.source);
                const tV = visited.has(e.target);
                if ((sV && !tV) || (!directed && !sV && tV)) {
                    const weight = parseInt(e.label);
                    const targetNode = sV ? e.target : e.source;
                    if (weight < minWeight) {
                        minWeight = weight;
                        candidates = [targetNode];
                    } else if (weight === minWeight) {
                        candidates.push(targetNode);
                    }
                }
            });
            candidates.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1]));
            return candidates;
        }

        if (algorithm.includes('Kruskal')) {
            const sortedEdges = [...edges].sort((a, b) => {
                const wa = parseInt(a.label);
                const wb = parseInt(b.label);
                if (wa !== wb) return wa - wb;
                return a.id.localeCompare(b.id);
            });

            for (const edge of sortedEdges) {
                if (mstEdges.has(edge.id)) continue;
                let x = find(unionFind.parent, parseInt(edge.source) - 1);
                let y = find(unionFind.parent, parseInt(edge.target) - 1);
                if (x !== y) {
                    return [edge.source, edge.target];
                }
            }
            return [];
        }

        if (queue.length === 0) return [];

        const current = algorithm.includes('BFS') ? queue[0] : queue[queue.length - 1];
        const currentId = typeof current === 'object' ? current.id : current;

        let neighbors = edges
            .filter(e => e.source === currentId || (!directed && e.target === currentId))
            .map(e => (e.source === currentId ? e.target : e.source))
            .filter(n => !visited.has(n));

        neighbors.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1]));
        return neighbors;
    };

    const handleNodeClick = (_, node) => {
        if (!isExercise || isComplete || attemptsLeft <= 0) return;

        // Start condition
        if (step === 0) {
            if (node.id === nodes[0].id) {
                const startId = node.id;
                setVisited(new Set([startId]));
                setStep(1);
                setActiveNode(startId);
                setFeedback({ type: 'success', message: 'Correct start point!' });

                if (algorithm.includes('BFS') || algorithm.includes('DFS')) {
                    setQueue([startId]);
                } else if (algorithm.includes('Dijkstra')) {
                    const initialDists = { [startId]: 0 };
                    nodes.forEach(n => { if (n.id !== startId) initialDists[n.id] = Infinity; });
                    updateDistances(startId, 0, initialDists);
                } else if (algorithm.includes('Prim')) {
                    setExplanation(`Prim's: Started at ${nodeNames[parseInt(startId) - 1]}. Now pick the cheapest edge connected to it.`);
                } else if (algorithm.includes('Kruskal')) {
                    setUnionFind({ parent: [...Array(nodes.length).keys()], rank: Array(nodes.length).fill(0) });
                    setExplanation(`Kruskal's: Initialized. Now pick the absolute cheapest edge that doesn't create a cycle.`);
                }
            } else {
                handleMistake('You must start with Node A.');
            }
            return;
        }

        const expected = getExpectedNextNodes();

        if (expected.length > 0 && node.id === expected[0]) {
            processCorrectMove(node.id);
        } else {
            const msg = algorithm.includes('Dijkstra') ? "Incorrect. Choose the node with the minimum cumulative distance." :
                algorithm.includes('Prim') ? "Incorrect. Choose the node connected by the minimum weight edge." :
                    "Incorrect. Follow the algorithm. Ties broken alphabetically.";
            handleMistake(msg);
        }
    };

    const updateDistances = (uId, uDist, currentDists) => {
        const newDists = { ...currentDists };
        const neighbors = edges
            .filter(e => e.source === uId || (!directed && e.target === uId))
            .map(e => ({
                id: e.source === uId ? e.target : e.source,
                weight: parseInt(e.label)
            }))
            .filter(n => !visited.has(n.id));

        neighbors.forEach(n => {
            const alt = uDist + n.weight;
            if (alt < (newDists[n.id] || Infinity)) {
                newDists[n.id] = alt;
            }
        });
        setDistances(newDists);
        return newDists;
    };

    const processCorrectMove = (nodeId) => {
        const updatedVisited = new Set(visited);
        updatedVisited.add(nodeId);
        setVisited(updatedVisited);
        setScore(s => s + 1);
        setPointsRemaining(p => p - 1);
        setFeedback({ type: 'success', message: `Correct move! Visited ${nodeNames[parseInt(nodeId) - 1]}` });
        setActiveNode(nodeId);

        if (algorithm.includes('BFS')) {
            // BFS logic: Click next neighbor, then next queue item
            // This is complex for interactive. Let's simplify: 
            // The expected next node logic already handles who is next in BFS.
            const current = queue[0];
            const neighbors = edges
                .filter(e => e.source === current || (!directed && e.target === current))
                .map(e => (e.source === current ? e.target : e.source))
                .filter(n => !updatedVisited.has(n));

            // If the clicked node was the last neighbor of 'current', pop 'current'
            const allNeighbors = edges
                .filter(e => e.source === current || (!directed && e.target === current))
                .map(e => (e.source === current ? e.target : e.source))
                .filter(n => !visited.has(n));

            if (nodeId === allNeighbors.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1]))[allNeighbors.length - 1]) {
                // Last neighbor clicked? No, actual BFS queue logic:
                setQueue([...queue.slice(1), ...allNeighbors.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1]))]);
            } else {
                // BFS interactive usually follows level by level.
                // Re-calculate the queue properly
                let newQ = [...queue];
                if (!newQ.includes(nodeId)) newQ.push(nodeId);
                // If current node has no more neighbors to visit, it should be removed from queue front
                const hasMore = edges.some(e => (e.source === current || (!directed && e.target === current)) && !updatedVisited.has(e.source === current ? e.target : e.source));
                if (!hasMore) newQ = newQ.filter(id => id !== current);
                setQueue(newQ);
            }
        } else if (algorithm.includes('DFS')) {
            setQueue([...queue, nodeId]);
        } else if (algorithm.includes('Dijkstra')) {
            updateDistances(nodeId, distances[nodeId], distances);
        } else if (algorithm.includes('Prim')) {
            setExplanation(`Node ${nodeNames[parseInt(nodeId) - 1]} added to MST. Now pick the next cheapest edge.`);
        } else if (algorithm.includes('Kruskal')) {
            // Find the edge that connects to this nodeId and the current MST
            const sortedEdges = [...edges].sort((a, b) => parseInt(a.label) - parseInt(b.label));
            const nextEdge = sortedEdges.find(e => {
                const x = find(unionFind.parent, parseInt(e.source) - 1);
                const y = find(unionFind.parent, parseInt(e.target) - 1);
                return !mstEdges.has(e.id) && x !== y && (e.source === nodeId || e.target === nodeId);
            });

            if (nextEdge) {
                const updatedMst = new Set(mstEdges);
                updatedMst.add(nextEdge.id);
                setMstEdges(updatedMst);
                union(unionFind.parent, unionFind.rank, parseInt(nextEdge.source) - 1, parseInt(nextEdge.target) - 1);

                setEdges(eds => eds.map(e => e.id === nextEdge.id ? { ...e, animated: true, style: { stroke: '#f59e0b', strokeWidth: 5 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#f59e0b' } : undefined } : e));
                setExplanation(`Edge ${nodeNames[parseInt(nextEdge.source) - 1]}-${nodeNames[parseInt(nextEdge.target) - 1]} added to MST.`);
            }
        }

        setStep(step + 1);

        if (updatedVisited.size === nodes.length) {
            setIsComplete(true);
            setExplanation('System Sync Complete. Algorithm Mastery Confirmed.');
        }
    };

    const handleMistake = (msg) => {
        setAttemptsLeft(a => a - 1);
        setPointsLost(p => p + 1);
        setFeedback({ type: 'error', message: msg });
        if (attemptsLeft <= 1) {
            setIsComplete(true);
            setExplanation('Attempts Exhausted. Protocol Failed.');
        }
    };

    // Auto-Mode Algorithms
    const runBFS = () => {
        if (step === 0) {
            const startNode = nodes[0].id;
            setQueue([startNode]);
            setVisited(new Set([startNode]));
            setExplanation(`Initializing BFS at ${nodeNames[parseInt(startNode) - 1]}.`);
            setStep(1);
            return;
        }
        if (queue.length === 0) { setIsComplete(true); setActiveNode(null); setExplanation('Traversal Complete. All observable domains mapped.'); return; }
        const current = queue[0];
        const newQueue = queue.slice(1);
        setActiveNode(current);
        const neighbors = edges
            .filter(e => e.source === current || (!directed && e.target === current))
            .map(e => (e.source === current ? e.target : e.source))
            .filter(n => !visited.has(n));
        neighbors.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1])); // Ensure consistent order
        const updatedVisited = new Set(visited);
        neighbors.forEach(n => updatedVisited.add(n));
        setQueue([...newQueue, ...neighbors]);
        setVisited(updatedVisited);
        setExplanation(`Scanning Node ${nodeNames[parseInt(current) - 1]}. Enqueuing unvisited neighbors: ${neighbors.map(n => nodeNames[parseInt(n) - 1]).join(', ') || 'None'}.`);
        setEdges(eds => eds.map(e => {
            if ((e.source === current && neighbors.includes(e.target)) || (e.target === current && neighbors.includes(e.source))) {
                return { ...e, animated: true, style: { stroke: '#6366f1', strokeWidth: 3 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#6366f1' } : undefined };
            }
            return e;
        }));
        setStep(step + 1);
    };

    const runDFS = () => {
        if (step === 0) {
            const startNode = nodes[0].id;
            setQueue([startNode]);
            setVisited(new Set([startNode]));
            setExplanation(`Initializing DFS at ${nodeNames[parseInt(startNode) - 1]}. Stack depth: 1.`);
            setStep(1);
            return;
        }
        if (queue.length === 0) { setIsComplete(true); setActiveNode(null); setExplanation('DFS Mapping Complete. Deepest nodes reached.'); return; }
        const current = queue[queue.length - 1];
        const newStack = queue.slice(0, -1);
        setActiveNode(current);
        const neighbors = edges
            .filter(e => e.source === current || (!directed && e.target === current))
            .map(e => (e.source === current ? e.target : e.source))
            .filter(n => !visited.has(n));
        neighbors.sort((a, b) => nodeNames[parseInt(a) - 1].localeCompare(nodeNames[parseInt(b) - 1])); // Ensure consistent order
        if (neighbors.length > 0) {
            const next = neighbors[0];
            const updatedVisited = new Set(visited);
            updatedVisited.add(next);
            setQueue([...queue, next]);
            setVisited(updatedVisited);
            setExplanation(`Pushing Node ${nodeNames[parseInt(next) - 1]} onto stack. Total depth: ${queue.length + 1}.`);
            setEdges(eds => eds.map(e => {
                if ((e.source === current && e.target === next) || (e.target === current && e.source === next)) {
                    return { ...e, animated: true, style: { stroke: '#818cf8', strokeWidth: 4 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#818cf8' } : undefined };
                }
                return e;
            }));
        } else {
            setQueue(newStack);
            setExplanation(`Dead end at ${nodeNames[parseInt(current) - 1]}. Popping stack to backtrack.`);
        }
        setStep(step + 1);
    };

    const runKruskal = () => {
        if (step === 0) {
            setUnionFind({ parent: [...Array(nodes.length).keys()], rank: Array(nodes.length).fill(0) });
            setMstEdges(new Set());
            setExplanation("Kruskal's: Starting. Sorting edges by weight.");
            setStep(1);
            return;
        }

        const sortedEdges = [...edges].sort((a, b) => {
            const wa = parseInt(a.label);
            const wb = parseInt(b.label);
            if (wa !== wb) return wa - wb;
            return a.id.localeCompare(b.id);
        });

        let added = false;
        for (const edge of sortedEdges) {
            if (mstEdges.has(edge.id)) continue;

            let x = find(unionFind.parent, parseInt(edge.source) - 1);
            let y = find(unionFind.parent, parseInt(edge.target) - 1);

            if (x !== y) {
                const updatedMst = new Set(mstEdges);
                updatedMst.add(edge.id);
                setMstEdges(updatedMst);
                union(unionFind.parent, unionFind.rank, x, y);

                const updatedVisited = new Set(visited);
                updatedVisited.add(edge.source);
                updatedVisited.add(edge.target);
                setVisited(updatedVisited);

                setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, animated: true, style: { stroke: '#f59e0b', strokeWidth: 5 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#f59e0b' } : undefined } : e));
                setExplanation(`Kruskal's: Adding edge ${nodeNames[parseInt(edge.source) - 1]}-${nodeNames[parseInt(edge.target) - 1]} (weight ${edge.label}).`);
                added = true;
                break;
            }
        }

        if (!added) {
            setIsComplete(true);
            setExplanation('Kruskal MST Complete.');
        }
        setStep(step + 1);
    };

    const runDijkstra = () => {
        if (step === 0) {
            const startNode = nodes[0].id;
            const initialDists = { [startNode]: 0 };
            nodes.forEach(n => { if (n.id !== startNode) initialDists[n.id] = Infinity; });
            setDistances(initialDists);
            setQueue([{ id: startNode, dist: 0 }]);
            setVisited(new Set());
            setExplanation(`Initializing Dijkstra at ${nodeNames[parseInt(startNode) - 1]}. All other distances set to $\\infty$.`);
            setStep(1);
            return;
        }

        if (queue.length === 0) {
            setIsComplete(true);
            setExplanation('Dijkstra Synthesis Complete.');
            setActiveNode(null);
            return;
        }

        const sortedQueue = [...queue].sort((a, b) => a.dist - b.dist);
        const current = sortedQueue[0];
        const newQueue = sortedQueue.slice(1);

        if (visited.has(current.id)) {
            setQueue(newQueue);
            return;
        }

        setActiveNode(current.id);
        const updatedVisited = new Set(visited);
        updatedVisited.add(current.id);
        setVisited(updatedVisited);

        const neighbors = edges
            .filter(e => e.source === current.id || (!directed && e.target === current.id))
            .map(e => ({
                id: e.source === current.id ? e.target : e.source,
                weight: parseInt(e.label)
            }))
            .filter(n => !updatedVisited.has(n.id));

        const newDists = { ...distances };
        neighbors.forEach(n => {
            const alt = current.dist + n.weight;
            if (alt < (newDists[n.id] || Infinity)) {
                newDists[n.id] = alt;
                newQueue.push({ id: n.id, dist: alt });
            }
        });

        setDistances(newDists);
        setQueue(newQueue);
        setExplanation(`Relaxing edges from ${nodeNames[parseInt(current.id) - 1]}. Minimum unvisited node found.`);

        setEdges(eds => eds.map(e => {
            if ((e.source === current.id && neighbors.some(n => n.id === e.target)) || (!directed && e.target === current.id && neighbors.some(n => n.id === e.source))) {
                return { ...e, animated: true, style: { stroke: '#10b981', strokeWidth: 3 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#10b981' } : undefined };
            }
            return e;
        }));
        setStep(step + 1);
    };

    const runPrim = () => {
        if (step === 0) {
            const startNode = nodes[0].id;
            setVisited(new Set([startNode]));
            setExplanation(`Starting MST from ${nodeNames[parseInt(startNode) - 1]}.`);
            setStep(1);
            return;
        }

        let minEdge = null;
        let minWeight = Infinity;

        edges.forEach(e => {
            const sV = visited.has(e.source);
            const tV = visited.has(e.target);
            if ((sV && !tV) || (!directed && !sV && tV)) {
                const w = parseInt(e.label);
                if (w < minWeight) {
                    minWeight = w;
                    minEdge = e;
                }
            }
        });

        if (!minEdge) {
            setIsComplete(true);
            setExplanation('MST Complete.');
            setActiveNode(null);
            return;
        }

        const newNode = visited.has(minEdge.source) ? minEdge.target : minEdge.source;
        const updatedVisited = new Set(visited);
        updatedVisited.add(newNode);
        setVisited(updatedVisited);
        setActiveNode(newNode);
        setExplanation(`Greedy selection: Adding Node ${nodeNames[parseInt(newNode) - 1]} to MST.`);

        setEdges(eds => eds.map(e => {
            if (e.id === minEdge.id) return { ...e, animated: true, style: { stroke: '#f59e0b', strokeWidth: 5 }, markerEnd: directed ? { type: MarkerType.ArrowClosed, color: '#f59e0b' } : undefined };
            return e;
        }));
        setStep(step + 1);
    };

    const runStep = () => {
        if (algorithm.includes('BFS')) runBFS();
        else if (algorithm.includes('DFS')) runDFS();
        else if (algorithm.includes('Dijkstra')) runDijkstra();
        else if (algorithm.includes('Prim')) runPrim();
        else if (algorithm.includes('Kruskal')) runKruskal();
    };

    return (
        <div className={`w-full border-2 rounded-[3rem] overflow-hidden flex flex-col h-[850px] shadow-2xl transition-colors duration-500 ${isDark ? 'bg-[#050810] border-white/5' : 'bg-slate-50 border-slate-200'}`}>

            {/* TOP BAR / NAVIGATION */}
            <div className={`border-b-2 p-6 flex items-center justify-between transition-colors ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-100'}`}>
                <div className="flex gap-4">
                    <button onClick={() => setIsExercise(false)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isExercise ? (isDark ? 'bg-indigo-600' : 'bg-slate-800') + ' text-white shadow-lg' : (isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                        Simulation mode
                    </button>
                    <button onClick={() => { setIsExercise(true); reset(); }} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExercise ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : (isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                        Interactive Exercise
                    </button>
                </div>

                {/* Algorithm Selector for MST/Greedy Topics */}
                {initialAlgorithm === 'MST' || initialAlgorithm === 'Prim' || initialAlgorithm === 'Kruskal' ? (
                    <div className={`flex items-center p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <button
                            onClick={() => { setAlgorithm('Prim'); reset(); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${algorithm === 'Prim' ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400'}`}
                        >
                            Prim's
                        </button>
                        <button
                            onClick={() => { setAlgorithm('Kruskal'); reset(); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${algorithm === 'Kruskal' ? (isDark ? 'bg-white/10 text-white' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400'}`}
                        >
                            Kruskal's
                        </button>
                    </div>
                ) : null}

                <div className="flex items-center gap-4">
                    <button onClick={() => { setDirected(!directed); regenerateGraph(); }} className={`p-3 rounded-xl flex items-center gap-2 border-2 transition-all ${directed ? (isDark ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600') : (isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                        <Settings2 size={16} />
                        <span className="text-[10px] font-black uppercase">{directed ? 'Directed' : 'Undirected'}</span>
                    </button>
                    <button onClick={reset} className={`p-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 px-6 font-black uppercase text-[10px] tracking-widest ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* 1. VISUALIZATION CANVAS */}
                <div className={`flex-1 relative border-r-2 transition-colors ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-white border-slate-100'}`}>

                    {/* Exercise Instructions Overlay */}
                    <AnimatePresence>
                        {isExercise && (
                            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-6 left-6 right-6 z-20">
                                <div className={`p-6 rounded-[2rem] border-2 shadow-xl ${isDark ? 'bg-zinc-900/90 border-white/10 backdrop-blur-md' : 'bg-slate-50/90 border-slate-200'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <HelpCircle className="text-indigo-500" size={18} />
                                        <h4 className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Exercise Instructions</h4>
                                    </div>
                                    <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Reproduce the behavior of the <span className="font-black text-indigo-600 underline">{algorithm}</span> algorithm.
                                        Click on the <span className="font-black">Nodes</span> in the traversal order.
                                        Start with **Node A**. For ties, choose the node that comes first alphabetically.
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                                        <div className="flex gap-8">
                                            <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Score</span>
                                                <span className="text-lg font-black text-indigo-600">{score} / {nodes.length}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Remaining</span>
                                                <span className="text-lg font-black text-slate-800">{pointsRemaining}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Lost</span>
                                                <span className="text-lg font-black text-red-500">{pointsLost}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            <Target size={14} /> {attemptsLeft} Attempts Left
                                        </div>
                                    </div>

                                    {feedback && (
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mt-4 p-3 rounded-xl border-2 text-[10px] font-black uppercase text-center tracking-widest ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                            {feedback.message}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute top-1/2 right-10 z-10 translate-y-[-50%] flex flex-col gap-4">
                        <button onClick={regenerateGraph} className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-indigo-600 transition-all shadow-lg shadow-slate-200/50">
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onNodesDelete={() => { }}
                        onNodeClick={handleNodeClick}
                        fitView
                        className={isDark ? 'bg-[#050810]' : 'bg-white'}
                        colorMode={isDark ? 'dark' : 'light'}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background variant="dots" gap={25} size={1} color={isDark ? '#334155' : '#e2e8f0'} />
                    </ReactFlow>

                    {!isExercise && (
                        <div className={`absolute bottom-10 left-10 right-10 z-10 flex items-center justify-between p-6 border-2 rounded-[2.5rem] shadow-xl ${isDark ? 'bg-zinc-900/80 border-white/10 backdrop-blur-md' : 'bg-white/80 border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <button disabled={isComplete} onClick={runStep} className="bg-slate-800 hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:bg-slate-200">
                                    Next Cycle
                                </button>
                                <button onClick={reset} className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
                                    <RotateCcw size={16} />
                                </button>
                            </div>

                            <div className="flex gap-10">
                                <div className="text-center">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Pass</span>
                                    <span className="text-xl font-black text-slate-800">{String(step).padStart(2, '0')}</span>
                                </div>
                                <div className="text-center border-l-2 border-slate-100 pl-10">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Coverage</span>
                                    <span className="text-xl font-black text-slate-800">{Math.round((visited.size / nodes.length) * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. STATE SIDEBAR */}
                <div className={`w-full lg:w-[450px] flex flex-col p-10 gap-10 border-l-2 transition-colors ${isDark ? 'bg-zinc-900/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Info className="text-slate-400" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Protocol</span>
                            </div>
                            {isComplete && (
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${attemptsLeft > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <Trophy size={10} /> {attemptsLeft > 0 ? 'Verified' : 'Failed'}
                                </div>
                            )}
                        </div>
                        <div className={`p-8 rounded-3xl border-2 shadow-sm min-h-[140px] flex items-center relative overflow-hidden ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <p className="text-sm font-medium leading-relaxed italic relative z-10 transition-all">
                                "{explanation}"
                            </p>
                            <div className="absolute right-[-20px] top-[-20px] p-10 bg-indigo-500/5 blur-3xl rounded-full" />
                        </div>
                    </section>

                    <section className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <ListFilter className="text-indigo-500" size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{algorithm.includes('BFS') ? 'Queue (FIFO)' : 'Stack (LIFO)'} Memory</span>
                            </div>
                            <span className="text-[9px] font-bold px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full">{queue.length} Nodes</span>
                        </div>

                        <div className="flex-1 bg-white rounded-3xl border-2 border-slate-200 overflow-hidden relative shadow-inner">
                            <div className="absolute inset-0 p-6 flex flex-col gap-3">
                                <AnimatePresence mode="popLayout">
                                    {queue.map((nodeId, idx) => {
                                        const id = typeof nodeId === 'object' ? nodeId.id : nodeId;
                                        const name = nodeNames[parseInt(id) - 1];
                                        return (
                                            <motion.div
                                                key={`${id}-${idx}`}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className={`p-4 rounded-2xl flex items-center justify-between font-black uppercase tracking-widest text-[10px] ${idx === 0 && algorithm.includes('BFS') ? 'bg-indigo-600 text-white' : idx === queue.length - 1 && algorithm.includes('DFS') ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                                                        {name}
                                                    </div>
                                                    <span>Node {id}</span>
                                                </div>
                                                <span className="opacity-40">{idx === 0 && algorithm.includes('BFS') ? 'HEAD' : idx === queue.length - 1 && algorithm.includes('DFS') ? 'TOP' : idx}</span>
                                            </motion.div>
                                        );
                                    })}
                                    {queue.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10">
                                            <Brain size={60} />
                                            <p className="text-[10px] font-black uppercase tracking-widest mt-4">Empty Memory</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="text-emerald-500" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visited Domain</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[...visited].map(id => (
                                <motion.div key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/20 border-2 border-white">
                                    {nodeNames[parseInt(id) - 1]}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GraphVisualizer;
