import api from "./axios";

export const getMyContributions = () => api.get("/contributions/me");
