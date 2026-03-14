import axios from "axios";

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const productionApiUrl = "https://mustacademy-backend.onrender.com/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProduction ? productionApiUrl : "http://localhost:5000/api"),
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
