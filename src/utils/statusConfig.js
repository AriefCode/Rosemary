export const statusConfig = {
  aman: {
    label: "Stok Aman",
    className: "bg-status-success-bg text-status-success",
  },
  rendah: {
    label: "Stok Rendah",
    className: "bg-status-warning-bg text-[#854D0E]",
  },
  habis: {
    label: "Habis",
    className: "bg-status-danger-bg text-[#991B1B]",
  },
};

export function getSayurStatus(sayur) {
  if (sayur.jumlah_persediaan <= 0) return "habis";
  if (sayur.jumlah_persediaan < sayur.batas_minimum) return "rendah";
  return "aman";
}
