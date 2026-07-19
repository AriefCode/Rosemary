import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const inputClass =
  "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-accent-fern/40 focus:border-accent-fern transition-colors";
const labelClass = "font-label text-sm text-on-surface-variant block mb-1";
const fileLabelClass =
  "inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary text-on-primary font-semibold hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern cursor-pointer";

const getInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.map((word) => word.charAt(0).toUpperCase()).slice(0, 2).join("");
};

export default function ProfilePage() {
  const toast = useToast();
  const { user, updateProfile } = useAuth();
  const [nama, setNama] = useState(user?.nama || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar_url || "");
  const [resetAvatar, setResetAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setResetAvatar(false);
      setPreview(user?.avatar_url || "");
      return;
    }

    setAvatarFile(file);
    setResetAvatar(false);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nama", nama);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      if (resetAvatar && !avatarFile) {
        formData.append("reset_avatar", "1");
      }

      const updated = await updateProfile(formData);
      setNama(updated.nama || nama);
      setAvatarFile(null);
      setResetAvatar(false);
      setPreview(updated.avatar_url || "");
      toast("Profil berhasil disimpan.");
    } catch (err) {
      const res = err.response?.data;
      setError(res?.message || "Gagal menyimpan profil.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant p-6"
    >
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-1 text-headline-1 text-primary">Edit Profil</h2>
          <p className="font-body text-text-muted mt-1">
            Perbarui nama dan foto profil agar lebih mudah dikenali.
          </p>
        </div>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-status-danger-bg text-[#991B1B] p-3 font-body text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
            <div className="relative">
              <div className="h-28 w-28 rounded-full bg-secondary overflow-hidden shadow-inner">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-on-primary font-bold text-2xl">
                    {getInitials(nama)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="font-label text-label text-on-surface-variant uppercase tracking-[0.18em] mb-1">
                Foto Profil
              </p>
              <p className="font-body text-sm text-text-muted">
                Unggah file jpeg/png maksimal 2MB.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="profile-name" className={labelClass}>
                Nama
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={inputClass}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label htmlFor="profile-avatar" className={labelClass}>
                Avatar
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-center">
                <label htmlFor="profile-avatar" className={fileLabelClass}>
                  <span className="material-symbols-outlined">photo_camera</span>
                  Pilih Foto
                </label>
                <p className="text-sm text-text-muted break-all">
                  {avatarFile?.name || "Belum ada file dipilih"}
                </p>
              </div>
              <input
                id="profile-avatar"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setResetAvatar(true);
                  setPreview("");
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
              >
                <span className="material-symbols-outlined">restore</span>
                Kembali ke default
              </button>
              {resetAvatar && (
                <p className="mt-2 text-xs text-text-muted">
                  Avatar akan dihapus dan kembali ke tampilan default.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
              <p className="font-label text-sm text-on-surface-variant mb-3">Informasi Akun</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-label text-sm text-text-muted">Email</p>
                  <p className="font-body text-base text-on-surface mt-1 break-all">{user?.email}</p>
                </div>
                <div>
                  <p className="font-label text-sm text-text-muted">Role</p>
                  <p className="font-body text-base text-on-surface mt-1 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={submitting}
                className="min-w-[180px] inline-flex items-center justify-center bg-primary text-on-primary py-3 rounded-lg font-label font-bold hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <p className="font-body text-text-muted text-sm">
                Perubahan akan muncul otomatis setelah penyimpanan.
              </p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
