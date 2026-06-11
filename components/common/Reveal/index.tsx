"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";

/**
 * On-mount slide-in: the element rises (translateY) and fades in, matching the
 * live Opus hero's entrance. Uses the site's signature curve,
 * cubic-bezier(0.34,0,0,1). Stagger sibling reveals with the `delay` prop.
 * Honors prefers-reduced-motion (renders immediately, no transition).
 */

const EASE = "cubic-bezier(0.34, 0, 0, 1)";

type RevealProps = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before this element starts animating (for stagger). */
  delay?: number;
  /** Slide distance in px. */
  y?: number;
  /** Seconds. */
  duration?: number;
};

export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 48,
  duration = 1,
}: RevealProps) {
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf1 = 0;
    let raf2 = 0;
    if (reduce) {
      // Reveal immediately, no transition.
      raf1 = requestAnimationFrame(() => {
        setInstant(true);
        setShown(true);
      });
    } else {
      // Two frames so the initial (hidden) state paints before transitioning.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
    }
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <Tag
      className={className}
      style={{
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        opacity: shown ? 1 : 0,
        transition: instant
          ? "none"
          : `transform ${duration}s ${EASE} ${delay}s, opacity ${duration}s ${EASE} ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
