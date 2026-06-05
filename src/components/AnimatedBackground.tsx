"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: -1,
      overflow: "hidden",
      pointerEvents: "none",
      background: "radial-gradient(circle at 50% 50%, #11131c 0%, #08090d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Background radial glow overlay */}
      <div style={{
        position: "absolute",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0, 153, 255, 0.08) 0%, transparent 70%)",
        animation: "pulseGlow 8s infinite alternate ease-in-out",
      }} />

      {/* Main watermark logo and text container */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.035,
        transform: "scale(1.4)",
        animation: "floatLogo 12s infinite ease-in-out",
      }}>
        {/* SVG Logo */}
        <svg width="220" height="220" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 15 50 A 35 35 0 0 1 85 50" stroke="#0099ff" strokeWidth="8" strokeLinecap="round" />
          <path d="M 85 50 A 35 35 0 0 1 15 50" stroke="#cccccc" strokeWidth="8" strokeLinecap="round" />
          <text x="18" y="70" fontFamily="sans-serif" fontWeight="900" fontSize="56" fill="#cccccc">S</text>
          <text x="52" y="70" fontFamily="sans-serif" fontWeight="900" fontSize="56" fill="#0099ff">V</text>
          <circle cx="85" cy="50" r="10" fill="#0d0d12" stroke="#cccccc" strokeWidth="3" />
          <circle cx="85" cy="50" r="4" fill="#0099ff" />
        </svg>
        {/* Title */}
        <h2 style={{
          marginTop: "1.5rem",
          fontSize: "2.5rem",
          fontWeight: 900,
          letterSpacing: "0.3em",
          color: "white",
          fontFamily: "sans-serif",
          textTransform: "uppercase"
        }}>
          SensoVec
        </h2>
      </div>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes floatLogo {
          0% { transform: translateY(0) scale(1.4) rotate(0deg); }
          50% { transform: translateY(-15px) scale(1.45) rotate(3deg); }
          100% { transform: translateY(0) scale(1.4) rotate(0deg); }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
