import axios from "axios";

const productionApiUrl = "https://mustacademy-backend.onrender.com/api";
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? "https://mustacademy-backend.onrender.com/api" : "http://localhost:3001/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Authentication failed, clearing credentials.");
      localStorage.removeItem("token");
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
