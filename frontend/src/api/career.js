import api from "./axios";

export const generateTrajectory = () => api.post("/career/analyze");
export const getCareerRoadmap = () => api.get("/career/roadmap");
