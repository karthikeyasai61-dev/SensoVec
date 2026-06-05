"use client";

import { useState, useEffect, useCallback } from "react";
import "./HomeGallery.css";

interface GalleryItem {
  id: string;
  title?: string;
  description: string;
  imageUrl: string;
}

const DEFAULT_SLIDES: GalleryItem[] = [
  {
    id: "default-1",
    title: "Sense • Think • Move",
    description: "Learn the fundamentals and advanced topics of autonomous systems. Build projects, control algorithms, and robotic software stacks.",
    imageUrl: "/student_project.png",
  },
  {
    id: "default-2",
    title: "Global Careers & Training",
    description: "Connect with leading autonomous vehicle, drone, and aerospace companies looking for skilled robotic systems engineering.",
    imageUrl: "/student_male.png",
  },
  {
    id: "default-3",
    title: "Empowering Next-Gen Innovators",
    description: "Join hands-on, mentor-led courses that equip you with industry-grade certifications and deep technical training.",
    imageUrl: "/student_female.png",
  },
];

export default function HomeGallery({ items = [] }: { items?: GalleryItem[] }) {
  const slides = items.length > 0 ? items : DEFAULT_SLIDES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto slide effect
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, slides.length, handleNext]);

  const currentSlide = slides[activeIndex];

  return (
    <div 
      className="gallery-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="gallery-slide-card">
        <div className="gallery-slide-wrapper">
          {/* Left Column: Content */}
          <div className="gallery-description-column">
            <span key={`tag-${activeIndex}`} className="gallery-tag animate-text">
              Featured
            </span>
            <h2 key={`title-${activeIndex}`} className="gallery-title animate-text">
              {currentSlide.title || "Autonomous Technology"}
            </h2>
            <p key={`desc-${activeIndex}`} className="gallery-description animate-text">
              {currentSlide.description}
            </p>
          </div>

          {/* Right Column: Image */}
          <div className="gallery-image-column">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              key={`img-${activeIndex}`}
              src={currentSlide.imageUrl} 
              alt={currentSlide.title || "Gallery Slide"} 
              className="gallery-image animate-img"
            />
            <div className="gallery-image-overlay"></div>
          </div>
        </div>
      </div>

      {/* Navigation Chevrons */}
      {slides.length > 1 && (
        <>
          <button 
            className="gallery-nav-btn prev" 
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className="gallery-nav-btn next" 
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </>
      )}

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="gallery-dots-container">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`gallery-dot ${activeIndex === index ? "active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
