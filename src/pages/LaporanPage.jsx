import { useEffect, useState } from "react";
import { getLaporan } from "../services/laporan";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";
import { SkeletonRow } from "../components/Skeleton";
import FadeContent from "../components/reactbits/FadeContent";

const statusOrderLabels = {
  pending: "Pending",
  selesai: "Selesai",
};

const statusOrderClass = {
  pending: "bg-status-warning-bg text-[#854D0E]",
  selesai: "bg-status-success-bg text-status-success",
};

export default function LaporanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLaporan()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const orderan = data?.orderan || [];
  const sayur = data?.sayur || [];

  return (
    <>
      <FadeContent>
        <header className="mb-8">
          <h2 className="font-headline-1 text-headline-1 text-primary">Laporan</h2>
          <p className="font-body text-text-muted mt-1">Analitik dan laporan inventaris.</p>
        </header>
      </FadeContent>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ringkasan Stok */}
        <FadeContent delay={0.08}>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-headline-2 text-headline-2 text-primary">Ringkasan Stok</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low font-label text-xs uppercase text-on-surface-variant tracking-wider">
                    <th className="px-6 py-3">Sayur</th>
                    <th className="px-6 py-3">Stok</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => <SkeletonRow key={i} cols={3} />)
                  ) : sayur.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <span
                          className="material-symbols-outlined text-4xl text-outline block mb-2"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                        >
                          inventory_2
                        </span>
                        <p className="text-text-muted font-body text-sm">Belum ada data stok.</p>
                      </td>
                    </tr>
                  ) : (
                    sayur.map((item) => {
                      const status = getSayurStatus(item);
                      const { label, className } = statusConfig[status];
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-outline-variant hover:bg-background-mint transition-colors"
                        >
                          <td className="px-6 py-3 font-medium">{item.nama}</td>
                          <td className="px-6 py-3">
                            {item.jumlah_persediaan}{" "}
                            <span className="text-text-muted text-xs">{item.satuan}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
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

        {/* Riwayat Orderan */}
        <FadeContent delay={0.15}>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h3 className="font-headline-2 text-headline-2 text-primary">Riwayat Orderan</h3>
            </div>
            <div className="max-h-[32rem] overflow-y-auto divide-y divide-outline-variant">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-4 animate-pulse space-y-2">
                    <div className="h-4 bg-surface-container-high rounded w-1/2" />
                    <div className="h-3 bg-surface-container-high rounded w-3/4" />
                  </div>
                ))
              ) : orderan.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <span
                    className="material-symbols-outlined text-4xl text-outline"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    receipt_long
                  </span>
                  <div>
                    <p className="font-headline-3 text-primary">Belum Ada Riwayat</p>
                    <p className="font-body text-sm text-text-muted mt-1">
                      Riwayat orderan akan muncul di sini.
                    </p>
                  </div>
                </div>
              ) : (
                orderan.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-background-mint/30 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-body font-medium text-primary text-sm">
                        #{order.id} — {order.restoran?.nama}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusOrderClass[order.status] || statusOrderClass.pending
                        }`}
                      >
                        {statusOrderLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="font-body text-sm text-text-muted">
                      {order.tanggal_orderan} · {order.karyawan?.nama}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {order.detail_orderan
                        ?.map((d) => `${d.sayur?.nama} (${d.jumlah})`)
                        .join(", ")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </FadeContent>
      </div>
    </>
  );
}
