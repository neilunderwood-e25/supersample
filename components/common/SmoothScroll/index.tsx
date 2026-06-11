"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

/**
 * Lenis smooth scrolling — the same library the live Opus site uses
 * (`html.lenis`). Uses lerp-based smoothing (frame-rate-independent), which
 * stays responsive from the first frame and matches the live site's feel. A
 * fixed duration + eased curve felt heavy/"stuck" because the curve starts
 * flat, so small scrolls barely moved. `Header` reads this instance via
 * `useLenis` to stop/start scrolling while the menu overlay is open.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

export default SmoothScroll;
