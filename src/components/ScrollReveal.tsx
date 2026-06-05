"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  activeClass?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({ children, className = "", activeClass = "visible", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // Check if the element is already in the viewport (or above it)
    const rect = ref.current.getBoundingClientRect();
    const isInitiallyInView = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInitiallyInView) {
      setIsVisible(true);
      return;
    }

    // Use IntersectionObserver for scroll-triggered reveal
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.05,
          rootMargin: "0px 0px -40px 0px"
        }
      );

      observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      // Fallback window scroll listener
      const handleScroll = () => {
        if (!ref.current) return;
        const currentRect = ref.current.getBoundingClientRect();
        if (currentRect.top < window.innerHeight) {
          setIsVisible(true);
          window.removeEventListener("scroll", handleScroll);
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div ref={ref} className={`${className} ${isVisible ? activeClass : ""}`} style={style}>
      {children}
    </div>
  );
}
