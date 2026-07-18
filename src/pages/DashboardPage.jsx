import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getDashboard } from "../services/dashboard";
import { useAuth } from "../context/AuthContext";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import FadeContent from "../components/reactbits/FadeContent";
import CountUp from "../components/reactbits/CountUp";
import SpotlightCard from "../components/reactbits/SpotlightCard";

const statusOrderLabels = {
  pending: { label: "Pending", className: "bg-status-warning-bg text-[#854D0E]" },
  selesai: { label: "Selesai", className: "bg-status-success-bg text-status-success" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

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

  const stats = data?.stats || { total: 0, aman: 0, menipis: 0, habis: 0 };
  const recentSayur = data?.recent_sayur || [];
  const recentOrderan = data?.recent_orderan || [];

  const statCards = [
    {
      icon: "inventory_2",
      iconBg: "bg-background-mint",
      iconColor: "text-primary",
      value: stats.total,
      valueClass: "text-primary",
      label: "Total Produk",
    },
    {
      icon: "check_circle",
      iconFill: true,
      iconBg: "bg-status-success-bg",
      iconColor: "text-status-success",
      value: stats.aman,
      valueClass: "text-status-success",
      label: "Stok Aman",
    },
    {
      icon: "warning",
      iconFill: true,
      iconBg: "bg-status-warning-bg",
      iconColor: "text-[#854D0E]",
      value: stats.menipis,
      valueClass: "text-[#854D0E]",
      label: "Stok Menipis",
    },
    {
      icon: "error",
      iconFill: true,
      iconBg: "bg-status-danger-bg",
      iconColor: "text-status-danger",
      value: stats.habis,
      valueClass: "text-status-danger",
      label: "Stok Habis",
    },
  ];

  return (
    <>
      <FadeContent>
        <header className="mb-8">
          <h2 className="font-headline-1 text-headline-1 text-primary">Dashboard</h2>
          <p className="font-body text-text-muted mt-1">
            Ringkasan status persediaan barang Rosemary hari ini.
          </p>
        </header>
      </FadeContent>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((card, i) => (
            <motion.div key={i} variants={cardVariants}>
              <SpotlightCard className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant flex flex-col justify-between h-full hover:border-accent-fern transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${card.iconBg} rounded-lg ${card.iconColor}`}>
                    <span
                      className="material-symbols-outlined"
                      style={card.iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {card.icon}
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`font-headline-1 text-headline-1 ${card.valueClass}`}>
                    <CountUp value={card.value} />
                  </p>
                  <p className="font-label text-label text-text-muted uppercase tracking-wider">
                    {card.label}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tables grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Persediaan Terbaru */}
        <FadeContent delay={0.15}>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-2 text-headline-2 text-primary">Persediaan Terbaru</h3>
              <Link
                to={`/${role}/persediaan`}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body text-sm flex items-center gap-2 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
              >
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                Kelola
              </Link>
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
                  {loading ? (
                    [1, 2, 3].map((i) => <SkeletonRow key={i} cols={4} />)
                  ) : recentSayur.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-outline block mb-2" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                          inventory_2
                        </span>
                        <p className="text-text-muted text-sm">Belum ada data sayur.</p>
                      </td>
                    </tr>
                  ) : (
                    recentSayur.map((item, idx) => {
                      const status = getSayurStatus(item);
                      const { label, className } = statusConfig[status];
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-background-mint transition-colors ${
                            idx < recentSayur.length - 1 ? "border-b border-outline-variant" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-medium">{item.nama}</td>
                          <td className="px-6 py-4">{item.jumlah_persediaan}</td>
                          <td className="px-6 py-4 text-text-muted">{item.satuan}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>
                              {label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeContent>

        {/* Orderan Terbaru */}
        <FadeContent delay={0.22}>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-headline-2 text-headline-2 text-primary">Orderan Terbaru</h3>
            </div>

            <div className="divide-y divide-outline-variant">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-surface-container-high rounded w-1/2 mb-2" />
                    <div className="h-3 bg-surface-container-high rounded w-3/4" />
                  </div>
                ))
              ) : recentOrderan.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                    shopping_cart
                  </span>
                  <p className="text-text-muted text-sm font-body">Belum ada orderan.</p>
                </div>
              ) : (
                recentOrderan.map((order) => {
                  const st = statusOrderLabels[order.status] || statusOrderLabels.pending;
                  return (
                    <div key={order.id} className="p-4 hover:bg-background-mint/30 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-body font-medium text-primary text-sm">
                          #{order.id} — {order.restoran?.nama}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.className}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="font-body text-xs text-text-muted">
                        {order.tanggal_orderan} · {order.karyawan?.nama}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </FadeContent>
      </div>
    </>
  );
}
