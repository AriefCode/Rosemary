export default function Topbar() {
  return (
    <header className="fixed top-0 right-0 h-16 left-60 bg-surface flex justify-between items-center px-6 border-b border-outline-variant shadow-sm z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <nav className="flex text-on-surface-variant font-body-sm">
          <span className="text-on-surface-variant">Pages</span>
          <span className="mx-2">/</span>
          <span className="text-primary font-bold">Dashboard</span>
        </nav>
      </div>

      {/* Right: search + actions + avatar */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Cari inventaris..."
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-sm focus:ring-2 focus:ring-accent-fern w-64 transition-all"
          />
        </div>

        {/* Icons + avatar */}
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="relative hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-1" />
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-primary font-bold text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
