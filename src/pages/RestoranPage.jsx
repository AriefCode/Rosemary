import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  createRestoran,
  deleteRestoran,
  getRestoranList,
  updateRestoran,
} from "../services/restoran";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonRow } from "../components/Skeleton";
import FadeContent from "../components/reactbits/FadeContent";

const emptyForm = { nama: "", alamat: "", kontak: "" };

export default function RestoranPage() {
  const toast = useToast();
  const { isPemilik } = useAuth();
  const [restoranList, setRestoranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRestoranList();
      setRestoranList(data);
    } catch {
      toast("Gagal memuat data restoran.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Body scroll lock
  useEffect(() => {
    const locked = showForm || !!confirmDelete;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showForm, confirmDelete]);

  // Escape key for form
  useEffect(() => {
    if (!showForm) return;
    const fn = (e) => { if (e.key === "Escape") setShowForm(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [showForm]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      alamat: item.alamat || "",
      kontak: item.kontak || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        const updated = await updateRestoran(editingId, form);
        setRestoranList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        toast("Data restoran berhasil diperbarui.");
      } else {
        const created = await createRestoran(form);
        setRestoranList((prev) =>
          [...prev, created].sort((a, b) => a.nama.localeCompare(b.nama))
        );
        toast("Restoran berhasil ditambahkan.");
      }
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRestoran(confirmDelete);
      setRestoranList((prev) => prev.filter((r) => r.id !== confirmDelete));
      toast("Restoran berhasil dihapus.");
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menghapus restoran.", "error");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <FadeContent>
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="font-headline-1 text-headline-1 text-primary">Restoran</h2>
            <p className="font-body text-text-muted mt-1">
              {isPemilik ? "Kelola data restoran mitra Rosemary." : "Daftar restoran mitra Rosemary."}
            </p>
          </div>
          {isPemilik && (
            <button
              onClick={openCreate}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Tambah Restoran
            </button>
          )}
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
                {editingId ? "Edit Restoran" : "Tambah Restoran"}
              </h3>
              {formError && (
                <p className="text-error text-sm mb-3 p-3 bg-status-danger-bg rounded-lg">{formError}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="restoran-nama" className="font-label text-sm text-on-surface-variant block mb-1">
                    Nama Restoran
                  </label>
                  <input
                    id="restoran-nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="cth. Warung Hijau"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="restoran-alamat" className="font-label text-sm text-on-surface-variant block mb-1">
                    Alamat <span className="text-text-muted font-normal">(opsional)</span>
                  </label>
                  <input
                    id="restoran-alamat"
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    placeholder="cth. Jl. Melati No. 10"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="restoran-kontak" className="font-label text-sm text-on-surface-variant block mb-1">
                    Kontak / Telepon <span className="text-text-muted font-normal">(opsional)</span>
                  </label>
                  <input
                    id="restoran-kontak"
                    value={form.kontak}
                    onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                    placeholder="cth. 0812-3456-7890"
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors"
                  />
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
        title="Hapus Restoran"
        message="Data restoran ini akan dihapus. Hapus tidak bisa dilakukan jika restoran masih memiliki orderan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <FadeContent delay={0.08}>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4">Kontak</th>
                  {isPemilik && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="font-body text-on-surface">
                {loading ? (
                  [1, 2, 3].map((i) => <SkeletonRow key={i} cols={isPemilik ? 4 : 3} />)
                ) : restoranList.length === 0 ? (
                  <tr>
                    <td colSpan={isPemilik ? 4 : 3} className="px-6 py-14 text-center">
                      <span
                        className="material-symbols-outlined text-5xl text-outline block mb-3"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                      >
                        store
                      </span>
                      <p className="font-headline-3 text-primary mb-1">Belum Ada Restoran</p>
                      <p className="font-body text-sm text-text-muted mb-4">
                        {isPemilik
                          ? "Tambahkan restoran mitra untuk membuat orderan."
                          : "Belum ada restoran mitra yang terdaftar."}
                      </p>
                      {isPemilik && (
                        <button
                          onClick={openCreate}
                          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-secondary transition-colors"
                        >
                          Tambah Restoran
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  restoranList.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-background-mint transition-colors ${
                        idx < restoranList.length - 1 ? "border-b border-outline-variant" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">{item.nama}</td>
                      <td className="px-6 py-4 text-text-muted">{item.alamat || "—"}</td>
                      <td className="px-6 py-4 text-text-muted">{item.kontak || "—"}</td>
                      {isPemilik && (
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
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeContent>
    </>
  );
}
