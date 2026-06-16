import { useEffect, useState } from "react";
import { createOrderan, getOrderanList, prosesOrderan, selesaiOrderan } from "../services/orderan";
import { getRestoranList } from "../services/restoran";
import { getSayurList } from "../services/sayur";

const statusLabels = {
  draft: { label: "Draft", className: "bg-surface-container-high text-on-surface-variant" },
  diproses: { label: "Diproses", className: "bg-status-warning-bg text-[#854D0E]" },
  selesai: { label: "Selesai", className: "bg-status-success-bg text-status-success" },
};

export default function PesananPage() {
  const [orderanList, setOrderanList] = useState([]);
  const [restoranList, setRestoranList] = useState([]);
  const [sayurList, setSayurList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    restoran_id: "",
    tanggal_orderan: new Date().toISOString().split("T")[0],
    items: [{ sayur_id: "", jumlah: 1, satuan: "" }],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [orderan, restoran, sayur] = await Promise.all([
        getOrderanList(params),
        getRestoranList(),
        getSayurList(),
      ]);
      setOrderanList(orderan);
      setRestoranList(restoran);
      setSayurList(sayur);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterStatus]);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { sayur_id: "", jumlah: 1, satuan: "" }] });
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === "sayur_id") {
      const sayur = sayurList.find((s) => s.id === Number(value));
      if (sayur) items[index].satuan = sayur.satuan;
    }
    setForm({ ...form, items });
  };

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = {
        restoran_id: Number(form.restoran_id),
        tanggal_orderan: form.tanggal_orderan,
        items: form.items.map((item) => ({
          sayur_id: Number(item.sayur_id),
          jumlah: Number(item.jumlah),
          satuan: item.satuan,
        })),
      };
      await createOrderan(payload);
      setShowForm(false);
      setForm({
        restoran_id: "",
        tanggal_orderan: new Date().toISOString().split("T")[0],
        items: [{ sayur_id: "", jumlah: 1, satuan: "" }],
      });
      setMessage("Orderan berhasil dibuat.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat orderan.");
    }
  };

  const handleProses = async (id) => {
    setMessage("");
    setError("");
    try {
      await prosesOrderan(id);
      setMessage("Orderan sedang diproses.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memproses orderan.");
    }
  };

  const handleSelesai = async (id) => {
    setMessage("");
    setError("");
    try {
      await selesaiOrderan(id);
      setMessage("Orderan selesai. Stok telah dikurangi otomatis.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyelesaikan orderan.");
    }
  };

  if (loading) return <p className="font-body text-text-muted">Memuat pesanan...</p>;

  return (
    <>
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="font-headline-1 text-headline-1 text-primary">Pesanan</h2>
          <p className="font-body text-text-muted mt-1">Daftar dan status pesanan masuk.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          Buat Orderan
        </button>
      </header>

      {message && <div className="mb-4 p-3 rounded-lg bg-status-success-bg text-status-success font-body text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 rounded-lg bg-status-danger-bg text-[#991B1B] font-body text-sm">{error}</div>}

      <div className="mb-4 flex gap-2">
        {["", "draft", "diproses", "selesai"].map((s) => (
          <button key={s || "all"} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-body border transition-colors ${filterStatus === s ? "bg-primary text-on-primary border-primary" : "border-outline-variant hover:bg-surface-container-low"}`}>
            {s === "" ? "Semua" : statusLabels[s]?.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant my-8">
            <h3 className="font-headline-2 text-headline-2 text-primary mb-4">Buat Orderan Baru</h3>
            <div className="space-y-4">
              <select required value={form.restoran_id} onChange={(e) => setForm({ ...form, restoran_id: e.target.value })} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body">
                <option value="">Pilih Restoran</option>
                {restoranList.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
              </select>
              <input required type="date" value={form.tanggal_orderan} onChange={(e) => setForm({ ...form, tanggal_orderan: e.target.value })} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body" />
              <div className="space-y-3">
                <p className="font-label text-label text-on-surface-variant">Detail Item</p>
                {form.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select required value={item.sayur_id} onChange={(e) => updateItem(index, "sayur_id", e.target.value)} className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-sm">
                      <option value="">Pilih sayur</option>
                      {sayurList.map((s) => <option key={s.id} value={s.id}>{s.nama} (stok: {s.jumlah_persediaan})</option>)}
                    </select>
                    <input required type="number" min="1" value={item.jumlah} onChange={(e) => updateItem(index, "jumlah", e.target.value)} className="w-20 px-2 py-2 border border-outline-variant rounded-lg text-sm" />
                    <input required value={item.satuan} readOnly className="w-16 px-2 py-2 border border-outline-variant rounded-lg text-sm bg-surface-container-low" />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="text-error"><span className="material-symbols-outlined">remove_circle</span></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-sm text-secondary hover:underline">+ Tambah item</button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-bold hover:bg-secondary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-outline-variant py-2.5 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant overflow-hidden">
        {orderanList.length === 0 ? (
          <p className="p-8 text-center text-text-muted font-body">Belum ada orderan.</p>
        ) : (
          <div className="divide-y divide-outline-variant">
            {orderanList.map((order) => {
              const st = statusLabels[order.status] || statusLabels.draft;
              return (
                <div key={order.id} className="p-6 hover:bg-background-mint/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-headline-2 text-primary">Orderan #{order.id}</h4>
                      <p className="font-body text-sm text-text-muted">{order.restoran?.nama} · {order.tanggal_orderan} · {order.karyawan?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${st.className}`}>{st.label}</span>
                  </div>
                  <ul className="font-body text-sm text-on-surface mb-4 space-y-1">
                    {order.detail_orderan?.map((d) => (
                      <li key={d.id}>• {d.sayur?.nama}: {d.jumlah} {d.satuan}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    {order.status === "draft" && (
                      <button onClick={() => handleProses(order.id)} className="px-3 py-1.5 bg-secondary text-on-primary rounded-lg text-sm hover:bg-primary">Proses</button>
                    )}
                    {order.status === "diproses" && (
                      <button onClick={() => handleSelesai(order.id)} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm hover:bg-secondary">Selesai & Kurangi Stok</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
