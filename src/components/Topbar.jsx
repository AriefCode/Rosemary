import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNotifications } from "../services/notifications";
import { useAuth } from "../context/AuthContext";

const pageLabels = {
  dashboard: "Dashboard",
  persediaan: "Persediaan",
  restoran: "Restoran",
  pesanan: "Pesanan",
  laporan: "Laporan",
};

export default function Topbar({ onMenuToggle }) {
  const location = useLocation();
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const segment = location.pathname.split("/").pop() || "dashboard";
  const pageLabel = pageLabels[segment] || "Dashboard";

  const loadNotifications = () => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
    // Interval longgar + skip saat tab tersembunyi — backend dev single-threaded,
    // polling agresif membuat request halaman ikut mengantre
    const interval = setInterval(() => {
      if (!document.hidden) loadNotifications();
    }, 120000);
    const onVisible = () => {
      if (!document.hidden) loadNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  const notifCount = notifications.length;

  return (
    <header className="fixed top-0 right-0 h-16 left-0 md:left-60 bg-surface flex justify-between items-center px-4 md:px-6 border-b border-outline-variant shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern rounded-lg"
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <nav className="flex text-on-surface-variant font-body-sm">
          <span className="text-on-surface-variant">Pages</span>
          <span className="mx-2">/</span>
          <span className="text-primary font-bold">{pageLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4 text-on-surface-variant">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="relative hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern rounded-lg p-1"
            aria-label={`Notifikasi${notifCount > 0 ? `, ${notifCount} item` : ""}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-error text-on-primary text-[10px] rounded-full flex items-center justify-center leading-none">
                {notifCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.12)] border border-outline-variant z-30">
              <div className="p-4 border-b border-outline-variant">
                <h4 className="font-label text-label text-primary font-semibold">Stok Menipis / Habis</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-outline mb-2 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                      notifications_none
                    </span>
                    <p className="font-body text-sm text-text-muted">Semua stok aman.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isHabis = n.status_persediaan === "habis";
                    return (
                      <div
                        key={n.sayur_id}
                        className={`w-full text-left p-4 border-b border-outline-variant last:border-0 ${
                          isHabis ? "bg-status-danger-bg/30" : "bg-status-warning-bg/30"
                        }`}
                      >
                        <p className={`font-body text-sm font-medium ${isHabis ? "text-[#991B1B]" : "text-[#854D0E]"}`}>
                          {n.nama} {isHabis ? "habis" : "menipis"}
                        </p>
                        <p className="font-label text-xs text-text-muted mt-0.5">
                          Sisa {n.jumlah_persediaan} {n.satuan} · batas min. {n.batas_minimum}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              {role && (
                <div className="p-3 border-t border-outline-variant">
                  <Link
                    to={`/${role}/persediaan`}
                    onClick={() => setOpen(false)}
                    className="text-xs text-secondary hover:underline focus-visible:outline-none"
                  >
                    Kelola persediaan →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-outline-variant mx-1" />
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-primary font-bold text-sm">
          {role === "pemilik" ? "P" : "K"}
        </div>
      </div>
    </header>
  );
}
