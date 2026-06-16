import api from "./api";

export const getLaporan = () => api.get("/laporan").then((r) => r.data);
