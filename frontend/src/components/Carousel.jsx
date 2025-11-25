import React, { useState, useEffect, useCallback } from "react";
import {
  BsArrowLeftCircleFill,
  BsArrowRightCircleFill,
} from "react-icons/bs";

export const Carousel = ({ data = [] }) => {
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Go to next slide
  const nextSlide = useCallback(() => {
    setSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  }, [data.length]);

  // Go to previous slide
  const prevSlide = () => {
    setSlide((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  // Auto-play every 4 seconds
  useEffect(() => {
    if (isPaused || data.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, data.length, nextSlide]);

  if (!data || data.length === 0) {
    return <div className="carousel">No images found.</div>;
  }

  return (
    <>
      {/* INLINE CSS */}
      <style>{`
        .carousel {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 600px;
          height: 400px;
        }

        .slide {
          border-radius: 5rem;
          box-shadow: 0px 0px 7px #666;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.5s ease-in-out;
        }

        .slide-hidden {
          display: none;
        }

        .arrow {
          position: absolute;
          filter: drop-shadow(0px 0px 5px #555);
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .arrow:hover {
          cursor: pointer;
        }

        .arrow-left {
          left: 1rem;
        }

        .arrow-right {
          right: 1rem;
        }

        .indicators {
          display: flex;
          position: absolute;
          bottom: 1rem;
        }

        .indicator {
          background-color: white;
          height: 0.5rem;
          width: 0.5rem;
          border-radius: 100%;
          border: none;
          outline: none;
          box-shadow: 0px 0px 5px #555;
          margin: 0 0.2rem;
          cursor: pointer;
        }

        .indicator-inactive {
          background-color: grey;
        }
      `}</style>

      {/* CAROUSEL */}
      <div
        className="carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Arrow */}
        <BsArrowLeftCircleFill
          onClick={prevSlide}
          className="arrow arrow-left"
        />

        {/* Slides */}
        {data.map((item, idx) => (
          <img
            src={item.src}
            alt={item.alt || `slide-${idx}`}
            key={idx}
            className={slide === idx ? "slide" : "slide slide-hidden"}
          />
        ))}

        {/* Right Arrow */}
        <BsArrowRightCircleFill
          onClick={nextSlide}
          className="arrow arrow-right"
        />

        {/* Indicators */}
        <span className="indicators">
          {data.map((_, idx) => (
            <button
              key={idx}
              className={
                slide === idx ? "indicator" : "indicator indicator-inactive"
              }
              onClick={() => setSlide(idx)}
            ></button>
          ))}
        </span>
      </div>
    </>
  );
};
