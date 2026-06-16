import { useEffect, useState } from "react";
import { getLaporan } from "../services/laporan";
import { getSayurStatus, statusConfig } from "../utils/statusConfig";

const statusOrderLabels = {
  draft: "Draft",
  diproses: "Diproses",
  selesai: "Selesai",
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

  if (loading) return <p className="font-body text-text-muted">Memuat laporan...</p>;

  const orderan = data?.orderan || [];
  const sayur = data?.sayur || [];

  return (
    <>
      <header className="mb-8">
        <h2 className="font-headline-1 text-headline-1 text-primary">Laporan</h2>
        <p className="font-body text-text-muted mt-1">Analitik dan laporan inventaris.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="font-headline-2 text-headline-2 text-primary">Ringkasan Stok</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low font-label text-xs uppercase text-on-surface-variant">
                  <th className="px-6 py-3">Sayur</th>
                  <th className="px-6 py-3">Stok</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="font-body">
                {sayur.map((item) => {
                  const status = getSayurStatus(item);
                  const { label, className } = statusConfig[status];
                  return (
                    <tr key={item.id} className="border-b border-outline-variant hover:bg-background-mint">
                      <td className="px-6 py-3">{item.nama}</td>
                      <td className="px-6 py-3">{item.jumlah_persediaan} {item.satuan}</td>
                      <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs ${className}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="font-headline-2 text-headline-2 text-primary">Riwayat Orderan</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant">
            {orderan.length === 0 ? (
              <p className="p-6 text-text-muted font-body text-sm">Belum ada riwayat orderan.</p>
            ) : (
              orderan.map((order) => (
                <div key={order.id} className="p-4 hover:bg-background-mint/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-primary">#{order.id} — {order.restoran?.nama}</span>
                    <span className="text-xs text-text-muted">{statusOrderLabels[order.status]}</span>
                  </div>
                  <p className="text-sm text-text-muted">{order.tanggal_orderan} · {order.karyawan?.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {order.detail_orderan?.map((d) => `${d.sayur?.nama} (${d.jumlah})`).join(", ")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
