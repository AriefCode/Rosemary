// Cache in-memory sederhana ber-TTL untuk daftar yang sering dipakai lintas halaman
// (dropdown pesanan, navigasi bolak-balik). Bukan pengganti state management —
// hanya menghindari refetch beruntun ke backend dev yang single-threaded.
export function createListCache(ttlMs = 30000) {
  let entry = null; // { data, ts }

  return {
    get() {
      if (entry && Date.now() - entry.ts < ttlMs) return entry.data;
      return null;
    },
    set(data) {
      entry = { data, ts: Date.now() };
    },
    clear() {
      entry = null;
    },
  };
}
