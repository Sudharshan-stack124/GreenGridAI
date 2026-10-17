import React, { useEffect, useRef, useState } from "react";

export const Cursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    const onEnterInteractive = () => setIsHovering(true);
    const onLeaveInteractive = () => setIsHovering(false);

    const addInteractiveListeners = () => {
      const interactives = document.querySelectorAll(
        "a, button, [role='button'], input, select, textarea, label, .gg-shipment-item, .gg-disruption-item, .gg-scenario-card, .gg-nav-segment"
      );
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    };

    // Re-attach interactive listeners on DOM changes
    const observer = new MutationObserver(() => {
      addInteractiveListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    addInteractiveListeners();

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      ringX = lerp(ringX, dotX, 0.12);
      ringY = lerp(ringY, dotY, 0.12);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className={`gg-cursor-ring ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
        aria-hidden="true"
      />
      {/* Precise dot */}
      <div
        ref={dotRef}
        className={`gg-cursor-dot ${isHovering ? "hovering" : ""} ${isClicking ? "clicking" : ""}`}
        aria-hidden="true"
      />
    </>
  );
};
