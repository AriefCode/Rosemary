import { Outlet } from "react-router-dom";
import rosemaryLogo from "../assets/logos/rosemary_light.svg";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex font-body text-on-surface overflow-hidden">
      {/* Kiri — Form slot */}
      <div className="w-[40%] flex items-center justify-center p-8 bg-background-mint min-h-screen">
        <Outlet />
      </div>

      {/* Kanan — Decorative */}
      <div className="w-[60%] h-screen bg-primary flex items-center justify-center overflow-hidden">
        <img src={rosemaryLogo} alt="" className="w-[80%] h-auto opacity-10" />
      </div>
    </div>
  );
}
