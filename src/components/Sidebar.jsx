import { NavLink, useNavigate } from "react-router-dom";
import rosemaryLogo from "../assets/logos/rosemary_dark.svg";
import { useAuth } from "../context/AuthContext";

const baseNavItems = [
  { segment: "dashboard", icon: "dashboard", label: "Dashboard" },
  { segment: "persediaan", icon: "inventory_2", label: "Persediaan" },
  { segment: "pesanan", icon: "shopping_cart", label: "Pesanan" },
  { segment: "laporan", icon: "analytics", label: "Laporan" },
];

const karyawanNavItems = [
  { segment: "dashboard", icon: "dashboard", label: "Dashboard" },
  { segment: "persediaan", icon: "inventory_2", label: "Persediaan" },
  { segment: "restoran", icon: "store", label: "Restoran" },
  { segment: "pesanan", icon: "shopping_cart", label: "Pesanan" },
  { segment: "laporan", icon: "analytics", label: "Laporan" },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const basePath = role ? `/${role}` : "/login";
  const navItems = role === "karyawan" ? karyawanNavItems : baseNavItems;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-primary flex flex-col py-6 z-20">
      <div className="px-6 mb-10">
        <img src={rosemaryLogo} alt="Rosemary Logo" className="h-auto w-full object-contain mx-auto" />
      </div>

      <nav className="grow space-y-1">
        {navItems.map(({ segment, icon, label }) => (
          <NavLink
            key={segment}
            to={`${basePath}/${segment}`}
            end={segment === "dashboard"}
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

      <div className="mt-auto px-4 space-y-1 border-t border-primary-container pt-6">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-primary font-bold text-xs">
            {initial}
          </div>
          <div className="overflow-hidden">
            <p className="text-on-primary text-xs font-medium truncate">{user?.email}</p>
            <p className="text-on-primary-container text-[10px] uppercase">{role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-on-primary-container hover:text-on-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body">Logout</span>
        </button>
      </div>
    </aside>
  );
}
