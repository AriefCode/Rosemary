import { useEffect, useState } from "react";
import {
  createRestoran,
  deleteRestoran,
  getRestoranList,
  updateRestoran,
} from "../services/restoran";

const emptyForm = { nama: "", alamat: "", kontak: "" };

export default function RestoranPage() {
  const [restoranList, setRestoranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRestoranList();
      setRestoranList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      alamat: item.alamat || "",
      kontak: item.kontak || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateRestoran(editingId, form);
      } else {
        await createRestoran(form);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus restoran ini?")) return;
    try {
      await deleteRestoran(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus.");
    }
  };

  if (loading) {
    return <p className="font-body text-text-muted">Memuat restoran...</p>;
  }

  return (
    <>
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="font-headline-1 text-headline-1 text-primary">Restoran</h2>
          <p className="font-body text-text-muted mt-1">Kelola data restoran mitra Rosemary.</p>
        </div>
        <button onClick={openCreate} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Restoran
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
            <h3 className="font-headline-2 text-headline-2 text-primary mb-4">{editingId ? "Edit Restoran" : "Tambah Restoran"}</h3>
            {error && <p className="text-error text-sm mb-3">{error}</p>}
            <div className="space-y-4">
              <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama restoran" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <input value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} placeholder="Kontak (telepon)" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold hover:bg-secondary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-outline-variant py-2.5 rounded-lg hover:bg-surface-container-low">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body text-on-surface">
              {restoranList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">Belum ada data restoran.</td>
                </tr>
              ) : (
                restoranList.map((item, idx) => (
                  <tr key={item.id} className={`hover:bg-background-mint transition-colors ${idx < restoranList.length - 1 ? "border-b border-outline-variant" : ""}`}>
                    <td className="px-6 py-4 font-medium">{item.nama}</td>
                    <td className="px-6 py-4 text-text-muted">{item.alamat || "—"}</td>
                    <td className="px-6 py-4 text-text-muted">{item.kontak || "—"}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(item)} className="text-accent-fern hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                      <button onClick={() => handleDelete(item.id)} className="text-error hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
