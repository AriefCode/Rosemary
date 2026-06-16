import api from "./api";

export const getOrderanList = (params) => api.get("/orderan", { params }).then((r) => r.data);
export const createOrderan = (payload) => api.post("/orderan", payload).then((r) => r.data);
export const prosesOrderan = (id) => api.patch(`/orderan/${id}/proses`).then((r) => r.data);
export const selesaiOrderan = (id) => api.patch(`/orderan/${id}/selesai`).then((r) => r.data);
