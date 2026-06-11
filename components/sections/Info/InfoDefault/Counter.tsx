"use client";

import { useEffect, useRef, useState } from "react";
import type { StatItem } from "@/lib/sections/types";

type CounterProps = { stat: StatItem };

const DURATION = 1800; // ms
// Ease-out cubic — fast start, gentle settle.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A single stat: prefix + a number that counts up from 0 to `value` the first
 * time it scrolls into view, + suffix, with a muted label beneath. Honors
 * prefers-reduced-motion (jumps straight to the value).
 */
export function Counter({ stat }: CounterProps) {
  const { prefix, value, suffix, label } = stat;
  const target = value ?? 0;
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (done.current) return;
      done.current = true;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(target);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        setDisplay(Math.round(easeOut(t) * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="flex flex-1 flex-col gap-3 max-md:flex-none">
      <div className="flex items-center font-medium leading-none tracking-[-0.02em] text-[var(--brand-primary)] text-[clamp(56px,5vw,96px)]">
        {prefix}
        {value != null ? display : null}
        {suffix}
      </div>
      {label && (
        <p className="text-[18px] font-medium leading-[1.4] tracking-[-0.02em] text-[var(--text-muted)]">
          {label}
        </p>
      )}
    </div>
  );
}
