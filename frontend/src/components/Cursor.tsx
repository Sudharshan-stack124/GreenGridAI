import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export const Cursor: React.FC = () => {
  const { theme } = useTheme();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Track hovered interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        "a, button, [role='button'], input, select, textarea, label, .gg-shipment-item, .gg-disruption-item, .gg-scenario-card, .gg-nav-segment, .landing-chip"
      ) as HTMLElement | null;

      if (target) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", handleElementHover, { passive: true });

    // Smooth lerp loop
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.15);
      ringY = lerp(ringY, mouseY, 0.15);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", handleElementHover);
    };
  }, []);

  return (
    <>
      {/* Outer fluid frosted ring */}
      <div
        ref={ringRef}
        className={`gg-cursor-ring ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
        aria-hidden="true"
      />
      {/* Inner sharp precision point */}
      <div
        ref={dotRef}
        className={`gg-cursor-dot ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
        aria-hidden="true"
      />
    </>
  );
};
