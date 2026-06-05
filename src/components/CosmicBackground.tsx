"use client";

import { useEffect, useRef, useState } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star properties
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
    }

    const stars: Star[] = [];

    // Generate stars: uniform area-weighted distribution across the entire circular bounds
    const initStars = () => {
      stars.length = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const diagonal = Math.sqrt(width * width + height * height);
      const radius = diagonal * 0.75;
      const centerX = width / 2;
      const centerY = height / 2;

      // Calculate dynamic count based on screen area to maintain consistent density (not cramped/contracted on mobile)
      const densityArea = width * height;
      // 1920 * 1080 = 2073600. 4000 stars for this area means 1 star per ~500 pixels.
      const dynamicCount = Math.min(4000, Math.max(600, Math.floor(densityArea / 518)));

      for (let i = 0; i < dynamicCount; i++) {
        // Area-weighted distribution ensures constant density across the entire screen
        const r = Math.sqrt(Math.random()) * radius;
        const theta = Math.random() * Math.PI * 2;
        stars.push({
          x: centerX + r * Math.cos(theta),
          y: centerY + r * Math.sin(theta),
          size: Math.random() * 1.4 + 0.4,
          alpha: Math.random(),
          speed: Math.random() * 0.015 + 0.005,
        });
      }
    };
    initStars();

    // Re-initialize stars on window resize to ensure correct boundary coverage
    const handleResize = () => {
      resizeCanvas();
      initStars();
    };
    window.removeEventListener("resize", resizeCanvas);
    window.addEventListener("resize", handleResize);

    // Nebula glows
    interface Nebula {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }

    const nebulas: Nebula[] = [
      {
        x: window.innerWidth * 0.25,
        y: window.innerHeight * 0.3,
        radius: Math.min(window.innerWidth, window.innerHeight) * 0.45,
        color: "rgba(0, 153, 255, 0.04)",
        vx: 0.08,
        vy: 0.05,
      },
      {
        x: window.innerWidth * 0.75,
        y: window.innerHeight * 0.7,
        radius: Math.min(window.innerWidth, window.innerHeight) * 0.5,
        color: "rgba(102, 51, 255, 0.04)",
        vx: -0.06,
        vy: -0.04,
      },
    ];

    // Shooting Star properties
    interface ShootingStar {
      x: number;
      y: number;
      dx: number;
      dy: number;
      speed: number;
      opacity: number;
      active: boolean;
      size: number;
    }

    let shootingStars: ShootingStar[] = [];
    const maxShootingStars = 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Deep space background gradient (Static base layer)
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      bgGrad.addColorStop(0, "#08090d");
      bgGrad.addColorStop(0.5, "#050608");
      bgGrad.addColorStop(1, "#020204");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw nebulas (gas clouds - static/drifting slowly behind rotating starfield)
      nebulas.forEach((nebula) => {
        nebula.x += nebula.vx;
        nebula.y += nebula.vy;

        if (nebula.x - nebula.radius < 0 || nebula.x + nebula.radius > canvas.width) {
          nebula.vx *= -1;
        }
        if (nebula.y - nebula.radius < 0 || nebula.y + nebula.radius > canvas.height) {
          nebula.vy *= -1;
        }

        const radGrad = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        radGrad.addColorStop(0, nebula.color);
        radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw & Revolve/Rotate background starfield
      rotationAngle += 0.00015; // Slow rotation speed

      ctx.save();
      // Translate to screen center, rotate, and translate back
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationAngle);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      stars.forEach((star) => {
        // Twinkle effect
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0.15) {
          star.speed = -star.speed;
        }

        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Render subtle blue halo for large bright stars
        if (star.size > 1.2 && star.alpha > 0.75) {
          ctx.fillStyle = `rgba(0, 153, 255, ${(star.alpha - 0.75) * 0.4})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // 4. Draw & animate shooting stars (drawn on top, moving linearly across screen)
      if (shootingStars.filter(s => s.active).length < maxShootingStars && Math.random() < 0.008) {
        // Spawn from top/sides, passing through center region
        const startX = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
        const startY = Math.random() * canvas.height * 0.3;
        const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1); // ~45 degrees diagonal downward
        const speed = Math.random() * 6 + 7; // 7 to 13px per frame

        shootingStars.push({
          x: startX,
          y: startY,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          speed,
          opacity: 1.0,
          active: true,
          size: Math.random() * 1.5 + 1.0
        });
      }

      shootingStars.forEach((star) => {
        if (!star.active) return;

        star.x += star.dx;
        star.y += star.dy;
        star.opacity -= 0.018; // Fade speed

        // Deactivate when off-screen or faded
        if (star.opacity <= 0 || star.x > canvas.width || star.y > canvas.height) {
          star.active = false;
          return;
        }

        // Draw trail (fades from white to cosmic blue)
        const grad = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - star.dx * 3,
          star.y - star.dy * 3
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        grad.addColorStop(0.15, `rgba(0, 153, 255, ${star.opacity * 0.7})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = star.size;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.dx * 3, star.y - star.dy * 3);
        ctx.stroke();
      });

      // Cleanup inactive shooting stars to prevent memory growth
      shootingStars = shootingStars.filter(s => s.active);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted]);

  return (
    <canvas
      ref={canvasRef}
      className="cosmic-canvas"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
