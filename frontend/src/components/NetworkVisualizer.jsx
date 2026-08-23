import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, RotateCcw, Network, Layers, Route, Server, Smartphone,
    Globe, Search, Activity, ArrowRight, Wifi
} from 'lucide-react';
import { useTheme } from '../auth/ThemeContext';

const META = {
    osi: { title: 'OSI & TCP/IP Stack', subtitle: 'What each layer adds to a message', icon: Layers },
    packet: { title: 'Packet Journey', subtitle: 'Client → Router → Server', icon: Wifi },
    tcp: { title: 'TCP Three-Way Handshake', subtitle: 'How a reliable connection starts', icon: Activity },
    dns: { title: 'DNS Lookup', subtitle: 'Names become IP addresses', icon: Search },
    routing: { title: 'Routing Path', subtitle: 'Find the shortest path across routers', icon: Route },
    ip: { title: 'IP Address Anatomy', subtitle: 'Network bits vs host bits', icon: Globe },
};

const OSI_LAYERS = [
    { name: 'Application', tcp: 'Application', adds: 'HTTP / DNS / your data', color: 'bg-rose-500' },
    { name: 'Presentation', tcp: '—', adds: 'Encoding, encryption (TLS)', color: 'bg-orange-500' },
    { name: 'Session', tcp: '—', adds: 'Session control', color: 'bg-amber-500' },
    { name: 'Transport', tcp: 'Transport', adds: 'TCP / UDP ports & reliability', color: 'bg-emerald-500' },
    { name: 'Network', tcp: 'Internet', adds: 'IP address & routing', color: 'bg-cyan-500' },
    { name: 'Data Link', tcp: 'Network Access', adds: 'MAC address & frames', color: 'bg-indigo-500' },
    { name: 'Physical', tcp: 'Network Access', adds: 'Bits on wire / radio', color: 'bg-violet-500' },
];

const PACKET_HOPS = [
    { id: 'client', label: 'Your Laptop', detail: '192.168.1.10' },
    { id: 'router', label: 'Home Router', detail: 'Forwards the packet' },
    { id: 'isp', label: 'ISP Router', detail: 'Chooses next hop' },
    { id: 'server', label: 'Web Server', detail: '104.21.3.1' },
];

const TCP_STEPS = [
    { from: 'Client', to: 'Server', flag: 'SYN', meaning: 'I want to talk. Seq=100.' },
    { from: 'Server', to: 'Client', flag: 'SYN-ACK', meaning: 'OK. Seq=500, Ack=101.' },
    { from: 'Client', to: 'Server', flag: 'ACK', meaning: 'Ready. Ack=501. Connected.' },
];

const DNS_STEPS = [
    { actor: 'Browser', text: 'Need IP for must.edu' },
    { actor: 'Resolver', text: 'Ask the Root: who knows .edu?' },
    { actor: 'Root', text: 'Ask the .edu TLD server' },
    { actor: 'TLD', text: 'Ask must.edu authoritative' },
    { actor: 'Auth', text: 'must.edu → 203.0.113.40' },
    { actor: 'Browser', text: 'Cache & connect to that IP' },
];

const ROUTERS = [
    { id: 'A', x: 12, y: 50, label: 'You' },
    { id: 'B', x: 38, y: 22, label: 'R1' },
    { id: 'C', x: 38, y: 78, label: 'R2' },
    { id: 'D', x: 68, y: 50, label: 'R3' },
    { id: 'E', x: 92, y: 50, label: 'Dest' },
];
const EDGES = [
    ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['B', 'E'],
];
const BEST_PATH = ['A', 'B', 'E'];

const NetworkVisualizer = ({ type = 'packet' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const mode = META[type] ? type : 'packet';
    const meta = META[mode];
    const Icon = meta.icon;

    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(0);
    const [cidr, setCidr] = useState(24);

    const maxStep = (() => {
        if (mode === 'osi') return OSI_LAYERS.length - 1;
        if (mode === 'packet') return PACKET_HOPS.length - 1;
        if (mode === 'tcp') return TCP_STEPS.length - 1;
        if (mode === 'dns') return DNS_STEPS.length - 1;
        if (mode === 'routing') return BEST_PATH.length - 1;
        if (mode === 'ip') return 2;
        return 0;
    })();

    useEffect(() => {
        setStep(0);
        setSelectedLayer(0);
        setPlaying(true); // auto-run so the lab is never a static screenshot
    }, [mode]);

    useEffect(() => {
        if (!playing) return undefined;
        if (step >= maxStep) {
            setPlaying(false);
            return undefined;
        }
        const t = setTimeout(() => setStep((s) => Math.min(s + 1, maxStep)), 900);
        return () => clearTimeout(t);
    }, [playing, step, maxStep]);

    const reset = () => {
        setPlaying(false);
        setStep(0);
        setSelectedLayer(0);
    };

    const next = () => {
        if (step >= maxStep) {
            reset();
            return;
        }
        setStep((s) => s + 1);
    };

    const shell = isDark
        ? 'bg-black/40 border-white/5 text-white'
        : 'bg-white border-gray-200 text-slate-900 shadow-sm';
    const muted = isDark ? 'text-slate-500' : 'text-slate-500';
    const card = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-gray-200';

    const ipParts = (() => {
        const networkBits = Math.min(30, Math.max(8, cidr));
        const hostBits = 32 - networkBits;
        const hosts = Math.max(0, 2 ** hostBits - 2);
        return { networkBits, hostBits, hosts };
    })();

    const nodeById = Object.fromEntries(ROUTERS.map((n) => [n.id, n]));

    return (
        <div className={`p-6 md:p-8 rounded-[2rem] border backdrop-blur-xl relative overflow-hidden ${shell}`}>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-cyan-500/5 blur-[60px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Icon size={22} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-[0.2em]">{meta.title}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>{meta.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        disabled={playing}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-40"
                    >
                        <Play size={14} /> Play
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${card}`}
                    >
                        <ArrowRight size={14} /> Step
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${card}`}
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            <div className="relative z-10 min-h-[280px]">
                <AnimatePresence mode="wait">
                    {mode === 'osi' && (
                        <motion.div key="osi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                                {OSI_LAYERS.map((layer, i) => {
                                    const active = (playing ? step : selectedLayer) === i;
                                    return (
                                        <button
                                            key={layer.name}
                                            type="button"
                                            onClick={() => { setPlaying(false); setSelectedLayer(i); setStep(i); }}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all ${
                                                active ? 'border-cyan-400/60 bg-cyan-500/15 scale-[1.02]' : `${card} opacity-70 hover:opacity-100`
                                            }`}
                                        >
                                            <span className={`w-2 h-8 rounded-full ${layer.color}`} />
                                            <div className="flex-1">
                                                <div className="text-xs font-black uppercase tracking-wider">{7 - i}. {layer.name}</div>
                                                <div className={`text-[9px] uppercase tracking-widest ${muted}`}>TCP/IP: {layer.tcp}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className={`p-6 rounded-2xl border ${card} flex flex-col justify-center`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${muted}`}>This layer adds</p>
                                <p className="text-xl font-bold leading-snug">{OSI_LAYERS[playing ? step : selectedLayer].adds}</p>
                                <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
                                    Think of layers like envelopes. Your message gets wrapped at each layer going down, then unwrapped going up on the other side.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {mode === 'packet' && (
                        <motion.div key="packet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative flex items-center justify-between gap-2 md:gap-4 px-2 py-10">
                                <div className={`absolute left-8 right-8 top-1/2 h-0.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                {PACKET_HOPS.map((hop, i) => {
                                    const active = step === i;
                                    const done = step > i;
                                    return (
                                        <div key={hop.id} className="relative z-10 flex flex-col items-center gap-3 flex-1">
                                            <motion.div
                                                animate={{ scale: active ? 1.15 : 1, opacity: done || active ? 1 : 0.45 }}
                                                className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                                                    active ? 'bg-cyan-500 text-white border-cyan-300 shadow-lg shadow-cyan-500/30'
                                                        : done ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                            : card
                                                }`}
                                            >
                                                {i === 0 ? <Smartphone size={22} /> : i === PACKET_HOPS.length - 1 ? <Server size={22} /> : <Network size={22} />}
                                            </motion.div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-black uppercase tracking-wider">{hop.label}</div>
                                                <div className={`text-[9px] ${muted}`}>{hop.detail}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <motion.div
                                    className="absolute top-[calc(50%-10px)] w-5 h-5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 z-20"
                                    animate={{ left: `calc(${(step / (PACKET_HOPS.length - 1)) * 100}% - 10px)` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                                />
                            </div>
                            <p className={`text-center text-sm ${muted}`}>
                                Packet at: <span className="font-bold text-cyan-400">{PACKET_HOPS[step].label}</span> — each hop only needs the next address, not the whole internet map.
                            </p>
                        </motion.div>
                    )}

                    {mode === 'tcp' && (
                        <motion.div key="tcp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 mb-2">
                                <div className={`p-4 rounded-2xl border text-center ${card}`}>
                                    <Smartphone className="mx-auto mb-2 text-cyan-400" size={28} />
                                    <div className="text-xs font-black uppercase tracking-widest">Client</div>
                                </div>
                                <div className={`p-4 rounded-2xl border text-center ${card}`}>
                                    <Server className="mx-auto mb-2 text-indigo-400" size={28} />
                                    <div className="text-xs font-black uppercase tracking-widest">Server</div>
                                </div>
                            </div>
                            {TCP_STEPS.map((s, i) => {
                                const active = step === i;
                                const done = step > i;
                                const left = s.from === 'Client';
                                return (
                                    <motion.div
                                        key={s.flag}
                                        animate={{ opacity: done || active ? 1 : 0.35, x: active ? 0 : left ? -8 : 8 }}
                                        className={`flex ${left ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-md px-5 py-3 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/15' : card}`}>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">
                                                {s.from} → {s.to} · {s.flag}
                                            </div>
                                            <p className="text-sm font-medium">{s.meaning}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <p className={`text-center text-xs ${muted}`}>
                                UDP skips this handshake — faster, but no delivery guarantee. Use TCP for files/pages; UDP for live video/games.
                            </p>
                        </motion.div>
                    )}

                    {mode === 'dns' && (
                        <motion.div key="dns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {DNS_STEPS.map((s, i) => {
                                const active = step === i;
                                const done = step > i;
                                return (
                                    <motion.div
                                        key={`${s.actor}-${i}`}
                                        animate={{ opacity: done || active ? 1 : 0.4, scale: active ? 1.02 : 1 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            {i === 0 || i === 5 ? <Globe size={18} /> : <Search size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{s.actor}</div>
                                            <div className="text-sm font-medium">{s.text}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'routing' && (
                        <motion.div key="routing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-72 w-full">
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {EDGES.map(([a, b]) => {
                                    const na = nodeById[a];
                                    const nb = nodeById[b];
                                    const onPath = BEST_PATH.includes(a) && BEST_PATH.includes(b)
                                        && Math.abs(BEST_PATH.indexOf(a) - BEST_PATH.indexOf(b)) === 1
                                        && Math.max(BEST_PATH.indexOf(a), BEST_PATH.indexOf(b)) <= step;
                                    return (
                                        <line
                                            key={`${a}-${b}`}
                                            x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                                            stroke={onPath ? '#22d3ee' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}
                                            strokeWidth={onPath ? 0.8 : 0.35}
                                        />
                                    );
                                })}
                            </svg>
                            {ROUTERS.map((n) => {
                                const idx = BEST_PATH.indexOf(n.id);
                                const active = idx === step;
                                const done = idx >= 0 && idx < step;
                                return (
                                    <motion.div
                                        key={n.id}
                                        className="absolute -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${n.x}%`, top: `${n.y}%` }}
                                        animate={{ scale: active ? 1.2 : 1 }}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-[10px] font-black ${
                                            active ? 'bg-cyan-500 text-white border-cyan-300'
                                                : done ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                    : card
                                        }`}>
                                            {n.label}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <p className={`absolute bottom-0 left-0 right-0 text-center text-sm ${muted}`}>
                                Best path: You → R1 → Dest (routers only know neighbors + costs, not the whole map).
                            </p>
                        </motion.div>
                    )}

                    {mode === 'ip' && (
                        <motion.div key="ip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className={`p-6 rounded-2xl border text-center ${card}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${muted}`}>Example address</p>
                                <p className="text-3xl font-mono font-bold tracking-tight">
                                    192.168.1.42<span className="text-cyan-400">/{cidr}</span>
                                </p>
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>
                                    Prefix length (/{cidr})
                                </label>
                                <input
                                    type="range"
                                    min={8}
                                    max={30}
                                    value={cidr}
                                    onChange={(e) => setCidr(Number(e.target.value))}
                                    className="w-full mt-2 accent-cyan-500"
                                />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Network bits', value: ipParts.networkBits, hint: 'Which network am I on?' },
                                    { label: 'Host bits', value: ipParts.hostBits, hint: 'Which device on that network?' },
                                    { label: 'Usable hosts', value: ipParts.hosts, hint: '2^hostBits − 2' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        animate={{ opacity: step >= i ? 1 : 0.4, y: step >= i ? 0 : 6 }}
                                        className={`p-4 rounded-2xl border ${step === i ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${muted}`}>{item.label}</div>
                                        <div className="text-2xl font-bold mt-1">{item.value}</div>
                                        <div className={`text-xs mt-1 ${muted}`}>{item.hint}</div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="h-4 rounded-full overflow-hidden flex border border-white/10">
                                <div className="bg-cyan-500 h-full transition-all" style={{ width: `${(ipParts.networkBits / 32) * 100}%` }} />
                                <div className="bg-indigo-500/70 h-full transition-all" style={{ width: `${(ipParts.hostBits / 32) * 100}%` }} />
                            </div>
                            <p className={`text-center text-xs ${muted}`}>Cyan = network · Indigo = host — same idea as a street name vs house number.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NetworkVisualizer;
