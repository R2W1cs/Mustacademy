import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./auth/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { PlanProvider } from "./auth/PlanContext";
import "./index.css";

// --- ANTI-ROBOT FIREWALL (v7.0 TOTAL WAR) ---
// Forcefully block all browser-native speech synthesis. 
// 100% Neural Human Audio or Silence. NEVER Robots.
if (window.speechSynthesis) {
  window.speechSynthesis.speak = function(utterance) {
    console.warn("%c[FIREWALL] Robotic fallback blocked! Use Studio Neural Audio only.", "color: #ef4444; font-weight: bold; background: #000; padding: 2px 6px; border-radius: 4px;");
    return; // Hard drop. No fallback allowed.
  };
  // Stop any current speech
  try { window.speechSynthesis.cancel(); } catch(e) {}
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
