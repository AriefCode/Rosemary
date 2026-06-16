import api from "./api";

export const getSayurList = () => api.get("/sayur").then((r) => r.data);
export const createSayur = (payload) => api.post("/sayur", payload).then((r) => r.data);
export const updateSayur = (id, payload) => api.put(`/sayur/${id}`, payload).then((r) => r.data);
export const deleteSayur = (id) => api.delete(`/sayur/${id}`).then((r) => r.data);
