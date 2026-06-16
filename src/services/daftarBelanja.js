import api from "./api";

export const getDaftarBelanja = () => api.get("/daftar-belanja").then((r) => r.data);
