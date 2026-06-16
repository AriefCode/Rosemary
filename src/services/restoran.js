import api from "./api";

export const getRestoranList = () => api.get("/restoran").then((r) => r.data);
export const createRestoran = (payload) => api.post("/restoran", payload).then((r) => r.data);
export const updateRestoran = (id, payload) => api.put(`/restoran/${id}`, payload).then((r) => r.data);
export const deleteRestoran = (id) => api.delete(`/restoran/${id}`).then((r) => r.data);
