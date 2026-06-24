import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  createOrderan,
  deleteOrderan,
  getOrderanList,
  selesaiOrderan,
  updateOrderan,
} from "../services/orderan";
import { getRestoranList } from "../services/restoran";
import { getSayurList } from "../services/sayur";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import FadeContent from "../components/reactbits/FadeContent";

const statusLabels = {
  pending: { label: "Pending", className: "bg-status-warning-bg text-[#854D0E]" },
  selesai: { label: "Selesai", className: "bg-status-success-bg text-status-success" },
};

const emptyForm = {
  restoran_id: "",
  tanggal_orderan: new Date().toISOString().split("T")[0],
  items: [{ sayur_id: "", jumlah: 1 }],
};

export default function PesananPage() {
  const toast = useToast();
  const [orderanList, setOrderanList] = useState([]);
  const [restoranList, setRestoranList] = useState([]);
  const [sayurList, setSayurList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmSelesai, setConfirmSelesai] = useState(null);

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
    } catch {
      toast("Gagal memuat data pesanan.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterStatus]);

  // Body scroll lock
  useEffect(() => {
    const locked = showForm || !!confirmDelete || !!confirmSelesai;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showForm, confirmDelete, confirmSelesai]);

  // Escape key for form
  useEffect(() => {
    if (!showForm) return;
    const fn = (e) => { if (e.key === "Escape") setShowForm(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [showForm]);

  const addItem = () =>
    setForm({ ...form, items: [...form.items, { sayur_id: "", jumlah: 1 }] });

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };

  const removeItem = (index) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const openCreate = () => {
    setEditingOrder(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setForm({
      restoran_id: String(order.restoran_id),
      tanggal_orderan: order.tanggal_orderan,
      items:
        order.detail_orderan?.map((d) => ({
          sayur_id: String(d.sayur_id || ""),
          jumlah: d.jumlah,
        })) || [{ sayur_id: "", jumlah: 1 }],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      restoran_id: Number(form.restoran_id),
      tanggal_orderan: form.tanggal_orderan,
      items: form.items.map((item) => ({
        sayur_id: Number(item.sayur_id),
        jumlah: Number(item.jumlah),
      })),
    };
    try {
      if (editingOrder) {
        await updateOrderan(editingOrder.id, payload);
        toast("Orderan berhasil diperbarui.");
      } else {
        await createOrderan(payload);
        toast("Orderan berhasil dibuat.");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menyimpan orderan.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrderan(confirmDelete);
      toast("Orderan berhasil dihapus.");
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menghapus orderan.", "error");
    }
    setConfirmDelete(null);
  };

  const handleSelesai = async () => {
    try {
      await selesaiOrderan(confirmSelesai);
      toast("Orderan selesai. Stok telah dikurangi otomatis.");
      loadData();
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menyelesaikan orderan.", "error");
    }
    setConfirmSelesai(null);
  };

  return (
    <>
      <FadeContent>
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="font-headline-1 text-headline-1 text-primary">Pesanan</h2>
            <p className="font-body text-text-muted mt-1">Daftar dan status pesanan masuk.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Buat Orderan
          </button>
        </header>
      </FadeContent>

      <FadeContent delay={0.05}>
        <div className="mb-4 flex gap-2 flex-wrap">
          {["", "pending", "selesai"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-body border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern ${
                filterStatus === s
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant hover:bg-surface-container-low"
              }`}
            >
              {s === "" ? "Semua" : statusLabels[s]?.label}
            </button>
          ))}
        </div>
      </FadeContent>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-headline-2 text-headline-2 text-primary mb-4">
                {editingOrder ? `Edit Orderan #${editingOrder.id}` : "Buat Orderan Baru"}
              </h3>
              <div className="space-y-4">
                <select
                  required
                  value={form.restoran_id}
                  onChange={(e) => setForm({ ...form, restoran_id: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern"
                >
                  <option value="">Pilih Restoran</option>
                  {restoranList.map((r) => (
                    <option key={r.id} value={r.id}>{r.nama}</option>
                  ))}
                </select>
                <input
                  required
                  type="date"
                  value={form.tanggal_orderan}
                  onChange={(e) => setForm({ ...form, tanggal_orderan: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern"
                />
                <div className="space-y-3">
                  <p className="font-label text-label text-on-surface-variant">Detail Item</p>
                  {form.items.map((item, index) => {
                    const selectedSayur = sayurList.find((s) => s.id === Number(item.sayur_id));
                    return (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 min-w-0">
                          <select
                            required
                            value={item.sayur_id}
                            onChange={(e) => updateItem(index, "sayur_id", e.target.value)}
                            className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-fern/40"
                          >
                            <option value="">Pilih sayur</option>
                            {sayurList.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nama} (stok: {s.jumlah_persediaan})
                              </option>
                            ))}
                          </select>
                          {selectedSayur && (
                            <p className="text-xs text-text-muted mt-1 ml-1">
                              Satuan: {selectedSayur.satuan}
                            </p>
                          )}
                        </div>
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.jumlah}
                          onChange={(e) => updateItem(index, "jumlah", e.target.value)}
                          className="w-20 px-2 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-fern/40"
                        />
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-error hover:text-[#7f1d1d] mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern rounded"
                          >
                            <span className="material-symbols-outlined">remove_circle</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-secondary hover:underline focus-visible:outline-none"
                  >
                    + Tambah item
                  </button>
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
        title="Hapus Orderan"
        message="Orderan ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        variant="danger"
        confirmLabel="Hapus"
      />

      <ConfirmModal
        open={!!confirmSelesai}
        title="Selesaikan Orderan"
        message="Stok sayur akan dikurangi otomatis sesuai jumlah dalam orderan ini. Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleSelesai}
        onCancel={() => setConfirmSelesai(null)}
        variant="warning"
        confirmLabel="Selesaikan"
      />

      <FadeContent delay={0.1}>
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="divide-y divide-outline-variant">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 animate-pulse space-y-3">
                  <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-surface-container-high rounded w-1/3" />
                      <div className="h-3 bg-surface-container-high rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-surface-container-high rounded-full w-16" />
                  </div>
                  <div className="h-3 bg-surface-container-high rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : orderanList.length === 0 ? (
            <div className="p-14 text-center flex flex-col items-center gap-4">
              <span
                className="material-symbols-outlined text-5xl text-outline"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
              >
                shopping_cart
              </span>
              <div>
                <p className="font-headline-3 text-primary">Belum Ada Pesanan</p>
                <p className="font-body text-sm text-text-muted mt-1">
                  {filterStatus
                    ? `Tidak ada pesanan dengan status "${statusLabels[filterStatus]?.label}".`
                    : "Buat orderan pertama untuk memulai."}
                </p>
              </div>
              {!filterStatus && (
                <button
                  onClick={openCreate}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-secondary transition-colors"
                >
                  Buat Orderan
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {orderanList.map((order) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                const isPending = order.status === "pending";
                return (
                  <div
                    key={order.id}
                    className="p-6 hover:bg-background-mint/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-headline-3 text-headline-3 text-primary">
                          Orderan #{order.id}
                        </h4>
                        <p className="font-body text-sm text-text-muted mt-0.5">
                          {order.restoran?.nama} · {order.tanggal_orderan} · {order.karyawan?.nama}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ml-4 ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                    <ul className="font-body text-sm text-on-surface mb-4 space-y-1">
                      {order.detail_orderan?.map((d) => (
                        <li key={d.id}>
                          • {d.sayur?.nama}: {d.jumlah}{" "}
                          <span className="text-text-muted">{d.sayur?.satuan}</span>
                        </li>
                      ))}
                    </ul>
                    {isPending && (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(order)}
                          className="px-3 py-1.5 border border-accent-fern text-accent-fern rounded-lg text-sm hover:bg-background-mint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete(order.id)}
                          className="px-3 py-1.5 border border-error text-error rounded-lg text-sm hover:bg-status-danger-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                          Hapus
                        </button>
                        <button
                          onClick={() => setConfirmSelesai(order.id)}
                          className="px-3 py-1.5 bg-accent-fern text-on-primary rounded-lg text-sm hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          Selesaikan
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeContent>
    </>
  );
}
