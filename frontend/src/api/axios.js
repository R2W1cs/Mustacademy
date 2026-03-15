import axios from "axios";

const productionApiUrl = "https://mustacademy-backend.onrender.com/api";
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const SYNC_ID = "v11.0_NOCACHE";
const baseURL = (import.meta.env.VITE_API_URL || (isProduction ? productionApiUrl : "http://localhost:5000/api")) + `?v=${SYNC_ID}`;

console.log(`%c[Studio-Uplink] Targeting API: ${baseURL} | SYNC: ${SYNC_ID}`, "color: #6366f1; font-weight: bold; background: #000; padding: 2px 5px; border-radius: 4px;");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Self-Healing Cache Logic
    const savedVersion = localStorage.getItem("STUDIO_SYNC_ID");
    if (savedVersion !== SYNC_ID) {
      console.log(`%c[Studio-Uplink] Newer build detected (${SYNC_ID}). Resetting cache...`, "color: #ef4444; font-weight: bold;");
      localStorage.clear();
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
