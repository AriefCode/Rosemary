import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../services/dashboard";
import { useAuth } from "../context/AuthContext";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";

export default function DashboardPage() {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-body text-text-muted">Memuat dashboard...</p>;
  }

  const stats = data?.stats || { total: 0, aman: 0, rendah: 0, habis: 0 };
  const recentSayur = data?.recent_sayur || [];

  const statCards = [
    { icon: "inventory_2", iconBg: "bg-background-mint", iconColor: "text-primary", value: stats.total, valueClass: "text-primary", label: "Total Produk", hoverBorder: "hover:border-accent-fern" },
    { icon: "check_circle", iconFill: true, iconBg: "bg-status-success-bg", iconColor: "text-status-success", value: stats.aman, valueClass: "text-status-success", label: "Stok Aman", hoverBorder: "hover:border-accent-fern" },
    { icon: "warning", iconFill: true, iconBg: "bg-status-warning-bg", iconColor: "text-status-warning", value: stats.rendah, valueClass: "text-status-warning", label: "Stok Rendah", hoverBorder: "hover:border-status-warning" },
    { icon: "error", iconFill: true, iconBg: "bg-status-danger-bg", iconColor: "text-status-danger", value: stats.habis, valueClass: "text-status-danger", label: "Stok Habis", hoverBorder: "hover:border-error" },
  ];

  return (
    <>
      <header className="mb-8">
        <h2 className="font-headline-1 text-headline-1 text-primary">Dashboard</h2>
        <p className="font-body text-text-muted mt-1">Ringkasan status persediaan barang Rosemary hari ini.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant flex flex-col justify-between group transition-all ${card.hoverBorder}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.iconBg} rounded-lg ${card.iconColor}`}>
                <span className="material-symbols-outlined" style={card.iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}>{card.icon}</span>
              </div>
            </div>
            <div>
              <p className={`font-headline-1 text-headline-1 ${card.valueClass}`}>{card.value}</p>
              <p className="font-label text-label text-text-muted uppercase tracking-wider">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-2 text-headline-2 text-primary">Persediaan Terbaru</h3>
          {role === "pemilik" && (
            <Link to={`/${role}/persediaan`} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-sm">add</span>
              Kelola Persediaan
            </Link>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Nama Sayur</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="font-body text-on-surface">
              {recentSayur.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">Belum ada data sayur.</td>
                </tr>
              ) : (
                recentSayur.map((item, idx) => {
                  const status = getSayurStatus(item);
                  const { label, className } = statusConfig[status];
                  return (
                    <tr key={item.id} className={`hover:bg-background-mint transition-colors ${idx < recentSayur.length - 1 ? "border-b border-outline-variant" : ""}`}>
                      <td className="px-6 py-4 font-medium">{item.nama}</td>
                      <td className="px-6 py-4">{item.jumlah_persediaan}</td>
                      <td className="px-6 py-4 text-text-muted">{item.satuan}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
