import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "danger",
  confirmLabel = "Hapus",
}) {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onCancel]);

  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-sm shadow-xl border border-outline-variant"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isDanger ? "bg-status-danger-bg" : "bg-status-warning-bg"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${isDanger ? "text-status-danger" : "text-[#854D0E]"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isDanger ? "delete_forever" : "warning"}
                </span>
              </div>
              <div>
                <h3 className="font-headline-3 text-headline-3 text-primary mb-1">{title}</h3>
                <p className="font-body text-sm text-text-muted">{message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-outline-variant font-body text-sm hover:bg-surface-container-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern ${
                  isDanger ? "bg-error" : "bg-status-warning"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
