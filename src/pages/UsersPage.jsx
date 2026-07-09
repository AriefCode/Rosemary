import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createUser, deleteUser, getUsers, updateUser } from "../services/users";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { SkeletonRow } from "../components/Skeleton";
import FadeContent from "../components/reactbits/FadeContent";

const emptyForm = { nama: "", email: "", password: "", role: "karyawan" };

const roleBadge = {
  pemilik: "bg-status-safe-bg text-primary",
  karyawan: "bg-surface-container-low text-on-surface-variant",
};

const inputClass =
  "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors";

const labelClass = "font-label text-sm text-on-surface-variant block mb-1";

export default function UsersPage() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUserList(data);
    } catch {
      toast("Gagal memuat data user.", "error");
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
    setForm({ nama: item.nama, email: item.email, password: "", role: item.role });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        const updated = await updateUser(editingId, payload);
        setUserList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast("Data user berhasil diperbarui.");
      } else {
        const created = await createUser(form);
        setUserList((prev) =>
          [...prev, created].sort((a, b) => a.nama.localeCompare(b.nama))
        );
        toast("User berhasil ditambahkan.");
      }
      setShowForm(false);
    } catch (err) {
      const res = err.response?.data;
      const firstValidation = res?.errors && Object.values(res.errors)[0]?.[0];
      setFormError(firstValidation || res?.message || "Gagal menyimpan data.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(confirmDelete);
      setUserList((prev) => prev.filter((u) => u.id !== confirmDelete));
      toast("User berhasil dihapus.");
    } catch (err) {
      toast(err.response?.data?.message || "Gagal menghapus user.", "error");
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <FadeContent>
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h2 className="font-headline-1 text-headline-1 text-primary">Manajemen User</h2>
            <p className="font-body text-text-muted mt-1">Kelola akun pemilik dan karyawan Rosemary.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah User
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
                {editingId ? "Edit User" : "Tambah User"}
              </h3>
              {formError && (
                <p className="text-error text-sm mb-3 p-3 bg-status-danger-bg rounded-lg">{formError}</p>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="user-nama" className={labelClass}>Nama</label>
                  <input
                    id="user-nama"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="cth. Budi Santoso"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-email" className={labelClass}>Email</label>
                  <input
                    id="user-email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="cth. budi@rosemary.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="user-password" className={labelClass}>Password</label>
                  <input
                    id="user-password"
                    required={!editingId}
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className={inputClass}
                  />
                  {editingId && (
                    <p className="text-xs text-text-muted mt-1">
                      Kosongkan jika tidak ingin mengubah password.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="user-role" className={labelClass}>Role</label>
                  <select
                    id="user-role"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className={inputClass}
                  >
                    <option value="karyawan">Karyawan</option>
                    <option value="pemilik">Pemilik</option>
                  </select>
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
        title="Hapus User"
        message="Akun ini akan dinonaktifkan (soft delete) dan tidak bisa lagi digunakan untuk masuk. Riwayat orderan miliknya tetap tersimpan."
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
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-body text-on-surface">
                {loading ? (
                  [1, 2, 3].map((i) => <SkeletonRow key={i} cols={4} />)
                ) : userList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center">
                      <span
                        className="material-symbols-outlined text-5xl text-outline block mb-3"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                      >
                        group
                      </span>
                      <p className="font-headline-3 text-primary mb-1">Belum Ada User</p>
                      <p className="font-body text-sm text-text-muted mb-4">
                        Tambahkan akun karyawan agar mereka dapat masuk ke sistem.
                      </p>
                      <button
                        onClick={openCreate}
                        className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body text-sm hover:bg-secondary transition-colors"
                      >
                        Tambah User
                      </button>
                    </td>
                  </tr>
                ) : (
                  userList.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-background-mint transition-colors ${
                        idx < userList.length - 1 ? "border-b border-outline-variant" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">
                        {item.nama}
                        {currentUser?.id === item.id && (
                          <span className="ml-2 text-xs text-text-muted">(Anda)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-muted">{item.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            roleBadge[item.role] || roleBadge.karyawan
                          }`}
                        >
                          {item.role}
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
                        {currentUser?.id !== item.id && (
                          <button
                            onClick={() => setConfirmDelete(item.id)}
                            className="text-error hover:text-[#7f1d1d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error rounded"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </td>
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
