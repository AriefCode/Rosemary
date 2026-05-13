import { NavLink } from "react-router-dom";
import rosemaryLogo from "../assets/logos/rosemary_dark.svg";

const navItems = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/persediaan", icon: "inventory_2", label: "Persediaan" },
  { to: "/pesanan", icon: "shopping_cart", label: "Pesanan" },
  { to: "/laporan", icon: "analytics", label: "Laporan" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-primary flex flex-col py-6 z-20">
      {/* Logo */}
      <div className="px-6 mb-10">
        <img
          src={rosemaryLogo}
          alt="Rosemary Logo"
          className="h-auto w-full object-contain mx-auto"
        />
      </div>

      {/* Nav Links */}
      <nav className="grow space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 mx-2 px-4 py-3 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-secondary text-on-primary"
                  : "text-on-primary-container hover:text-on-primary hover:bg-primary-container",
              ].join(" ")
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-body">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + settings */}
      <div className="mt-auto px-4 space-y-1 border-t border-primary-container pt-6">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-primary font-bold text-xs">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-on-primary text-xs font-medium truncate">
              admin@rosemary.com
            </p>
          </div>
        </div>

        <a
          href="#"
          className="flex items-center gap-3 text-on-primary-container hover:text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body">Settings</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 text-on-primary-container hover:text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body">Logout</span>
        </a>
      </div>
    </aside>
  );
}
