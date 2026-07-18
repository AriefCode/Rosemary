import { useRef, useState } from "react";

export default function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: -300, y: -300 });

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => setPos({ x: -300, y: -300 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 130px at ${pos.x}px ${pos.y}px, rgba(64,145,108,0.09), transparent 80%)`,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
