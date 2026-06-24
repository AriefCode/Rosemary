import api from "./api";

export const getOrderanList = (params) => api.get("/orderan", { params }).then((r) => r.data);
export const createOrderan = (payload) => api.post("/orderan", payload).then((r) => r.data);
export const updateOrderan = (id, payload) => api.put(`/orderan/${id}`, payload).then((r) => r.data);
export const deleteOrderan = (id) => api.delete(`/orderan/${id}`).then((r) => r.data);
export const selesaiOrderan = (id) => api.patch(`/orderan/${id}/selesai`).then((r) => r.data);
