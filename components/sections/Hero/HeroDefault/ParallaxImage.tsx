"use client";

import { useEffect, useRef } from "react";

type ParallaxImageProps = { src: string };

/**
 * The hero image sits in a short clip window while the underlying image is
 * taller, so it can drift vertically as the page scrolls — the same parallax
 * the live site uses. Travel is bounded to the image's vertical overflow so no
 * edges are ever revealed.
 */
export function ParallaxImage({ src }: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const RANGE = 180; // px of travel in each direction (overflow is 200px each side)
    let raf = 0;

    const update = () => {
      raf = 0;
      const frame = frameRef.current;
      const img = imgRef.current;
      if (!frame || !img) return;
      const rect = frame.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the frame's center is at the viewport center; ± as it moves away.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const ty = Math.max(-RANGE, Math.min(RANGE, progress * RANGE * 1.6));
      img.style.transform = `translate3d(0, ${ty.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="absolute inset-0 overflow-hidden rounded-[12px] bg-[var(--bg-muted)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 top-[-200px] h-[calc(100%+400px)] w-full object-cover will-change-transform"
      />
    </div>
  );
}
