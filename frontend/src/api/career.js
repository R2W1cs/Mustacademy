import api from "./axios";

export const generateTrajectory = () => api.post("/career/analyze");
export const getCareerRoadmap = () => api.get("/career/roadmap");
export const generateFullRoadmap = (career) => api.post("/career/roadmap/generate", { career });
