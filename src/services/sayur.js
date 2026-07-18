import api from "./api";
import { createListCache } from "./cache";

const listCache = createListCache();

// Dipakai modul lain yang mutasinya memengaruhi stok sayur (mis. orderan selesai)
export const clearSayurListCache = () => listCache.clear();

export const getSayurList = () => {
  const cached = listCache.get();
  if (cached) return Promise.resolve(cached);
  return api.get("/sayur").then((r) => {
    listCache.set(r.data);
    return r.data;
  });
};

export const createSayur = (payload) => {
  listCache.clear();
  return api.post("/sayur", payload).then((r) => r.data);
};

export const updateSayur = (id, payload) => {
  listCache.clear();
  return api.put(`/sayur/${id}`, payload).then((r) => r.data);
};

export const deleteSayur = (id) => {
  listCache.clear();
  return api.delete(`/sayur/${id}`).then((r) => r.data);
};
