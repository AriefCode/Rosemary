import { useEffect, useRef } from "react";
import { animate } from "motion";

export default function CountUp({ value, duration = 0.9 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => { el.textContent = Math.round(v); },
    });
    return () => ctrl.stop();
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}
