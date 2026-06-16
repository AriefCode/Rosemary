import { useEffect, useState } from "react";
import { createSayur, deleteSayur, getSayurList, updateSayur } from "../services/sayur";
import { getDaftarBelanja } from "../services/daftarBelanja";
import { useAuth } from "../context/AuthContext";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";

const emptyForm = { nama: "", satuan: "", jumlah_persediaan: 0, batas_minimum: 5 };

export default function PersediaanPage() {
  const { isPemilik } = useAuth();
  const [sayurList, setSayurList] = useState([]);
  const [belanjaList, setBelanjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sayur, belanja] = await Promise.all([getSayurList(), getDaftarBelanja()]);
      setSayurList(sayur);
      setBelanjaList(belanja);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
      satuan: item.satuan,
      jumlah_persediaan: item.jumlah_persediaan,
      batas_minimum: item.batas_minimum,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateSayur(editingId, form);
      } else {
        await createSayur(form);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus sayur ini?")) return;
    try {
      await deleteSayur(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus.");
    }
  };

  const generateBelanja = async () => {
    const data = await getDaftarBelanja();
    setBelanjaList(data);
  };

  if (loading) return <p className="font-body text-text-muted">Memuat persediaan...</p>;

  return (
    <>
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="font-headline-1 text-headline-1 text-primary">Persediaan</h2>
          <p className="font-body text-text-muted mt-1">Kelola seluruh stok barang Rosemary.</p>
        </div>
        {isPemilik && (
          <button onClick={openCreate} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Sayur
          </button>
        )}
      </header>

      {showForm && isPemilik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
            <h3 className="font-headline-2 text-headline-2 text-primary mb-4">{editingId ? "Edit Sayur" : "Tambah Sayur"}</h3>
            {error && <p className="text-error text-sm mb-3">{error}</p>}
            <div className="space-y-4">
              <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama sayur" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <input required value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="Satuan (Kg, Ikat, ...)" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <input required type="number" min="0" value={form.jumlah_persediaan} onChange={(e) => setForm({ ...form, jumlah_persediaan: Number(e.target.value) })} placeholder="Jumlah persediaan" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <input required type="number" min="0" value={form.batas_minimum} onChange={(e) => setForm({ ...form, batas_minimum: Number(e.target.value) })} placeholder="Batas minimum" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold hover:bg-secondary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-outline-variant py-2.5 rounded-lg hover:bg-surface-container-low">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Batas Min.</th>
                <th className="px-6 py-4">Status</th>
                {isPemilik && <th className="px-6 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="font-body text-on-surface">
              {sayurList.map((item, idx) => {
                const status = getSayurStatus(item);
                const { label, className } = statusConfig[status];
                return (
                  <tr key={item.id} className={`hover:bg-background-mint transition-colors ${idx < sayurList.length - 1 ? "border-b border-outline-variant" : ""}`}>
                    <td className="px-6 py-4 font-medium">{item.nama}</td>
                    <td className="px-6 py-4">{item.jumlah_persediaan}</td>
                    <td className="px-6 py-4 text-text-muted">{item.satuan}</td>
                    <td className="px-6 py-4">{item.batas_minimum}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span></td>
                    {isPemilik && (
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEdit(item)} className="text-accent-fern hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                        <button onClick={() => handleDelete(item.id)} className="text-error hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-2 text-headline-2 text-primary">Daftar Belanja Otomatis</h3>
          <button onClick={generateBelanja} className="bg-secondary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-primary transition-colors">
            Generate Ulang
          </button>
        </div>
        {belanjaList.length === 0 ? (
          <p className="p-8 text-center text-text-muted font-body">Tidak ada item yang perlu dibeli saat ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase">
                  <th className="px-6 py-3">Sayur</th>
                  <th className="px-6 py-3">Stok</th>
                  <th className="px-6 py-3">Dibutuhkan</th>
                  <th className="px-6 py-3">Alasan</th>
                </tr>
              </thead>
              <tbody className="font-body">
                {belanjaList.map((item) => (
                  <tr key={item.sayur_id} className="border-b border-outline-variant hover:bg-background-mint">
                    <td className="px-6 py-4">{item.nama} ({item.satuan})</td>
                    <td className="px-6 py-4">{item.stok_saat_ini}</td>
                    <td className="px-6 py-4 font-semibold text-status-warning">{item.jumlah_dibutuhkan}</td>
                    <td className="px-6 py-4 text-text-muted text-sm">{item.alasan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
