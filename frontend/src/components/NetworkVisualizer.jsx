import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, RotateCcw, Network, Layers, Route, Server, Smartphone,
    Globe, Search, Activity, ArrowRight, Wifi, Timer, Gauge, Shield, Lock, Radio
} from 'lucide-react';
import { useTheme } from '../auth/ThemeContext';

const META = {
    osi: { title: 'OSI & TCP/IP Stack', subtitle: 'What each layer adds to a message', icon: Layers },
    packet: { title: 'Packet Journey', subtitle: 'Client → Router → Server', icon: Wifi },
    tcp: { title: 'TCP Three-Way Handshake', subtitle: 'How a reliable connection starts', icon: Activity },
    dns: { title: 'DNS Lookup', subtitle: 'Names become IP addresses', icon: Search },
    routing: { title: 'Routing Path', subtitle: 'Find the shortest path across routers', icon: Route },
    ip: { title: 'IP Address Anatomy', subtitle: 'Network bits vs host bits', icon: Globe },
    delay: { title: 'The Four Delays', subtitle: 'Processing · Queueing · Transmission · Propagation', icon: Timer },
    throughput: { title: 'Throughput Bottleneck', subtitle: 'The slowest link sets your speed', icon: Gauge },
    congestion: { title: 'Congestion Window', subtitle: 'AIMD: probe up, cut on loss', icon: Activity },
    http: { title: 'HTTP Request Pipeline', subtitle: 'Browser → DNS → TCP → HTTP → response', icon: Globe },
    nat: { title: 'NAT Translation', subtitle: 'Private addresses share one public IP', icon: Shield },
    multiplex: { title: 'Port Multiplexing', subtitle: 'Many apps share one IP via port numbers', icon: Layers },
    circuit: { title: 'Circuit vs Packet Switching', subtitle: 'Reserved path vs shared hops', icon: Route },
    arp: { title: 'ARP Resolution', subtitle: 'IP address → MAC address on the LAN', icon: Search },
    wifi: { title: 'Wi-Fi Access', subtitle: 'Sense the medium, then transmit', icon: Radio },
    firewall: { title: 'Firewall Filter', subtitle: 'Allow or drop based on policy', icon: Shield },
    vpn: { title: 'VPN Tunnel', subtitle: 'Encrypt and wrap traffic across the public net', icon: Lock },
    smtp: { title: 'SMTP Mail Path', subtitle: 'Message hops from MUA → servers → inbox', icon: Server },
    timeline: { title: 'Concept Walkthrough', subtitle: 'Step through this lesson idea', icon: Activity },
    delivery: { title: 'Message Delivery', subtitle: 'Watch a message cross the Internet', icon: Wifi },
};

const DELAY_STEPS = [
    { name: 'Processing', ms: 0.01, tip: 'Router looks up the next hop (tiny on modern gear).' },
    { name: 'Queueing', ms: 5, tip: 'Waiting behind other packets — grows under congestion.' },
    { name: 'Transmission', ms: 1.2, tip: 'Pushing bits onto the wire: L / R (size ÷ rate).' },
    { name: 'Propagation', ms: 10, tip: 'Speed-of-signal × distance (fiber ≈ 2×10⁸ m/s).' },
];

const THROUGHPUT_LINKS = [
    { name: 'Wi-Fi', mbps: 40 },
    { name: 'ISP uplink', mbps: 100 },
    { name: 'Server NIC', mbps: 1000 },
];

const CONGESTION_CWND = [1, 2, 4, 8, 12, 16, 8, 9, 10, 11];

const HTTP_STEPS = [
    { actor: 'Browser', text: 'User hits Enter on must.edu' },
    { actor: 'DNS', text: 'Resolve must.edu → IP' },
    { actor: 'TCP', text: 'Three-way handshake' },
    { actor: 'TLS', text: 'Secure the channel (HTTPS)' },
    { actor: 'HTTP', text: 'GET / HTTP/1.1' },
    { actor: 'Server', text: '200 OK + HTML bytes' },
];

const NAT_STEPS = [
    { side: 'LAN', text: 'Laptop 192.168.1.10:51515 sends to 93.184.216.34:443' },
    { side: 'NAT', text: 'Rewrite source → 203.0.113.8:40001 and remember the mapping' },
    { side: 'WAN', text: 'Internet sees only the public IP:port' },
    { side: 'NAT', text: 'Reply to :40001 → translate back to 192.168.1.10:51515' },
    { side: 'LAN', text: 'Laptop receives the response — NAT was invisible' },
];

const MULTIPLEX_STEPS = [
    { app: 'Browser', port: ':443', tip: 'HTTPS tab talking to a web server' },
    { app: 'Chat app', port: ':5222', tip: 'Instant messages on another socket' },
    { app: 'Game', port: ':27015', tip: 'UDP datagrams for live play' },
    { app: 'OS demux', port: 'IP shared', tip: 'Same host IP — ports separate the conversations' },
];

const CIRCUIT_STEPS = [
    { mode: 'Circuit', text: 'Reserve the whole path first (like an old phone call)' },
    { mode: 'Circuit', text: 'Bandwidth sits idle if you pause talking' },
    { mode: 'Packet', text: 'Slice data into addressed packets that share links' },
    { mode: 'Packet', text: 'Many conversations multiplex — more efficient, variable delay' },
];

const ARP_STEPS = [
    { actor: 'Host A', text: 'I know 192.168.1.50 IP — who has that MAC?' },
    { actor: 'Broadcast', text: 'ARP request floods the LAN: "Who has 192.168.1.50?"' },
    { actor: 'Host B', text: 'That\'s me — my MAC is aa:bb:cc:dd:ee:ff' },
    { actor: 'Host A', text: 'Cache the mapping, then send the Ethernet frame' },
];

const WIFI_STEPS = [
    { actor: 'Client', text: 'Listen — is the channel busy? (CSMA/CA)' },
    { actor: 'Client', text: 'Wait a random backoff if someone else is talking' },
    { actor: 'Client', text: 'Transmit a frame to the access point' },
    { actor: 'AP', text: 'ACK if received — else client retries' },
    { actor: 'AP', text: 'Forward onto the wired network / internet' },
];

const FIREWALL_STEPS = [
    { verdict: 'ALLOW', text: 'Outbound HTTPS :443 from laptop → permitted' },
    { verdict: 'DROP', text: 'Unsolicited inbound SSH :22 from internet → blocked' },
    { verdict: 'ALLOW', text: 'Return traffic matching an existing flow → stateful permit' },
    { verdict: 'DROP', text: 'Spoofed packet with bad checksum / banned IP → discard' },
];

const VPN_STEPS = [
    { stage: 'App', text: 'Your app sends a normal packet to a private work IP' },
    { stage: 'Tunnel', text: 'VPN client encrypts + wraps it for the VPN gateway' },
    { stage: 'Internet', text: 'Public routers only see gateway-to-gateway traffic' },
    { stage: 'Unwrap', text: 'Gateway decrypts and delivers onto the private network' },
];

const SMTP_STEPS = [
    { hop: 'Mail app', text: 'You hit Send — message handed to your SMTP server' },
    { hop: 'Your MX', text: 'Server looks up recipient domain MX via DNS' },
    { hop: 'Their MX', text: 'SMTP relays the message to the destination server' },
    { hop: 'Inbox', text: 'Recipient fetches with IMAP/POP — mail arrived' },
];

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

const NetworkVisualizer = ({ type = 'packet', config = null }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const mode = META[type] ? type : (config?.steps || config?.hops ? type : 'packet');
    const baseMeta = META[mode] || META.timeline;
    const meta = {
        title: config?.title || baseMeta.title,
        subtitle: config?.subtitle || baseMeta.subtitle,
        icon: baseMeta.icon,
    };
    const Icon = meta.icon;
    const customSteps = config?.steps || null;
    const customHops = config?.hops || null;

    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(0);
    const [cidr, setCidr] = useState(24);

    const maxStep = (() => {
        if (mode === 'timeline' && customSteps?.length) return customSteps.length - 1;
        if (mode === 'delivery' && customHops?.length) return customHops.length - 1;
        if (mode === 'osi') return OSI_LAYERS.length - 1;
        if (mode === 'packet') return PACKET_HOPS.length - 1;
        if (mode === 'tcp') return TCP_STEPS.length - 1;
        if (mode === 'dns') return DNS_STEPS.length - 1;
        if (mode === 'routing') return BEST_PATH.length - 1;
        if (mode === 'ip') return 2;
        if (mode === 'delay') return DELAY_STEPS.length - 1;
        if (mode === 'throughput') return THROUGHPUT_LINKS.length - 1;
        if (mode === 'congestion') return CONGESTION_CWND.length - 1;
        if (mode === 'http') return HTTP_STEPS.length - 1;
        if (mode === 'nat') return NAT_STEPS.length - 1;
        if (mode === 'multiplex') return MULTIPLEX_STEPS.length - 1;
        if (mode === 'circuit') return CIRCUIT_STEPS.length - 1;
        if (mode === 'arp') return ARP_STEPS.length - 1;
        if (mode === 'wifi') return WIFI_STEPS.length - 1;
        if (mode === 'firewall') return FIREWALL_STEPS.length - 1;
        if (mode === 'vpn') return VPN_STEPS.length - 1;
        if (mode === 'smtp') return SMTP_STEPS.length - 1;
        if (customSteps?.length) return customSteps.length - 1;
        return 0;
    })();

    // Reset when lesson lab config changes — stay paused until user hits Play
    useEffect(() => {
        setStep(0);
        setSelectedLayer(0);
        setPlaying(false);
    }, [mode, meta.title, meta.subtitle, customSteps?.length, customHops?.length]);

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
                        onClick={() => setPlaying((p) => !p)}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
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
                            <p className={`text-center text-xs ${muted}`}>Cyan = network · Indigo = host — street name vs house number.</p>
                        </motion.div>
                    )}

                    {mode === 'delay' && (
                        <motion.div key="delay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {DELAY_STEPS.map((d, i) => {
                                const active = step === i;
                                const done = step > i;
                                return (
                                    <motion.div
                                        key={d.name}
                                        animate={{ opacity: done || active ? 1 : 0.4, scale: active ? 1.02 : 1 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            <span className="text-sm font-black">{d.ms}</span>
                                            <span className="text-[8px] uppercase">ms</span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{d.name} delay</div>
                                            <div className="text-sm font-medium">{d.tip}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <p className={`text-center text-sm ${muted}`}>
                                Total ≈ {DELAY_STEPS.slice(0, step + 1).reduce((a, d) => a + d.ms, 0).toFixed(2)} ms so far — queueing is usually the surprise.
                            </p>
                        </motion.div>
                    )}

                    {mode === 'throughput' && (
                        <motion.div key="throughput" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid gap-3">
                                {THROUGHPUT_LINKS.map((link, i) => {
                                    const active = step === i;
                                    const bottleneck = Math.min(...THROUGHPUT_LINKS.map((l) => l.mbps));
                                    const isBottle = link.mbps === bottleneck;
                                    return (
                                        <div key={link.name} className={`p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}>
                                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                                                <span>{link.name}</span>
                                                <span className={isBottle ? 'text-amber-400' : muted}>{link.mbps} Mbps {isBottle ? '· bottleneck' : ''}</span>
                                            </div>
                                            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${isBottle ? 'bg-amber-400' : 'bg-cyan-500'}`}
                                                    animate={{ width: step >= i ? `${(link.mbps / 1000) * 100}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className={`text-center text-sm ${muted}`}>
                                End-to-end throughput ≈ <span className="font-bold text-amber-400">{Math.min(...THROUGHPUT_LINKS.map((l) => l.mbps))} Mbps</span> — the slowest hop wins.
                            </p>
                        </motion.div>
                    )}

                    {mode === 'congestion' && (
                        <motion.div key="congestion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className={`p-4 rounded-2xl border ${card}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${muted}`}>Congestion window (segments)</p>
                                <div className="flex items-end gap-1.5 h-40">
                                    {CONGESTION_CWND.map((w, i) => (
                                        <motion.div
                                            key={i}
                                            className={`flex-1 rounded-t-lg ${i === step ? 'bg-cyan-400' : i < step ? 'bg-cyan-600/70' : 'bg-white/10'}`}
                                            animate={{ height: `${(Math.min(w, 16) / 16) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className={`text-center text-sm ${muted}`}>
                                Step {step + 1}: cwnd = <span className="font-bold text-cyan-400">{CONGESTION_CWND[step]}</span>
                                {CONGESTION_CWND[step] < (CONGESTION_CWND[step - 1] || 0) ? ' — loss → multiplicative decrease' : ' — probe upward (AIMD / slow start)'}
                            </p>
                        </motion.div>
                    )}

                    {mode === 'http' && (
                        <motion.div key="http" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {HTTP_STEPS.map((s, i) => {
                                const active = step === i;
                                const done = step > i;
                                return (
                                    <motion.div
                                        key={`${s.actor}-${i}`}
                                        animate={{ opacity: done || active ? 1 : 0.35, x: active ? 0 : -6 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            {s.actor}
                                        </div>
                                        <div className="text-sm font-medium">{s.text}</div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'nat' && (
                        <motion.div key="nat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {NAT_STEPS.map((s, i) => {
                                const active = step === i;
                                const done = step > i;
                                return (
                                    <motion.div
                                        key={`${s.side}-${i}`}
                                        animate={{ opacity: done || active ? 1 : 0.35 }}
                                        className={`p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">{s.side}</div>
                                        <div className="text-sm font-medium font-mono leading-relaxed">{s.text}</div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'multiplex' && (
                        <motion.div key="multiplex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            <p className={`text-center text-xs mb-2 ${muted}`}>One laptop IP · many conversations identified by ports</p>
                            {MULTIPLEX_STEPS.map((s, i) => {
                                const active = step === i;
                                return (
                                    <motion.div
                                        key={s.app}
                                        animate={{ opacity: step >= i ? 1 : 0.35, x: active ? 0 : -4 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>{s.port}</div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{s.app}</div>
                                            <div className="text-sm font-medium">{s.tip}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'circuit' && (
                        <motion.div key="circuit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {CIRCUIT_STEPS.map((s, i) => {
                                const active = step === i;
                                const isCircuit = s.mode === 'Circuit';
                                return (
                                    <motion.div
                                        key={`${s.mode}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCircuit ? 'text-amber-400' : 'text-cyan-400'}`}>{s.mode} switching</div>
                                        <div className="text-sm font-medium">{s.text}</div>
                                    </motion.div>
                                );
                            })}
                            <p className={`text-center text-xs ${muted}`}>The Internet chose packet switching — share links, accept variable delay.</p>
                        </motion.div>
                    )}

                    {mode === 'arp' && (
                        <motion.div key="arp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {ARP_STEPS.map((s, i) => {
                                const active = step === i;
                                return (
                                    <motion.div
                                        key={`${s.actor}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            <Search size={16} />
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

                    {mode === 'wifi' && (
                        <motion.div key="wifi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {WIFI_STEPS.map((s, i) => {
                                const active = step === i;
                                return (
                                    <motion.div
                                        key={`${s.actor}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            <Radio size={16} />
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

                    {mode === 'firewall' && (
                        <motion.div key="firewall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {FIREWALL_STEPS.map((s, i) => {
                                const active = step === i;
                                const allow = s.verdict === 'ALLOW';
                                return (
                                    <motion.div
                                        key={`${s.verdict}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${allow ? 'text-emerald-400' : 'text-rose-400'}`}>{s.verdict}</div>
                                        <div className="text-sm font-medium">{s.text}</div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'vpn' && (
                        <motion.div key="vpn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {VPN_STEPS.map((s, i) => {
                                const active = step === i;
                                return (
                                    <motion.div
                                        key={`${s.stage}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            <Lock size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{s.stage}</div>
                                            <div className="text-sm font-medium">{s.text}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'smtp' && (
                        <motion.div key="smtp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {SMTP_STEPS.map((s, i) => {
                                const active = step === i;
                                return (
                                    <motion.div
                                        key={`${s.hop}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35 }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            <Server size={16} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{s.hop}</div>
                                            <div className="text-sm font-medium">{s.text}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {(mode === 'timeline' || (customSteps?.length && !['osi','packet','tcp','dns','routing','ip','delay','throughput','congestion','http','nat','multiplex','circuit','arp','wifi','firewall','vpn','smtp','delivery'].includes(mode))) && customSteps && (
                        <motion.div key={`timeline-${meta.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {customSteps.map((s, i) => {
                                const active = step === i;
                                const actor = s.actor || s.label || `Step ${i + 1}`;
                                const text = s.text || s.detail || s.tip || '';
                                return (
                                    <motion.div
                                        key={`${actor}-${i}`}
                                        animate={{ opacity: step >= i ? 1 : 0.35, x: active ? 0 : -4 }}
                                        className={`flex items-start gap-4 p-4 rounded-2xl border ${active ? 'border-cyan-400/50 bg-cyan-500/10' : card}`}
                                    >
                                        <div className={`mt-0.5 min-w-[4.5rem] px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center ${active ? 'bg-cyan-500 text-white' : 'bg-white/5'}`}>
                                            {actor}
                                        </div>
                                        <div className="text-sm font-medium leading-relaxed pt-0.5">{text}</div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}

                    {mode === 'delivery' && customHops && (
                        <motion.div key={`delivery-${meta.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative flex items-center justify-between gap-1 md:gap-2 px-1 py-8 overflow-x-auto">
                                <div className={`absolute left-6 right-6 top-1/2 h-0.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                {customHops.map((hop, i) => {
                                    const active = step === i;
                                    const done = step > i;
                                    return (
                                        <div key={`${hop.label}-${i}`} className="relative z-10 flex flex-col items-center gap-2 flex-1 min-w-[72px]">
                                            <motion.div
                                                animate={{ scale: active ? 1.12 : 1, opacity: done || active ? 1 : 0.4 }}
                                                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center ${
                                                    active ? 'bg-cyan-500 text-white border-cyan-300 shadow-lg shadow-cyan-500/30'
                                                        : done ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                            : card
                                                }`}
                                            >
                                                {i === 0 ? <Smartphone size={20} /> : i === customHops.length - 1 ? <Server size={20} /> : <Network size={20} />}
                                            </motion.div>
                                            <div className="text-center px-0.5">
                                                <div className="text-[9px] font-black uppercase tracking-wider leading-tight">{hop.label}</div>
                                                {hop.layer && (
                                                    <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-400 mt-0.5">{hop.layer}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <motion.div
                                    className="absolute top-[calc(50%-10px)] w-5 h-5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 z-20 pointer-events-none"
                                    animate={{ left: `calc(${(step / Math.max(customHops.length - 1, 1)) * 100}% - 10px)` }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                                />
                            </div>
                            <div className={`p-4 rounded-2xl border text-center ${card}`}>
                                <p className="text-sm font-medium">
                                    <span className="font-black text-cyan-400">{customHops[step]?.label}</span>
                                    {customHops[step]?.detail ? ` — ${customHops[step].detail}` : ''}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NetworkVisualizer;
