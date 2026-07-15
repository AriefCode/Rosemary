import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createSayur, deleteSayur, getSayurList, updateSayur } from "../services/sayur";
import { getDaftarBelanja } from "../services/daftarBelanja";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonRow } from "../components/Skeleton";
import FadeContent from "../components/reactbits/FadeContent";

const emptyForm = { nama: "", satuan: "", jumlah_persediaan: 0, batas_minimum: 5, gambar: null };
const MAX_GAMBAR_SIZE = 2 * 1024 * 1024; // 2MB, samakan dengan batas validasi backend
const GAMBAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PersediaanPage() {
  const toast = useToast();
  const [sayurList, setSayurList] = useState([]);
  const [belanjaList, setBelanjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [gambarPreview, setGambarPreview] = useState(null);
  const [hapusGambar, setHapusGambar] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sayur, belanja] = await Promise.all([getSayurList(), getDaftarBelanja()]);
      setSayurList(sayur);
      setBelanjaList(belanja);
    } catch {
      toast("Gagal memuat data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Body scroll lock
  useEffect(() => {
    const locked = showForm || !!confirmDelete || !!lightboxImage;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showForm, confirmDelete, lightboxImage]);

  // Escape key for form
  useEffect(() => {
    if (!showForm) return;
    const fn = (e) => { if (e.key === "Escape") setShowForm(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [showForm]);

  // Escape key for lightbox gambar
  useEffect(() => {
    if (!lightboxImage) return;
    const fn = (e) => { if (e.key === "Escape") setLightboxImage(null); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [lightboxImage]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setGambarPreview(null);
    setHapusGambar(false);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      satuan: item.satuan,
      jumlah_persediaan: item.jumlah_persediaan,
      batas_minimum: item.batas_minimum,
      gambar: null,
    });
    setFormError("");
    setGambarPreview(item.gambar_url || null);
    setHapusGambar(false);
    setShowForm(true);
  };

  // Preview lokal untuk file yang baru dipilih (belum diupload) — object URL
  // dibersihkan begitu file diganti/form ditutup agar tidak bocor memori.
  useEffect(() => {
    if (!(form.gambar instanceof File)) return;
    const url = URL.createObjectURL(form.gambar);
    setGambarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.gambar]);

  const handleGambarChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!GAMBAR_MIME_TYPES.includes(file.type)) {
      setFormError("Format gambar harus JPEG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_GAMBAR_SIZE) {
      setFormError("Ukuran gambar maksimal 2MB.");
      return;
    }

    setFormError("");
    setHapusGambar(false);
    setForm((f) => ({ ...f, gambar: file }));
  };

  const handleRemoveGambar = () => {
    setForm((f) => ({ ...f, gambar: null }));
    setGambarPreview(null);
    setHapusGambar(true);
  };

  // Daftar belanja bergantung logika server, jadi tetap di-refetch setelah mutasi;
  // daftar sayur cukup di-update lokal dari respons API (tanpa flash skeleton).
  const refreshBelanja = () => {
    getDaftarBelanja().then(setBelanjaList).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        const updated = await updateSayur(editingId, { ...form, hapus_gambar: hapusGambar });
        setSayurList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast("Data sayur berhasil diperbarui.");
      } else {
        const created = await createSayur(form);
        setSayurList((prev) =>
          [...prev, created].sort((a, b) => a.nama.localeCompare(b.nama))
        );
        toast("Sayur berhasil ditambahkan.");
      }
      setShowForm(false);
      refreshBelanja();
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSayur(confirmDelete);
      setSayurList((prev) => prev.filter((s) => s.id !== confirmDelete));
      toast("Sayur berhasil dihapus.");
      refreshBelanja();
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menghapus sayur.", "error");
    }
    setConfirmDelete(null);
  };

  const generateBelanja = async () => {
    try {
      const data = await getDaftarBelanja();
      setBelanjaList(data);
      toast("Daftar belanja diperbarui.");
    } catch {
      toast("Gagal memperbarui daftar belanja.", "error");
    }
  };

  return (
    <>
      <FadeContent>
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="font-headline-1 text-headline-1 text-primary">Persediaan</h2>
            <p className="font-body text-text-muted mt-1">Kelola seluruh stok barang Rosemary.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Sayur
          </button>
        </header>
      </FadeContent>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-headline-2 text-headline-2 text-primary mb-4">
                {editingId ? "Edit Sayur" : "Tambah Sayur"}
              </h3>
              {formError && (
                <p className="text-error text-sm mb-3 p-3 bg-status-danger-bg rounded-lg">{formError}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label className="font-label text-sm text-on-surface-variant block mb-1">
                    Gambar Sayur
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                      {gambarPreview ? (
                        <img
                          src={gambarPreview}
                          alt={form.nama ? `Pratinjau ${form.nama}` : "Pratinjau gambar sayur"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined text-3xl text-outline"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                          image
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label
                        htmlFor="sayur-gambar"
                        className="inline-block cursor-pointer text-sm font-body text-accent-fern hover:text-primary border border-outline-variant rounded-lg px-3 py-2 transition-colors"
                      >
                        {gambarPreview ? "Ganti Gambar" : "Unggah Gambar"}
                      </label>
                      <input
                        id="sayur-gambar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleGambarChange}
                        className="hidden"
                      />
                      {gambarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveGambar}
                          className="block text-xs text-error hover:text-[#7f1d1d] transition-colors"
                        >
                          Hapus gambar
                        </button>
                      )}
                      <p className="text-xs text-text-muted">JPEG/PNG/WEBP, maks. 2MB.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="sayur-nama" className="font-label text-sm text-on-surface-variant block mb-1">
                    Nama Sayur
                  </label>
                  <input
                    id="sayur-nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="cth. Bayam"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="sayur-satuan" className="font-label text-sm text-on-surface-variant block mb-1">
                    Satuan
                  </label>
                  <input
                    id="sayur-satuan"
                    required
                    value={form.satuan}
                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                    placeholder="cth. Kg, Ikat, Pcs"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="sayur-jumlah" className="font-label text-sm text-on-surface-variant block mb-1">
                    Jumlah Persediaan
                  </label>
                  <input
                    id="sayur-jumlah"
                    required
                    type="number"
                    min="0"
                    value={form.jumlah_persediaan}
                    onChange={(e) => setForm({ ...form, jumlah_persediaan: Number(e.target.value) })}
                    placeholder="cth. 25"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="sayur-batas" className="font-label text-sm text-on-surface-variant block mb-1">
                    Batas Minimum Stok
                  </label>
                  <input
                    id="sayur-batas"
                    required
                    type="number"
                    min="0"
                    value={form.batas_minimum}
                    onChange={(e) => setForm({ ...form, batas_minimum: Number(e.target.value) })}
                    placeholder="cth. 5"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Stok di bawah angka ini akan ditandai "menipis".
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-outline-variant py-2.5 rounded-lg hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
                >
                  Batal
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmDelete}
        title="Hapus Sayur"
        message="Data sayur ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Lightbox gambar sayur */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative max-w-2xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                title="Tutup"
                className="absolute -top-4 -right-4 bg-surface-container-lowest text-on-surface rounded-full w-9 h-9 flex items-center justify-center shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                className="w-full h-full max-h-[85vh] object-contain rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              />
              <p className="text-center text-on-primary font-body mt-2">{lightboxImage.alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabel sayur */}
      <FadeContent delay={0.08}>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Gambar</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Satuan</th>
                  <th className="px-6 py-4">Batas Min.</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-body text-on-surface">
                {loading ? (
                  [1, 2, 3, 4].map((i) => <SkeletonRow key={i} cols={7} />)
                ) : sayurList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <span className="material-symbols-outlined text-5xl text-outline block mb-3" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                        inventory_2
                      </span>
                      <p className="font-headline-3 text-primary mb-1">Belum Ada Sayur</p>
                      <p className="font-body text-sm text-text-muted mb-4">Tambahkan data sayur untuk mulai melacak stok.</p>
                      <button
                        onClick={openCreate}
                        className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-secondary transition-colors"
                      >
                        Tambah Sayur
                      </button>
                    </td>
                  </tr>
                ) : (
                  sayurList.map((item, idx) => {
                    const status = getSayurStatus(item);
                    const { label, className } = statusConfig[status];
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-background-mint transition-colors ${
                          idx < sayurList.length - 1 ? "border-b border-outline-variant" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          {item.gambar_url ? (
                            <button
                              type="button"
                              onClick={() => setLightboxImage({ url: item.gambar_url, alt: item.nama })}
                              title="Lihat gambar lebih jelas"
                              className="group relative w-11 h-11 rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
                            >
                              <img
                                src={item.gambar_url}
                                alt={item.nama}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <span
                                  className="material-symbols-outlined text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                                >
                                  zoom_in
                                </span>
                              </span>
                            </button>
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden flex items-center justify-center">
                              <span
                                className="material-symbols-outlined text-lg text-outline"
                                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                              >
                                image
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{item.nama}</td>
                        <td className="px-6 py-4">{item.jumlah_persediaan}</td>
                        <td className="px-6 py-4 text-text-muted">{item.satuan}</td>
                        <td className="px-6 py-4">{item.batas_minimum}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${className}`}>
                            {label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-accent-fern hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern rounded"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(item.id)}
                            className="text-error hover:text-[#7f1d1d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error rounded"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeContent>

      {/* Daftar Belanja */}
      <FadeContent delay={0.16}>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-2 text-headline-2 text-primary">Daftar Belanja Otomatis</h3>
            <button
              onClick={generateBelanja}
              className="bg-secondary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
            >
              Generate Ulang
            </button>
          </div>
          {belanjaList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                shopping_bag
              </span>
              <div>
                <p className="font-headline-3 text-primary">Semua Stok Cukup</p>
                <p className="font-body text-sm text-text-muted mt-1">Tidak ada item yang perlu dibeli saat ini.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Sayur</th>
                    <th className="px-6 py-3">Stok</th>
                    <th className="px-6 py-3">Dibutuhkan</th>
                    <th className="px-6 py-3">Alasan</th>
                  </tr>
                </thead>
                <tbody className="font-body">
                  {belanjaList.map((item) => (
                    <tr
                      key={item.sayur_id}
                      className="border-b border-outline-variant hover:bg-background-mint transition-colors"
                    >
                      <td className="px-6 py-4">
                        {item.nama}{" "}
                        <span className="text-text-muted text-xs">({item.satuan})</span>
                      </td>
                      <td className="px-6 py-4">{item.stok_saat_ini}</td>
                      <td className="px-6 py-4 font-semibold text-[#854D0E]">{item.jumlah_dibutuhkan}</td>
                      <td className="px-6 py-4 text-text-muted text-sm">{item.alasan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeContent>
    </>
  );
}
