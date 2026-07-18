export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-surface-container-high animate-pulse rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-surface-container-high rounded-lg" />
      </div>
      <div className="h-8 bg-surface-container-high rounded w-16 mb-2" />
      <div className="h-3 bg-surface-container-high rounded w-24" />
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`bg-surface-container-high animate-pulse rounded ${className}`} />;
}
