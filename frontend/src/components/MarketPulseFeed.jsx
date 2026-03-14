import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp, TrendingDown, Zap, Globe, Briefcase,
    RefreshCw, ExternalLink, Activity, Filter, AlertTriangle
} from "lucide-react";
import api from "../api/axios";

const CATEGORIES = ["all", "AI", "Cloud", "Security", "Web", "Mobile", "Data"];
const LOCATIONS = ["all", "USA", "Europe", "Asia", "Remote"];

const DEMAND_COLOR = (v) => {
    if (v >= 80) return "text-emerald-400";
    if (v >= 50) return "text-amber-400";
    return "text-rose-400";
};

const SALARY_LABEL = (v) => {
    if (!v) return "N/A";
    return `$${(v / 1000).toFixed(0)}K`;
};

const SignalCard = ({ signal, isDark }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] overflow-hidden ${isDark
            ? "bg-white/[0.03] border-white/[0.06] hover:border-cyan-500/30"
            : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
            }`}
    >
        {/* Glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                    {signal.category && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isDark
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-cyan-50 text-cyan-600 border-cyan-200"
                            }`}>
                            {signal.category}
                        </span>
                    )}
                    {signal.location && (
                        <span className={`text-[9px] font-medium flex items-center gap-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                            <Globe size={10} /> {signal.location}
                        </span>
                    )}
                </div>
                <h3 className={`text-sm font-bold leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                    {signal.title}
                </h3>
            </div>
            {signal.source_url && (
                <a
                    href={signal.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${isDark ? "text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10" : "text-slate-300 hover:text-indigo-600"
                        }`}
                >
                    <ExternalLink size={14} />
                </a>
            )}
        </div>

        {/* Summary */}
        {signal.content_summary && (
            <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {signal.content_summary}
            </p>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <p className={`text-[9px] uppercase font-black tracking-wider mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Demand</p>
                <p className={`text-sm font-black ${DEMAND_COLOR(signal.demand_growth)}`}>
                    {signal.demand_growth >= 50 ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                    {signal.demand_growth ?? "--"}%
                </p>
            </div>
            <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <p className={`text-[9px] uppercase font-black tracking-wider mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Salary</p>
                <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{SALARY_LABEL(signal.salary_value)}</p>
            </div>
            <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                <p className={`text-[9px] uppercase font-black tracking-wider mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Skill Match</p>
                <p className={`text-sm font-black ${DEMAND_COLOR(signal.skill_match)}`}>{signal.skill_match ?? "--"}%</p>
            </div>
        </div>

        {/* Impact Logic */}
        {signal.impact_logic && (
            <div className={`mt-3 rounded-xl p-3 border-l-2 border-cyan-500/50 ${isDark ? "bg-cyan-500/5" : "bg-cyan-50"}`}>
                <p className={`text-[10px] leading-relaxed italic ${isDark ? "text-cyan-300/70" : "text-cyan-700"}`}>
                    <Zap size={10} className="inline mr-1" />
                    {signal.impact_logic}
                </p>
            </div>
        )}
    </motion.div>
);

const EmptyState = ({ isDark, onSync }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
            <Activity className={`w-8 h-8 ${isDark ? "text-white/20" : "text-slate-300"}`} />
        </div>
        <div>
            <p className={`text-sm font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>No market signals cached for this region.</p>
            <p className={`text-xs mt-1 mb-4 ${isDark ? "text-white/20" : "text-slate-300"}`}>Try updating your location or triggering a fresh sync.</p>
            <button
                onClick={onSync}
                className={`flex items-center gap-2 px-6 py-2 mx-auto rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-indigo-600 text-white"}`}
            >
                <RefreshCw size={12} /> Sync Latest Signals
            </button>
        </div>
    </div>
);

const ErrorState = ({ isDark, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-500/10">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <div>
            <p className="text-sm font-bold text-rose-400">Failed to fetch market data.</p>
            <p className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>The market sync service may be offline.</p>
        </div>
        <button
            onClick={onRetry}
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:underline"
        >
            <RefreshCw size={12} /> Retry
        </button>
    </div>
);

export default function MarketPulseFeed({ isDark }) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [category, setCategory] = useState("all");
    const [location, setLocation] = useState("all");
    const [syncing, setSyncing] = useState(false);

    const fetchSignals = async () => {
        setLoading(true);
        setError(false);
        try {
            const params = {};
            if (category !== "all") params.category = category;
            if (location !== "all") params.location = location;
            const res = await api.get("/market/signals", { params });
            setSignals(res.data?.signals || res.data || []);
        } catch (err) {
            console.error("MarketPulseFeed fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async () => {
        setSyncing(true);
        try {
            await api.post("/market/sync", { category: category !== "all" ? category : undefined, location: location !== "all" ? location : undefined });
            await fetchSignals();
        } catch (err) {
            console.error("MarketSync trigger failed:", err);
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchSignals();
    }, [category, location]);

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"
                }`}>
                <div className="flex items-center gap-2">
                    <Filter size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${category === c
                                ? (isDark ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-indigo-600 text-white")
                                : (isDark ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className={`h-5 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map(l => (
                        <button
                            key={l}
                            onClick={() => setLocation(l)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${location === l
                                ? (isDark ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-600 text-white")
                                : (isDark ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={triggerSync}
                        disabled={syncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-40" : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                            }`}
                    >
                        <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                </div>
            </div>

            {/* Signal Count */}
            {!loading && !error && signals.length > 0 && (
                <p className={`text-xs font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    <span className={`font-black ${isDark ? "text-white/60" : "text-slate-700"}`}>{signals.length}</span> market signals loaded
                </p>
            )}

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`rounded-2xl border p-5 h-52 animate-pulse ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-100 border-slate-200"}`} />
                    ))}
                </div>
            ) : error ? (
                <ErrorState isDark={isDark} onRetry={fetchSignals} />
            ) : signals.length === 0 ? (
                <EmptyState isDark={isDark} onSync={triggerSync} />
            ) : (
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {signals.map((s, i) => (
                            <SignalCard key={s.id || i} signal={s} isDark={isDark} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
