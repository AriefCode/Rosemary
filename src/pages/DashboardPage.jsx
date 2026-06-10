// src/pages/DashboardPage.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const inventory = [
  {
    id: 1,
    name: "Bayam",
    stock: 5,
    unit: "Ikat",
    status: "aman",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5wyQKtrgD2KB7PSklRQXnB7iooV1pBA8dzNbn2YUD1l6GgzZy7l56MhnmCxTNqOI_a4vf1be1vVIv5Uqn4jZxx509e4NEMcuWlBfnTtdEwdIPG79xvLcCrY3OkOoMQpsEs2THdEpe6uwOqxjx2qnNN8PxK1Ye7rSGTqgUn8V6qaG6q_qUz0LPIsbh8VElsamZNA1441ZnuPXZMcPaMoLEsfV4MbmNcsMO-Y7a19aeGLNtMs-iH6A_iNcOcYo9-5qfXo0UT3PXvjnn",
  },
  {
    id: 2,
    name: "Wortel",
    stock: 2,
    unit: "Kg",
    status: "rendah",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPia5auUqs8FlzKGepqkDSmn46gNXzkUEdpPKx41U6DMhuwjT8WVAvCamlUngZohy2VquUBaFgwwQJsw69pS1ZheVYxLqUrxTWpYN4DcnN1-3AyPZaRLoAaXrlFgKR7wipT9xDvRXKirvx8eJm15zRbYcLDBmnPddUNcxlCmZEdSmINuwTTGIGWF5QZikPMhiawuo-OwZUgyJyRM1YNEhA0ybCno0UE802dhdrUMIVJKfI3BlI9HcG55Q4uiSd8yz2oDnDB-HksxNM",
  },
  {
    id: 3,
    name: "Kangkung",
    stock: 0,
    unit: "Ikat",
    status: "habis",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4DTyVqaZlCbc0rL9oEGUT1R7iOtZWZLryzgysXrJS1BIP0pASc3315l9cQA8ECfEwLaed0aa17yRYAJ2qZH-jjWdAe6V6V_w9QaZzbxlrq17vvAIKefIlnsv2EFugILNY8Kd38oP84Ndz7TdmncnBt9JkXBbR9SWcGItvWo76ts-jOBW6JLYsVygxE8pqLX5RIotTzs5deuU8_gYJFcElHChhe5rCYWHYsEUf_V16dCfWPdEPfKa1AQJ-OH_RueynmtYTuDv-DNId",
  },
];

const statusConfig = {
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

const statCards = [
  {
    icon: "inventory_2",
    iconBg: "bg-background-mint",
    iconColor: "text-primary",
    badge: "+2 baru",
    badgeClass: "text-status-success bg-status-success-bg",
    value: "24",
    valueClass: "text-primary",
    label: "Total Produk",
    hoverBorder: "hover:border-accent-fern",
  },
  {
    icon: "check_circle",
    iconFill: true,
    iconBg: "bg-status-success-bg",
    iconColor: "text-status-success",
    value: "18",
    valueClass: "text-status-success",
    label: "Stok Aman",
    hoverBorder: "hover:border-accent-fern",
  },
  {
    icon: "warning",
    iconFill: true,
    iconBg: "bg-status-warning-bg",
    iconColor: "text-status-warning",
    value: "4",
    valueClass: "text-status-warning",
    label: "Stok Rendah",
    hoverBorder: "hover:border-status-warning",
  },
  {
    icon: "error",
    iconFill: true,
    iconBg: "bg-status-danger-bg",
    iconColor: "text-status-danger",
    value: "2",
    valueClass: "text-status-danger",
    label: "Stok Habis",
    hoverBorder: "hover:border-error",
  },
];

export default function DashboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <pre style={{ color: "red" }}>{JSON.stringify(users, null, 2)}</pre>

      {/* Page Header */}
      <header className="mb-8">
        <h2 className="font-headline-1 text-headline-1 text-primary">
          Dashboard
        </h2>
        <p className="font-body text-text-muted mt-1">
          Ringkasan status persediaan barang Rosemary hari ini.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] border border-outline-variant flex flex-col justify-between group transition-all ${card.hoverBorder}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 ${card.iconBg} rounded-lg ${card.iconColor}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    card.iconFill
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {card.icon}
                </span>
              </div>
              {card.badge && (
                <span
                  className={`font-medium text-xs px-2 py-1 rounded-full ${card.badgeClass}`}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <div>
              <p
                className={`font-headline-1 text-headline-1 ${card.valueClass}`}
              >
                {card.value}
              </p>
              <p className="font-label text-label text-text-muted uppercase tracking-wider">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden border border-outline-variant">
        {/* Table Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-2 text-headline-2 text-primary">
            Persediaan Terbaru
          </h3>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body flex items-center gap-2 hover:bg-secondary transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Produk
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4 w-62.5">Nama Sayur</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Satuan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-body text-on-surface">
              {inventory.map((item, idx) => {
                const { label, className } = statusConfig[item.status];
                const isLast = idx === inventory.length - 1;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-background-mint transition-colors ${!isLast ? "border-b border-outline-variant" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-background-mint overflow-hidden border border-outline-variant shrink-0">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.stock}</td>
                    <td className="px-6 py-4 text-text-muted">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-accent-fern hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="text-error hover:text-red-700 transition-colors">
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-surface-container-low flex justify-between items-center text-xs text-on-surface-variant font-label">
          <span>Menampilkan 3 dari 24 produk</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-highest transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-primary text-on-primary">
              1
            </button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-highest transition-colors">
              2
            </button>
            <button className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-highest transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 flex justify-between items-center text-on-surface-variant">
        <div className="font-body-sm">
          © 2024 Rosemary Inventory System. All rights reserved.
        </div>
        <div className="flex gap-6 font-body-sm">
          <a
            href="#"
            className="hover:text-primary transition-colors underline decoration-outline-variant"
          >
            Kebijakan Privasi
          </a>
          <a
            href="#"
            className="hover:text-primary transition-colors underline decoration-outline-variant"
          >
            Pusat Bantuan
          </a>
        </div>
      </footer>
    </>
  );
}
