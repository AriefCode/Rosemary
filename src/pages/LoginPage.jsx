import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import rosemaryLogo from "../assets/logos/rosemary_light.svg";
import { useAuth } from "../context/AuthContext";
import ShinyText from "../components/reactbits/ShinyText";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(email, password);
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Gagal masuk. Periksa email dan kata sandi.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[400px] bg-surface-container-lowest rounded-xl shadow-[0_4px_24px_rgba(27,67,50,0.10)] overflow-hidden"
    >
      <div className="pb-6 px-10 pt-12 text-center flex flex-col items-center">
        <img src={rosemaryLogo} alt="Rosemary Logo" className="h-16 w-auto object-contain mb-4" />
        <h1 className="font-headline-1 text-headline-1">
          <ShinyText>Rosemary</ShinyText>
        </h1>
        <p className="font-label text-label tracking-[0.2em] font-semibold text-secondary uppercase mt-1">
          Inventory System
        </p>
        <p className="font-tagline text-tagline italic text-secondary mt-2">Fresh Data. Smart Control.</p>
      </div>

      <div className="px-10">
        <hr className="border-outline-variant" />
      </div>

      <div className="p-10 pt-8 pb-12">
        <h2 className="font-headline-2 text-headline-2 text-primary mb-8">Masuk ke Rosemary</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-status-danger-bg text-[#991B1B] font-body text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="font-label text-label text-on-surface-variant block">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body text-body focus:ring-2 focus:ring-accent-fern/20 focus:border-accent-fern outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label text-label text-on-surface-variant block">Kata Sandi</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body text-body focus:ring-2 focus:ring-accent-fern/20 focus:border-accent-fern outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors focus-visible:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label text-body font-bold hover:bg-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fern"
          >
            {submitting ? "Memproses..." : "Masuk Sekarang"}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>
      </div>

      <div className="h-2 bg-linear-to-r from-primary-container via-secondary to-accent-fern" />
    </motion.main>
  );
}
