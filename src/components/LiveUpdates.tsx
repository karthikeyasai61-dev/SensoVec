"use client";

import { useState } from "react";
import "./LiveUpdates.css";

interface LiveUpdateItem {
  id: string;
  title?: string;
  description: string;
  imageUrl: string;
}

const DEFAULT_CARDS: LiveUpdateItem[] = [
  { id: "d1", title: "New Robotics Workshop", description: "Join our hands-on robotics workshop and build your first autonomous robot from scratch.", imageUrl: "/student_project.png" },
  { id: "d2", title: "Internship Drive Open", description: "Applications are now open for summer internships at leading autonomous systems companies.", imageUrl: "/student_male.png" },
  { id: "d3", title: "Certification Program", description: "Earn an industry-recognised certification in embedded systems and control algorithms.", imageUrl: "/student_female.png" },
  { id: "d4", title: "Drone Engineering", description: "Master drone flight systems, autopilot software, and aerial mapping technologies.", imageUrl: "/student_project.png" },
  { id: "d5", title: "AI & Robotics Bootcamp", description: "An intensive 4-week bootcamp covering deep learning, computer vision, and robot control.", imageUrl: "/student_male.png" },
  { id: "d6", title: "Career Placement Drive", description: "Get connected with top autonomous systems companies hiring for full-time roles.", imageUrl: "/student_female.png" },
];

export default function LiveUpdates({ items = [] }: { items?: LiveUpdateItem[] }) {
  const cards = items.length > 0 ? items : DEFAULT_CARDS;
  const N = cards.length;

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % N);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + N) % N);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  if (N === 0) return null;

  return (
    <div className="lu-outer">
      <div className="lu-big-card">
        {/* Header */}
        <div className="lu-header">
          <div className="lu-badge">
            <span className="lu-badge-dot" />
            Live Updates
          </div>
        </div>

        {/* Viewport — clips overflow */}
        <div className="lu-viewport">
          {/* Navigation Arrows */}
          {N > 1 && (
            <>
              <button className="lu-nav-btn lu-prev" onClick={handlePrev} aria-label="Previous slide">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button className="lu-nav-btn lu-next" onClick={handleNext} aria-label="Next slide">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </>
          )}

          <div 
            className="lu-marquee-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            {cards.map((card) => (
              <div key={card.id} className="lu-card">
                <div className="lu-card-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.imageUrl} alt={card.title || "Update"} className="lu-card-img" />
                  <div className="lu-card-img-overlay" />
                </div>
                <div className="lu-card-body">
                  {card.title && <h3 className="lu-card-title">{card.title}</h3>}
                  <p className="lu-card-desc">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicators */}
        {N > 1 && (
          <div className="lu-dots">
            {cards.map((_, idx) => (
              <button
                key={idx}
                className={`lu-dot ${idx === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
