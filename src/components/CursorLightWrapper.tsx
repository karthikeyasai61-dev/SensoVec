"use client";
import { useState, MouseEvent, ReactNode } from "react";

export default function CursorLightWrapper({ children, className }: { children: ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: 500, y: 200 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <header
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `radial-gradient(circle 500px at ${pos.x}px ${pos.y}px, rgba(0, 153, 255, ${isHovered ? 0.15 : 0}), transparent 80%)`,
          transition: "background 0.3s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </header>
  );
}
