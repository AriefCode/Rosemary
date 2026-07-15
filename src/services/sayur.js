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

// gambar hanya diikutkan sebagai FormData ketika berupa File baru (upload) —
// payload lain tetap dikirim JSON biasa agar tidak mengubah tipe field numerik.
const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || key === "hapus_gambar") return;
    if (key === "gambar") {
      if (value instanceof File) formData.append("gambar", value);
      return;
    }
    if (value === null) return;
    formData.append(key, value);
  });
  return formData;
};

export const createSayur = (payload) => {
  listCache.clear();
  const hasNewImage = payload.gambar instanceof File;
  if (!hasNewImage) {
    const { gambar, ...rest } = payload;
    return api.post("/sayur", rest).then((r) => r.data);
  }
  return api
    .post("/sayur", toFormData(payload), {
      // Content-Type harus dikosongkan (bukan diisi manual) agar browser
      // yang mengisi boundary multipart secara otomatis saat request dikirim.
      headers: { "Content-Type": undefined },
    })
    .then((r) => r.data);
};

export const updateSayur = (id, payload) => {
  listCache.clear();
  const hasNewImage = payload.gambar instanceof File;
  const hasRemoveFlag = payload.hapus_gambar === true;

  if (!hasNewImage && !hasRemoveFlag) {
    const { gambar, hapus_gambar, ...rest } = payload;
    return api.put(`/sayur/${id}`, rest).then((r) => r.data);
  }

  // HTML/PHP tidak parse body multipart pada request PUT asli, jadi pakai
  // method-spoofing (_method) — pola standar Laravel untuk upload file saat update.
  const formData = toFormData(payload);
  formData.append("_method", "PUT");
  if (hasRemoveFlag) formData.append("hapus_gambar", "1");
  return api
    .post(`/sayur/${id}`, formData, {
      headers: { "Content-Type": undefined },
    })
    .then((r) => r.data);
};

export const deleteSayur = (id) => {
  listCache.clear();
  return api.delete(`/sayur/${id}`).then((r) => r.data);
};
