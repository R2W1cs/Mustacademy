import axios from "axios";

const productionApiUrl = "https://mustacademy-backend.onrender.com/api";
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? productionApiUrl : "http://localhost:5000/api");

const SYNC_ID = "HUMAN_SOUND_v5_ULTIMATE";
console.log(`%c[Studio-Uplink] Targeting API: ${baseURL} | SYNC: ${SYNC_ID}`, "color: #f59e0b; font-weight: bold; background: #000; padding: 2px 5px; border-radius: 4px;");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
