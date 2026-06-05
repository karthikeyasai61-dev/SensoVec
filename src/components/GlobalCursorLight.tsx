"use client";
import { useEffect, useRef } from "react";

export default function GlobalCursorLight() {
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lightRef.current) {
            lightRef.current.style.background = `radial-gradient(circle 600px at ${e.clientX}px ${e.clientY}px, rgba(0, 153, 255, 0.18), transparent 80%)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={lightRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 9999,
        background: `radial-gradient(circle 600px at -1000px -1000px, rgba(0, 153, 255, 0.18), transparent 80%)`,
      }}
    />
  );
}
