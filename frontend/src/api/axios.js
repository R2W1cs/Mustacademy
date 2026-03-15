import axios from "axios";

const productionApiUrl = "https://mustacademy-backend.onrender.com/api";
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? productionApiUrl : "https://mustacademy-backend.onrender.com/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Sync-ID": SYNC_ID
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
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
