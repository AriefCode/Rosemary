import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background-mint antialiased text-on-surface">
      <Sidebar />
      <Topbar />

      {/* Page content — offset sidebar & topbar */}
      <main className="ml-60 pt-24 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Lazy-loaded page component rendered here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
