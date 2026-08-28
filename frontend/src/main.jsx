import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./auth/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { PlanProvider } from "./auth/PlanContext";
import { initSentry } from "./monitoring/sentry";
import "./index.css";

initSentry();

// Vite fires this when a lazy chunk 404s after a new deploy.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForNewDeploy();
});

window.addEventListener("error", (event) => {
  const target = event?.target;
  const src = target?.src || target?.href;
  if (src && /\/assets\/[^?]+\.js(\?|$)/.test(src)) {
    reloadForNewDeploy();
  }
}, true);

function reloadForNewDeploy() {
  try {
    const key = "must_chunk_reload_at";
    const last = Number(sessionStorage.getItem(key) || 0);
    const now = Date.now();
    if (now - last < 15000) return;
    sessionStorage.setItem(key, String(now));
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("_cb", String(Date.now()));
  window.location.replace(url.pathname + url.search + url.hash);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PlanProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PlanProvider>
    </AuthProvider>
  </React.StrictMode>
);
