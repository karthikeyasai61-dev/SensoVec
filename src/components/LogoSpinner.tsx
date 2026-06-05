import React from "react";

interface LogoSpinnerProps {
  size?: number;
  center?: boolean;
  padding?: string;
}

export default function LogoSpinner({
  size = 60,
  center = false,
  padding = "2rem 0",
}: LogoSpinnerProps) {
  const svgContent = (
    <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rotating Track Group */}
        <g className="track-spin">
          <path d="M 20 60 A 40 40 0 0 1 100 60" stroke="#0099ff" strokeWidth="10" strokeLinecap="round" opacity="0.85" />
          <path d="M 100 60 A 40 40 0 0 1 20 60" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
          
          {/* Satellite sensor that rotates along */}
          <circle cx="100" cy="60" r="12" fill="#0d0d12" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="100" cy="60" r="4" fill="#0099ff" />
          <circle cx="100" cy="60" r="4" fill="#0099ff" className="radar-wave" />
        </g>

        {/* Stationary Pulsing Initials */}
        <text x="28" y="79" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="52" fill="#cbd5e1" className="letter-s">S</text>
        <text x="58" y="79" fontFamily="'Montserrat', sans-serif" fontWeight="900" fontSize="52" fill="#0099ff" className="letter-v">V</text>
      </svg>
      <style>{`
        .track-spin {
          animation: rotateTrack 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 60px 60px;
        }
        @keyframes rotateTrack {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .letter-s {
          animation: pulseS 2s ease-in-out infinite;
          transform-origin: 40px 60px;
        }
        @keyframes pulseS {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .letter-v {
          animation: pulseV 2s ease-in-out infinite;
          transform-origin: 80px 60px;
        }
        @keyframes pulseV {
          0%, 100% { opacity: 1; transform: scale(1.05); }
          50% { opacity: 0.4; transform: scale(0.95); }
        }
        .radar-wave {
          transform-origin: 100px 60px;
          animation: radarPulse 1.5s infinite linear;
        }
        @keyframes radarPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .loading-text-anim {
          animation: pulseLoadingText 1.5s ease-in-out infinite;
          text-transform: uppercase;
          font-weight: 900;
          font-size: 0.85rem;
          margin-top: 1.5rem;
          color: #94a3b8;
          letter-spacing: 3px;
          font-family: inherit;
        }
        @keyframes pulseLoadingText {
          0%, 100% { opacity: 0.4; letter-spacing: 3px; }
          50% { opacity: 1; letter-spacing: 6px; }
        }
      `}</style>
    </div>
  );

  if (center) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh", 
        flexDirection: "column",
        backgroundColor: "#0d0d12"
      }}>
        {svgContent}
        <p className="loading-text-anim">Loading</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: padding,
      width: "100%"
    }}>
      {svgContent}
    </div>
  );
}
