import { Component } from "react";

const CHUNK_RELOAD_AT = "must_chunk_reload_at";
const RELOAD_COOLDOWN_MS = 15000;

function isChunkLoadError(error) {
    const msg = String(error?.message || error || "");
    return (
        /Failed to fetch dynamically imported module/i.test(msg) ||
        /Importing a module script failed/i.test(msg) ||
        /error loading dynamically imported module/i.test(msg) ||
        /ChunkLoadError/i.test(msg) ||
        error?.name === "ChunkLoadError"
    );
}

function hardReloadForChunk() {
    try {
        const last = Number(sessionStorage.getItem(CHUNK_RELOAD_AT) || 0);
        const now = Date.now();
        if (now - last < RELOAD_COOLDOWN_MS) return false;
        sessionStorage.setItem(CHUNK_RELOAD_AT, String(now));
    } catch {
        /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("_cb", String(Date.now()));
    window.location.replace(url.pathname + url.search + url.hash);
    return true;
}

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, isChunkError: false };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            isChunkError: isChunkLoadError(error),
        };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary] Caught:", error, info.componentStack);
        if (isChunkLoadError(error)) {
            hardReloadForChunk();
        }
    }

    handleRetry = () => {
        if (this.state.isChunkError) {
            try {
                sessionStorage.removeItem(CHUNK_RELOAD_AT);
            } catch {
                /* ignore */
            }
            const url = new URL(window.location.href);
            url.searchParams.set("_cb", String(Date.now()));
            window.location.replace(url.pathname + url.search + url.hash);
            return;
        }
        this.setState({ hasError: false, error: null, isChunkError: false });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        const { fallback } = this.props;
        if (fallback) return fallback;

        const chunkHint = this.state.isChunkError
            ? "A new version of the app was deployed. Reload to load the latest files."
            : this.state.error?.message || "An unexpected error occurred in this section.";

        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <span className="text-red-400 text-2xl font-black">!</span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
                    Something went wrong
                </h2>
                <p className="text-sm text-slate-500 mb-8 max-w-sm">
                    {chunkHint}
                </p>
                <button
                    onClick={this.handleRetry}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                    {this.state.isChunkError ? "Reload App" : "Try Again"}
                </button>
            </div>
        );
    }
}
