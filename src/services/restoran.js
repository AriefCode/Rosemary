import api from "./api";
import { createListCache } from "./cache";

const listCache = createListCache();

export const getRestoranList = () => {
  const cached = listCache.get();
  if (cached) return Promise.resolve(cached);
  return api.get("/restoran").then((r) => {
    listCache.set(r.data);
    return r.data;
  });
};

export const createRestoran = (payload) => {
  listCache.clear();
  return api.post("/restoran", payload).then((r) => r.data);
};

export const updateRestoran = (id, payload) => {
  listCache.clear();
  return api.put(`/restoran/${id}`, payload).then((r) => r.data);
};

export const deleteRestoran = (id) => {
  listCache.clear();
  return api.delete(`/restoran/${id}`).then((r) => r.data);
};
