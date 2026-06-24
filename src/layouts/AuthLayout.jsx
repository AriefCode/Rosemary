import { Outlet } from "react-router-dom";
import rosemaryLogo from "../assets/logos/rosemary_light.svg";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex font-body text-on-surface overflow-hidden">
      {/* Kiri — Form slot */}
      <div className="w-full md:w-[42%] flex items-center justify-center p-8 bg-background-mint min-h-screen">
        <Outlet />
      </div>

      {/* Kanan — Decorative */}
      <div
        className="hidden md:flex w-[58%] h-screen items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #012d1d 0%, #1b4332 35%, #2c694e 65%, #012d1d 100%)",
          backgroundSize: "300% 300%",
          animation: "aurora 10s ease infinite",
        }}
      >
        <img src={rosemaryLogo} alt="" className="w-[72%] h-auto opacity-[0.07]" />
      </div>
    </div>
  );
}
