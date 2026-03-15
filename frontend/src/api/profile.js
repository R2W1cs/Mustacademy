import api from "./axios";

export const getMyProfile = () => api.get("/profile/me");
export const updateProfile = (data) => api.put("/profile", data);
