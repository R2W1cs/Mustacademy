import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio, Users, Cpu, MessageSquare, ArrowUp, Plus, X,
    Search, Clock, RefreshCw, Zap, TrendingUp, BookOpen,
    ChevronDown, Loader2, Send, Filter, Globe, ExternalLink,
    TrendingDown, Activity, AlertTriangle
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import api from "../api/axios";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
};

const CATEGORIES = ["all", "AI", "Cloud", "Security", "Web", "Mobile", "Data", "Business"];
const LOCATIONS = ["all", "USA", "Europe", "Asia", "Remote"];

const DEMAND_COLOR = (v) => {
    if (v >= 80) return "text-emerald-400";
    if (v >= 50) return "text-amber-400";
    return "text-rose-400";
};

// ─── Signal Card ──────────────────────────────────────────────────────────────

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
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {signal.category && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${isDark
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            : "bg-cyan-50 text-cyan-600 border-cyan-200"
                        }`}>{signal.category}</span>
                    )}
                    {signal.location && (
                        <span className={`text-[9px] font-medium flex items-center gap-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                            <Globe size={10} /> {signal.location}
                        </span>
                    )}
                    <span className={`text-[9px] flex items-center gap-1 ml-auto ${isDark ? "text-white/20" : "text-slate-300"}`}>
                        <Clock size={9} /> {timeAgo(signal.created_at)}
                    </span>
                </div>
                <h3 className={`text-sm font-bold leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                    {signal.title}
                </h3>
            </div>
            {signal.source_url && (
                <a href={signal.source_url} target="_blank" rel="noopener noreferrer"
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${isDark ? "text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10" : "text-slate-300 hover:text-indigo-600"}`}>
                    <ExternalLink size={14} />
                </a>
            )}
        </div>
        {signal.content_summary && (
            <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                {signal.content_summary}
            </p>
        )}
        <div className="grid grid-cols-3 gap-2">
            {[
                { label: "Demand", value: `${signal.demand_growth ?? "--"}%`, color: DEMAND_COLOR(signal.demand_growth), icon: signal.demand_growth >= 50 ? <TrendingUp size={11} /> : <TrendingDown size={11} /> },
                { label: "Salary", value: signal.salary_value ? `$${(signal.salary_value / 1000).toFixed(0)}K` : "N/A", color: isDark ? "text-white" : "text-slate-900" },
                { label: "Skill Match", value: `${signal.skill_match ?? "--"}%`, color: DEMAND_COLOR(signal.skill_match) },
            ].map(({ label, value, color, icon }) => (
                <div key={label} className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                    <p className={`text-[9px] uppercase font-black tracking-wider mb-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>{label}</p>
                    <p className={`text-sm font-black flex items-center justify-center gap-0.5 ${color}`}>
                        {icon}{value}
                    </p>
                </div>
            ))}
        </div>
        {signal.impact_logic && (
            <div className={`mt-3 rounded-xl p-3 border-l-2 border-cyan-500/50 ${isDark ? "bg-cyan-500/5" : "bg-cyan-50"}`}>
                <p className={`text-[10px] leading-relaxed italic ${isDark ? "text-cyan-300/70" : "text-cyan-700"}`}>
                    <Zap size={10} className="inline mr-1" />{signal.impact_logic}
                </p>
            </div>
        )}
    </motion.div>
);

// ─── Tab 1: Market Signals ────────────────────────────────────────────────────

function MarketSignalsTab({ isDark }) {
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [category, setCategory] = useState("all");
    const [location, setLocation] = useState("all");
    const [syncing, setSyncing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [syncedAt, setSyncedAt] = useState(null);
    const LIMIT = 12;

    const fetchSignals = useCallback(async (cat, loc, pg, append = false) => {
        if (pg === 1) setLoading(true); else setLoadingMore(true);
        setError(false);
        try {
            const params = { limit: LIMIT, offset: (pg - 1) * LIMIT };
            if (cat !== "all") params.category = cat;
            if (loc !== "all") params.location = loc;
            const res = await api.get("/market/signals", { params });
            const rows = res.data?.signals || [];
            setSignals(prev => append ? [...prev, ...rows] : rows);
            setHasMore(rows.length === LIMIT);
            if (!append) setSyncedAt(Date.now());
        } catch {
            setError(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchSignals(category, location, 1, false);
    }, [category, location, fetchSignals]);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchSignals(category, location, next, true);
    };

    const triggerSync = async () => {
        setSyncing(true);
        try {
            await api.post("/market/sync", {
                category: category !== "all" ? category : undefined,
                location: location !== "all" ? location : undefined
            });
            setPage(1);
            await fetchSignals(category, location, 1, false);
            toast.success("Market signals synced");
        } catch {
            toast.error("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Filter bar */}
            <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-2">
                    <Filter size={13} className={isDark ? "text-white/40" : "text-slate-400"} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Category</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${category === c
                                ? (isDark ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-indigo-600 text-white")
                                : (isDark ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                            }`}>{c}</button>
                    ))}
                </div>
                <div className={`h-5 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="flex flex-wrap gap-1.5">
                    {LOCATIONS.map(l => (
                        <button key={l} onClick={() => setLocation(l)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${location === l
                                ? (isDark ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-purple-600 text-white")
                                : (isDark ? "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
                            }`}>{l}</button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-3">
                    {syncedAt && (
                        <span className={`text-[10px] flex items-center gap-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>
                            <Clock size={10} /> synced {timeAgo(syncedAt)}
                        </span>
                    )}
                    <button onClick={triggerSync} disabled={syncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDark
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-40"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                        }`}>
                        <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                        {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                </div>
            </div>

            {!loading && !error && signals.length > 0 && (
                <p className={`text-xs font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    <span className={`font-black ${isDark ? "text-white/60" : "text-slate-700"}`}>{signals.length}</span> signals loaded
                </p>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`rounded-2xl border p-5 h-52 animate-pulse ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-100 border-slate-200"}`} />
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <AlertTriangle className="text-rose-400" size={32} />
                    <p className="text-sm font-bold text-rose-400">Failed to fetch market data.</p>
                    <button onClick={() => fetchSignals(category, location, 1)} className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                        <RefreshCw size={12} /> Retry
                    </button>
                </div>
            ) : signals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <Activity size={32} className={isDark ? "text-white/20" : "text-slate-300"} />
                    <p className={`text-sm font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>No signals for this filter.</p>
                    <button onClick={triggerSync}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-indigo-600 text-white"}`}>
                        <RefreshCw size={12} /> Sync Latest Signals
                    </button>
                </div>
            ) : (
                <>
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {signals.map((s, i) => <SignalCard key={s.id || i} signal={s} isDark={isDark} />)}
                        </AnimatePresence>
                    </motion.div>
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button onClick={loadMore} disabled={loadingMore}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDark
                                    ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 disabled:opacity-40"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                }`}>
                                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                                {loadingMore ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Tab 2: Community ─────────────────────────────────────────────────────────

function CommunityTab({ isDark }) {
    const navigate = useNavigate();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [posting, setPosting] = useState(false);
    const debounceRef = useRef(null);

    const fetchThreads = useCallback(async (q, cursor, append = false) => {
        if (!append) setLoading(true); else setLoadingMore(true);
        try {
            const params = { limit: 10 };
            if (q) params.search = q;
            if (cursor) params.cursor = cursor;
            const res = await api.get("/forum/threads", { params });
            const data = res.data;
            setThreads(prev => append ? [...prev, ...(data.threads || [])] : (data.threads || []));
            setNextCursor(data.nextCursor || null);
        } catch {
            toast.error("Failed to load threads");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchThreads("", null); }, [fetchThreads]);

    const handleSearchChange = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchThreads(val, null), 400);
    };

    const handlePost = async () => {
        if (!newTitle.trim()) return toast.error("Title is required");
        if (!newContent.trim()) return toast.error("Content is required");
        setPosting(true);
        try {
            await api.post("/forum/threads", { title: newTitle.trim(), content: newContent.trim(), type: "discussion" });
            toast.success("Thread posted!");
            setShowCreate(false);
            setNewTitle("");
            setNewContent("");
            fetchThreads(search, null);
        } catch {
            toast.error("Failed to post thread");
        } finally {
            setPosting(false);
        }
    };

    const TYPE_COLORS = {
        discussion: isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-200",
        question: isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-200",
        resource: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200",
    };

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200"}`}>
                    <Search size={14} className={isDark ? "text-white/30" : "text-slate-400"} />
                    <input
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Search discussions..."
                        className={`flex-1 text-sm bg-transparent outline-none ${isDark ? "text-white placeholder:text-white/20" : "text-slate-900 placeholder:text-slate-400"}`}
                    />
                    {search && (
                        <button onClick={() => handleSearchChange("")}>
                            <X size={13} className={isDark ? "text-white/30" : "text-slate-400"} />
                        </button>
                    )}
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
                    <Plus size={14} /> New Thread
                </button>
            </div>

            {/* Create modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`rounded-2xl border p-6 space-y-4 ${isDark ? "bg-white/[0.03] border-indigo-500/20" : "bg-white border-indigo-200 shadow-sm"}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>New Discussion</span>
                            <button onClick={() => setShowCreate(false)}>
                                <X size={16} className={isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-700"} />
                            </button>
                        </div>
                        <input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Thread title..."
                            className={`w-full text-sm font-bold bg-transparent outline-none border-b pb-2 ${isDark ? "border-white/10 text-white placeholder:text-white/20" : "border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
                        />
                        <textarea
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            placeholder="Share your thoughts, question, or resource..."
                            rows={4}
                            className={`w-full text-sm bg-transparent outline-none resize-none ${isDark ? "text-white/80 placeholder:text-white/20" : "text-slate-700 placeholder:text-slate-400"}`}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreate(false)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-700"}`}>
                                Cancel
                            </button>
                            <button onClick={handlePost} disabled={posting}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
                                {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                Post
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Thread list */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`rounded-2xl border p-5 h-24 animate-pulse ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-slate-100 border-slate-200"}`} />
                    ))}
                </div>
            ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <MessageSquare size={32} className={isDark ? "text-white/20" : "text-slate-300"} />
                    <p className={`text-sm font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        {search ? "No threads match your search." : "No discussions yet — start one!"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {threads.map((t, i) => (
                            <motion.button
                                key={t.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => navigate(`/forum/thread/${t.id}`)}
                                className={`w-full text-left rounded-2xl border p-5 transition-all hover:scale-[1.005] ${isDark
                                    ? "bg-white/[0.02] border-white/[0.06] hover:border-indigo-500/30"
                                    : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                                        {(t.username || "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TYPE_COLORS[t.type] || TYPE_COLORS.discussion}`}>
                                                {t.type || "discussion"}
                                            </span>
                                            {t.topic_title && (
                                                <span className={`text-[9px] font-medium ${isDark ? "text-white/30" : "text-slate-400"}`}>
                                                    #{t.topic_title}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-bold leading-snug truncate ${isDark ? "text-white" : "text-slate-900"}`}>{t.title}</p>
                                        <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>{t.content}</p>
                                        <div className={`flex items-center gap-4 mt-2 text-[10px] ${isDark ? "text-white/25" : "text-slate-400"}`}>
                                            <span className="flex items-center gap-1"><ArrowUp size={10} /> {t.upvote_count || 0}</span>
                                            <span className="flex items-center gap-1"><MessageSquare size={10} /> {t.comment_count || 0}</span>
                                            <span className="flex items-center gap-1 ml-auto"><Clock size={9} /> {timeAgo(t.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    {nextCursor && (
                        <div className="flex justify-center pt-2">
                            <button onClick={() => fetchThreads(search, nextCursor, true)} disabled={loadingMore}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isDark
                                    ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 disabled:opacity-40"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                }`}>
                                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                                {loadingMore ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Tab 3: AI Digest ─────────────────────────────────────────────────────────

function DigestTab({ isDark }) {
    const [digest, setDigest] = useState(null);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);

    const fetchAll = async (force = false) => {
        if (force) setRefreshing(true); else setLoading(true);
        try {
            const [digestRes, trendRes] = await Promise.all([
                api.get("/market/digest"),
                api.get("/market/trending")
            ]);
            setDigest(digestRes.data?.digest || null);
            setGeneratedAt(digestRes.data?.generatedAt || null);
            setTrending(trendRes.data?.trending || []);
        } catch {
            toast.error("Failed to load digest");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const maxCount = trending[0]?.count || 1;

    const TECH_COLORS = [
        "from-cyan-500 to-blue-500",
        "from-indigo-500 to-purple-500",
        "from-emerald-500 to-teal-500",
        "from-amber-500 to-orange-500",
        "from-rose-500 to-pink-500",
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
            <p className={`text-sm font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>Synthesizing CS intelligence...</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Digest — 2/3 width */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>AI Generated</span>
                        <h2 className={`text-xl font-black uppercase ${isDark ? "text-white" : "text-slate-900"}`}>This Week in CS</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {generatedAt && (
                            <span className={`text-[10px] flex items-center gap-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>
                                <Clock size={10} /> {timeAgo(generatedAt)}
                            </span>
                        )}
                        <button onClick={() => fetchAll(true)} disabled={refreshing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDark
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 disabled:opacity-40"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                            }`}>
                            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Generating..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {digest ? (
                    <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"}`}>
                        {digest.split('\n\n').filter(p => p.trim()).map((para, i) => (
                            <p key={i} className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"}`}>
                                {para.trim()}
                            </p>
                        ))}
                        <div className={`pt-2 border-t flex items-center gap-2 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                            <Zap size={12} className="text-indigo-400" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-slate-400"}`}>
                                Generated by AI · Cached 6h
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200"}`}>
                        <BookOpen size={32} className={`mx-auto mb-3 ${isDark ? "text-white/20" : "text-slate-300"}`} />
                        <p className={`text-sm font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>No digest yet.</p>
                        <p className={`text-xs mt-1 mb-4 ${isDark ? "text-white/20" : "text-slate-400"}`}>Sync market signals first to generate a digest.</p>
                    </div>
                )}

                {/* CS Topics of the Week */}
                <div className={`rounded-2xl border p-5 ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? "text-white/30" : "text-slate-400"}`}>Essential CS Topics to Master in 2025</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { area: "LLMs & Prompt Engineering", tag: "AI", heat: 98 },
                            { area: "Distributed Systems", tag: "Backend", heat: 91 },
                            { area: "Kubernetes & Cloud Native", tag: "DevOps", heat: 87 },
                            { area: "RAG & Vector Databases", tag: "AI/Data", heat: 85 },
                            { area: "WebAssembly (WASM)", tag: "Web", heat: 76 },
                            { area: "Rust Systems Programming", tag: "Systems", heat: 74 },
                            { area: "Zero-Knowledge Proofs", tag: "Security", heat: 68 },
                            { area: "Edge Computing & IoT", tag: "Infra", heat: 65 },
                        ].map(({ area, tag, heat }, i) => (
                            <div key={area} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-slate-50"}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 bg-gradient-to-br ${TECH_COLORS[i % TECH_COLORS.length]} text-white`}>
                                    {heat}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-bold truncate ${isDark ? "text-white/80" : "text-slate-800"}`}>{area}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-wider ${isDark ? "text-white/25" : "text-slate-400"}`}>{tag}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Tech Sidebar */}
            <div className="space-y-4">
                <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>From Signals</span>
                    <h2 className={`text-xl font-black uppercase ${isDark ? "text-white" : "text-slate-900"}`}>Trending Tech</h2>
                </div>

                <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"}`}>
                    {trending.length === 0 ? (
                        <p className={`text-xs text-center py-8 ${isDark ? "text-white/20" : "text-slate-400"}`}>No trend data yet. Sync signals to populate.</p>
                    ) : trending.map(({ word, count }, i) => (
                        <div key={word} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-bold capitalize ${isDark ? "text-white/70" : "text-slate-700"}`}>{word}</span>
                                <span className={`text-[9px] font-black ${isDark ? "text-white/25" : "text-slate-400"}`}>{count}×</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.04 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${TECH_COLORS[i % TECH_COLORS.length]}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* New Technologies Radar */}
                <div className={`rounded-2xl border p-5 ${isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? "text-white/30" : "text-slate-400"}`}>Emerging Tech Radar</p>
                    <div className="space-y-2">
                        {[
                            { name: "Agentic AI", stage: "Adopt", color: "text-emerald-400" },
                            { name: "Quantum ML", stage: "Trial", color: "text-amber-400" },
                            { name: "Neuromorphic", stage: "Assess", color: "text-blue-400" },
                            { name: "Bio-Computing", stage: "Hold", color: "text-rose-400" },
                            { name: "Optical Compute", stage: "Assess", color: "text-purple-400" },
                            { name: "6G Protocols", stage: "Trial", color: "text-cyan-400" },
                        ].map(({ name, stage, color }) => (
                            <div key={name} className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${isDark ? "text-white/60" : "text-slate-700"}`}>{name}</span>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${color}`}>{stage}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
    { id: "signals", label: "Market Signals", icon: Radio },
    { id: "community", label: "Community", icon: Users },
    { id: "digest", label: "AI Digest", icon: Cpu },
];

export default function ForumHub() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeTab, setActiveTab] = useState("signals");

    return (
        <div className={`min-h-screen pt-16 pb-32 px-5 lg:px-12 transition-colors duration-300 ${isDark ? 'bg-[#050810]' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] block ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>Synaptic Intelligence Hub</span>
                        <h1 className={`text-2xl font-black tracking-tight uppercase leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>CS Intel</h1>
                    </div>
                </div>
                <p className={`text-sm ml-16 ${isDark ? "text-white/30" : "text-slate-500"}`}>
                    Market signals · Community · AI-synthesized trends — everything CS in one place
                </p>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 p-1 rounded-2xl mb-8 w-fit border ${isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"}`}>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === id
                            ? (isDark ? "bg-white/10 text-white" : "bg-indigo-600 text-white shadow-sm")
                            : (isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-700")
                        }`}
                    >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="pb-32"
                >
                    {activeTab === "signals" && <MarketSignalsTab isDark={isDark} />}
                    {activeTab === "community" && <CommunityTab isDark={isDark} />}
                    {activeTab === "digest" && <DigestTab isDark={isDark} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
