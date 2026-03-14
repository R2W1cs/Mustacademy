import { useMemo } from "react";
import { Flame, Zap, Calendar, CheckCircle2 } from "lucide-react";

/**
 * StreakWidget — real streak display
 *
 * Props:
 *   streak      {number}  – current streak count from API
 *   lastActive  {string}  – ISO date of last active day
 *   weeklyProgress {Array} – [{day, hours, date}...] from dashboard API (up to 49 days)
 *   isDark      {boolean}
 */
export default function StreakWidget({ streak = 0, lastActive, weeklyProgress = [], isDark, className = "" }) {

    // ── Derive if user was active today ──────────────────────────
    const todayStr = new Date().toISOString().split("T")[0];
    const lastActiveStr = lastActive ? new Date(lastActive).toISOString().split("T")[0] : null;
    const activeToday = lastActiveStr === todayStr;

    // ── Build 28-day activity map from weeklyProgress ─────────────
    // weeklyProgress rows: { day: 'Mon', hours: 0.5, date: '2026-02-28' }
    const activityMap = useMemo(() => {
        const map = {};
        weeklyProgress.forEach((row) => {
            if (row.date) {
                const key = typeof row.date === "string"
                    ? row.date.split("T")[0]
                    : new Date(row.date).toISOString().split("T")[0];
                map[key] = (map[key] || 0) + (row.hours || 0);
            }
        });
        return map;
    }, [weeklyProgress]);

    // Build last 28 days array (newest last)
    const days = useMemo(() => {
        return Array.from({ length: 28 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (27 - i));
            const key = d.toISOString().split("T")[0];
            const hours = activityMap[key] || 0;
            const isToday = key === todayStr;
            return { key, hours, isToday, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
        });
    }, [activityMap, todayStr]);

    // Colour intensity scale
    const cellColor = (hours, isToday) => {
        if (isToday && activeToday) return "bg-gradient-to-br from-[#f59e0b] to-[#f97316] shadow-sm shadow-[#f59e0b]/40 ring-1 ring-[#f59e0b]/50";
        if (isToday) return isDark ? "bg-white/10 ring-1 ring-[#f59e0b]/30" : "bg-black/10 ring-1 ring-[#f59e0b]/30";
        if (hours >= 3) return "bg-gradient-to-br from-[#f59e0b] to-[#f97316] opacity-95";
        if (hours >= 1.5) return "bg-[#f59e0b]/70";
        if (hours >= 0.5) return "bg-[#f59e0b]/40";
        if (hours > 0) return "bg-[#f59e0b]/20";
        return isDark ? "bg-white/[0.06]" : "bg-black/[0.06]";
    };

    // Milestones
    const milestones = [3, 7, 14, 30, 60, 100];
    const nextMilestone = milestones.find((m) => m > streak) || streak + 10;
    const progressToNext = Math.min((streak / nextMilestone) * 100, 100);

    // Streak label
    const flameSize = streak >= 30 ? "text-5xl" : streak >= 7 ? "text-4xl" : "text-3xl";
    const streakColor = streak >= 30
        ? "from-[#ef4444] to-[#f97316]"
        : streak >= 7
            ? "from-[#f59e0b] to-[#f97316]"
            : "from-[#fbbf24] to-[#f59e0b]";

    return (
        <div className={`rounded-2xl border p-6 flex flex-col gap-5 transition-all transform hover:-translate-y-1 ${className} ${isDark
            ? "bg-gradient-to-br from-[#f59e0b]/[0.07] via-[#f97316]/[0.04] to-transparent border-[#f59e0b]/20 ring-1 ring-inset ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-200 ring-1 ring-inset ring-white shadow-xl shadow-indigo-100/20"
            }`}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${streak > 0 ? "text-[#f59e0b]" : "text-gray-500"}`} />
                    <span className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Current Streak
                    </span>
                </div>
                {activeToday ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active Today
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/10">
                        <Calendar className="w-3 h-3" /> Not yet today
                    </span>
                )}
            </div>

            {/* ── Flame counter ── */}
            <div className="flex items-end gap-4">
                <div className="relative">
                    {/* Glow ring behind flame */}
                    {streak > 0 && (
                        <div className="absolute inset-0 rounded-full bg-[#f59e0b]/20 blur-xl scale-150" />
                    )}
                    <span className={`relative ${flameSize} select-none`} style={{ filter: streak > 0 ? "drop-shadow(0 0 10px rgba(245,158,11,0.7))" : "none" }}>
                        {streak > 0 ? "🔥" : "💤"}
                    </span>
                </div>
                <div>
                    <div className={`text-5xl font-black leading-none bg-gradient-to-r ${streakColor} bg-clip-text text-transparent`}>
                        {streak}
                    </div>
                    <div className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {streak === 1 ? "day" : "days"} in a row
                    </div>
                </div>

                {/* Best streak badge */}
                <div className="ml-auto flex flex-col items-end">
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                        <Zap className="w-3 h-3 text-[#f59e0b]" />
                        Next: {nextMilestone}d
                    </div>
                </div>
            </div>

            {/* ── Progress bar toward next milestone ── */}
            <div>
                <div className="flex justify-between text-xs mb-1.5">
                    <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                        {streak} / {nextMilestone} days
                    </span>
                    <span className="text-[#f59e0b] font-semibold">{Math.round(progressToNext)}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-black/[0.07]"}`}>
                    <div
                        className="h-full bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-full transition-all duration-700"
                        style={{ width: `${progressToNext}%` }}
                    />
                </div>
            </div>

            {/* ── 28-day Heatmap ── */}
            <div>
                <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Last 28 days
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                    {days.map((d) => (
                        <div
                            key={d.key}
                            title={`${d.label}: ${d.hours > 0 ? d.hours.toFixed(1) + "h" : "no activity"}`}
                            className={`aspect-square rounded-md cursor-default transition-transform hover:scale-110 ${cellColor(d.hours, d.isToday)}`}
                        />
                    ))}
                </div>
                {/* Legend */}
                <div className={`flex items-center gap-2 mt-2 text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    <span>Less</span>
                    {["bg-white/[0.06]", "bg-[#f59e0b]/20", "bg-[#f59e0b]/40", "bg-[#f59e0b]/70", "bg-gradient-to-br from-[#f59e0b] to-[#f97316]"].map((c, i) => (
                        <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* ── Milestone badges ── */}
            <div className={`pt-4 border-t ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
                <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Milestones</div>
                <div className="flex gap-2 flex-wrap">
                    {milestones.map((m) => {
                        const reached = streak >= m;
                        return (
                            <div
                                key={m}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${reached
                                    ? "bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#f59e0b]"
                                    : isDark
                                        ? "bg-white/[0.03] border-white/[0.06] text-gray-600"
                                        : "bg-gray-100 border-gray-200 text-gray-400"
                                    }`}
                            >
                                {reached ? "🔥" : "🔒"} {m}d
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
