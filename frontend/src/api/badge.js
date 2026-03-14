import api from "./axios";

export const getMyBadges = () => api.get("/badges");
