import axios from "axios";

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? "https://mustacademy-backend.onrender.com/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!error.response || original?._skipRefresh) {
      return Promise.reject(error);
    }

    const isAuthRoute = original.url?.includes("/auth/login")
      || original.url?.includes("/auth/register")
      || original.url?.includes("/auth/refresh");

    if (error.response.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await api.post("/auth/refresh", null, { _skipRefresh: true });
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
