import { Component } from "react";

const CHUNK_RELOAD_KEY = "must_chunk_reload";

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

        // After a deploy, open tabs keep old hashed chunk URLs. Hard-reload once
        // so the browser picks up the new index.html + asset map.
        if (isChunkLoadError(error)) {
            try {
                const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY);
                if (!alreadyReloaded) {
                    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
                    window.location.reload();
                    return;
                }
            } catch {
                // sessionStorage unavailable — fall through to UI
            }
        }
    }

    handleRetry = () => {
        if (this.state.isChunkError) {
            try {
                sessionStorage.removeItem(CHUNK_RELOAD_KEY);
            } catch {
                /* ignore */
            }
            window.location.reload();
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
