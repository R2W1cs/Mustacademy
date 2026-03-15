import axios from "axios";

const productionApiUrl = "https://mustacademy-backend.onrender.com/api";
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const SYNC_ID = "v13.0_AUTH_PRESERVED";
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? productionApiUrl : "http://localhost:5000/api");

console.log(`%c[Studio-Uplink] Targeting API: ${baseURL} | SYNC: ${SYNC_ID}`, "color: #6366f1; font-weight: bold; background: #000; padding: 2px 5px; border-radius: 4px;");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Sync-ID": SYNC_ID
  },
});

api.interceptors.request.use(
  (config) => {
    // Self-Healing Cache Logic
    const savedVersion = localStorage.getItem("STUDIO_SYNC_ID");
    if (savedVersion !== SYNC_ID) {
      console.log(`%c[Studio-Uplink] Newer build detected (${SYNC_ID}). Resetting cache...`, "color: #ef4444; font-weight: bold;");
      
      // PRESERVE AUTH
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      
      localStorage.clear();
      
      // RESTORE AUTH
      if (token) localStorage.setItem("token", token);
      if (userId) localStorage.setItem("userId", userId);
      if (userName) localStorage.setItem("userName", userName);
      
      localStorage.setItem("STUDIO_SYNC_ID", SYNC_ID);
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
