"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Lenis smooth scrolling — the same library the live Opus site uses
 * (`html.lenis`). Eased with the site's signature curve, cubic-bezier(0.34,0,0,1),
 * so wheel/scroll momentum matches. `Header` reads this instance via `useLenis`
 * to stop/start scrolling while the menu overlay is open.
 */

/** Solve a CSS cubic-bezier(x1,y1,x2,y2) into an easing fn f(t)∈[0,1]. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) return t;
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return t;
  };
  return (x: number) => sampleY(solveX(x));
}

const SCROLL_EASE = cubicBezier(0.34, 0, 0, 1);

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ duration: 1.1, easing: SCROLL_EASE, smoothWheel: true }}
    >
      {children}
    </ReactLenis>
  );
}

export default SmoothScroll;
