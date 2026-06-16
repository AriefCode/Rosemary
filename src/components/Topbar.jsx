import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notifications";
import { useAuth } from "../context/AuthContext";

const pageLabels = {
  dashboard: "Dashboard",
  persediaan: "Persediaan",
  restoran: "Restoran",
  pesanan: "Pesanan",
  laporan: "Laporan",
};

export default function Topbar() {
  const location = useLocation();
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const segment = location.pathname.split("/").pop() || "dashboard";
  const pageLabel = pageLabels[segment] || "Dashboard";
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const loadNotifications = () => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
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

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  return (
    <header className="fixed top-0 right-0 h-16 left-60 bg-surface flex justify-between items-center px-6 border-b border-outline-variant shadow-sm z-10">
      <div className="flex items-center gap-4">
        <nav className="flex text-on-surface-variant font-body-sm">
          <span className="text-on-surface-variant">Pages</span>
          <span className="mx-2">/</span>
          <span className="text-primary font-bold">{pageLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Cari inventaris..."
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-accent-fern w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 text-on-surface-variant">
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="relative hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-error text-on-primary text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant z-30">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                  <h4 className="font-label text-label text-primary font-semibold">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead} className="text-xs text-secondary hover:underline">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-text-muted font-body">Tidak ada notifikasi.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => !n.read_at && handleMarkRead(n.id)}
                        className={`w-full text-left p-4 border-b border-outline-variant hover:bg-background-mint transition-colors ${!n.read_at ? "bg-background-mint/50" : ""}`}
                      >
                        <p className="font-body text-sm text-on-surface">{n.message}</p>
                        <p className="font-label text-xs text-text-muted mt-1">
                          {n.sayur?.nama}
                        </p>
                      </button>
                    ))
                  )}
                </div>
                {role && (
                  <div className="p-3 border-t border-outline-variant">
                    <Link to={`/${role}/persediaan`} onClick={() => setOpen(false)} className="text-xs text-secondary hover:underline">
                      Lihat persediaan
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
      </div>
    </header>
  );
}
