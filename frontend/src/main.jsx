import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./auth/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { PlanProvider } from "./auth/PlanContext";
import "./index.css";


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
