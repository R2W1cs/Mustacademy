/**
 * Reusable skeleton loading components.
 * Usage: <Skeleton.Text lines={3} /> or <Skeleton.Card /> etc.
 */

const base = "animate-pulse rounded-lg bg-white/5";

function Line({ w = "100%", h = "14px", className = "" }) {
    return <div className={`${base} ${className}`} style={{ width: w, height: h }} />;
}

function Block({ w = "100%", h = "120px", className = "" }) {
    return <div className={`${base} ${className}`} style={{ width: w, height: h }} />;
}

function Text({ lines = 3, className = "" }) {
    const widths = ["100%", "92%", "85%", "78%", "95%"];
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Line key={i} w={widths[i % widths.length]} />
            ))}
        </div>
    );
}

function Card({ className = "" }) {
    return (
        <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4 ${className}`}>
            <Line w="60%" h="20px" />
            <Text lines={3} />
            <div className="flex gap-3 pt-2">
                <Line w="80px" h="32px" className="rounded-xl" />
                <Line w="80px" h="32px" className="rounded-xl" />
            </div>
        </div>
    );
}

function TopicHero() {
    return (
        <div className="space-y-6 mb-24">
            <Line w="120px" h="12px" className="opacity-40" />
            <Block w="70%" h="80px" className="rounded-2xl" />
            <Block w="50%" h="40px" className="rounded-xl" />
            <div className="flex gap-10 pt-4 border-t border-white/5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                        <Line w="80px" h="10px" className="opacity-30" />
                        <Line w="100px" h="16px" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopicContent() {
    return (
        <div className="space-y-8">
            {/* Control bar skeleton */}
            <div className="h-12 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
            {/* Content blocks */}
            {[1, 2, 3].map(i => (
                <Card key={i} />
            ))}
        </div>
    );
}

function DashboardStats() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 animate-pulse">
                    <Line w="40%" h="10px" className="opacity-30" />
                    <Line w="60%" h="28px" />
                    <Line w="80%" h="10px" className="opacity-20" />
                </div>
            ))}
        </div>
    );
}

const Skeleton = { Line, Block, Text, Card, TopicHero, TopicContent, DashboardStats };
export default Skeleton;
