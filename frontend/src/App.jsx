import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary";
import SkipToContent from "./components/a11y/SkipToContent";

export default function App() {
  // Allow one auto-reload per deploy-related chunk miss (see ErrorBoundary).
  useEffect(() => {
    try {
      sessionStorage.removeItem("must_chunk_reload");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <BrowserRouter>
      <SkipToContent />
      <ErrorBoundary>
        <AppRoutes />
        <Analytics />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#18181b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#6366f1', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
