import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./auth/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { PlanProvider } from "./auth/PlanContext";
import "./index.css";

// --- ANTI-ROBOT FIREWALL (v2.0) ---
// Forcefully block all browser-native speech synthesis to guarantee a 100% human-only experience.
if (window.speechSynthesis) {
  const originalSpeak = window.speechSynthesis.speak;
  window.speechSynthesis.speak = function(utterance) {
    if (utterance && utterance.text && utterance.text.trim().length > 0) {
      console.warn("%c[FIREWALL] Robotic voice blocked. System is hard-locked to Human Neural Audio.", "color: #ef4444; font-weight: bold; background: #000; padding: 2px 6px; border-radius: 4px;");
      return; 
    }
    return originalSpeak.apply(window.speechSynthesis, arguments);
  };
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
