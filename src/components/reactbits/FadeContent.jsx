import { motion } from "motion/react";

export default function FadeContent({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      // Delay stagger dikecilkan agar konten yang sudah dimuat tidak tertahan animasi
      transition={{ duration: 0.18, delay: delay * 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
