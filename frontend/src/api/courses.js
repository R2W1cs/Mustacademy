import api from "./axios";

export const getRecommendedCourses = () => api.get("/courses/recommended");
export const getAllCourses = () => api.get("/courses");
