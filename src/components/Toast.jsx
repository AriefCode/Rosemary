import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

const ToastCtx = createContext(null);
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`pointer-events-auto max-w-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-body text-sm border ${
                  t.type === "success"
                    ? "bg-status-success-bg text-status-success border-status-success/30"
                    : "bg-status-danger-bg text-[#991B1B] border-[#ef4444]/30"
                }`}
              >
                <span
                  className="material-symbols-outlined text-base shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {t.type === "success" ? "check_circle" : "error"}
                </span>
                <span>{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const fn = useContext(ToastCtx);
  if (!fn) throw new Error("useToast must be inside ToastProvider");
  return fn;
}
