export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-on-surface-variant">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-outline-variant border-t-accent-fern rounded-full animate-spin" />
        <p className="font-body text-sm">Memuat halaman...</p>
      </div>
    </div>
  );
}
