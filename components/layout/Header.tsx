"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com" },
  { label: "Dribbble", href: "https://www.dribbble.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "Behance", href: "https://www.behance.net" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  // Hide the bar on scroll-down, reveal on scroll-up (always visible near the
  // top and whenever the menu is open). Driven by the shared Lenis instance.
  const lenis = useLenis(
    (instance) => {
      if (open) {
        setHidden(false);
        return;
      }
      const y = instance.scroll;
      if (y < 80) {
        setHidden(false);
        lastScroll.current = y;
        return;
      }
      const delta = y - lastScroll.current;
      if (Math.abs(delta) > 4) {
        setHidden(delta > 0);
        lastScroll.current = y;
      }
    },
    [open]
  );

  // Lock scroll while the overlay is open — both the native fallback and Lenis.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, lenis]);

  // Escape closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Top bar — sits above the overlay so the logo + toggle stay visible. */}
      {/* Glass background bar — sits BELOW the overlay (z-55 < z-60), so the
          blue slides over the glass on open/close; the logo + Menu bar (z-70)
          stays above the blue. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[55] h-[78px] bg-[color-mix(in_srgb,var(--background)_65%,transparent)] backdrop-blur-md max-md:h-[72px]"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.34, 0, 0, 1)",
        }}
      />
      <header
        className="fixed inset-x-0 top-0 z-[70]"
        style={{
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.34, 0, 0, 1)",
        }}
      >
        <div className="mx-auto flex max-w-[1920px] items-center justify-between px-[60px] py-5 max-md:px-5 max-md:py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Super Sample, home"
          className="inline-flex cursor-pointer items-center"
        >
          {/* Mobile: compact square mark (dark, reads on white + the blue overlay) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo-mark.svg"
            alt=""
            className="block h-10 w-10 md:hidden"
          />
          {/* Desktop: full wordmark — flips to white over the open overlay. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo-full.svg"
            alt=""
            className="hidden h-9 w-auto md:block"
            style={{
              filter: open ? "brightness(0) invert(1)" : undefined,
              transition: "filter 0.3s",
              transitionDelay: open ? "0.08s" : "0s",
            }}
          />
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer rounded-full px-5 py-2.5 text-[18px] font-medium leading-none tracking-[-0.02em] transition-colors duration-300 max-md:px-4 max-md:py-2 max-md:text-[16px]"
          style={{
            backgroundColor: open ? "#ffffff" : "var(--brand-primary)",
            color: open ? "var(--brand-primary)" : "#ffffff",
            transitionDelay: open ? "0.08s" : "0s",
          }}
        >
          Menu
        </button>
        </div>
      </header>

      {/* Full-screen navigation overlay. Reveals from the top down via an
          animated clip-path so the page content underneath stays in place. */}
      <div
        aria-hidden={!open}
        className="fixed inset-0 z-[60] bg-[var(--menu-overlay)] text-[var(--menu-foreground)]"
        style={{
          clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: `clip-path 0.6s ${EASE}`,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1920px] justify-between px-[60px] pb-[60px] pt-[150px] max-md:flex-col max-md:justify-start max-md:gap-[clamp(20px,4dvh,48px)] max-md:overflow-y-auto max-md:px-5 max-md:pb-[5dvh] max-md:pt-[12dvh]">
          {/* Primary nav — large, wipes in left-to-right, staggered. */}
          <nav className="flex flex-col gap-[clamp(10px,1.2vw,22px)] max-md:gap-[1.2dvh]">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="relative block w-fit cursor-pointer font-medium leading-[1.08] tracking-[-0.03em] text-[clamp(34px,3.6vw,64px)] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:bg-current after:content-[''] after:transition-[width] after:duration-300 after:ease-[cubic-bezier(0.34,0,0,1)] hover:after:w-full max-md:text-[clamp(26px,5.4dvh,48px)]"
                style={{
                  // Negative top/bottom insets expand the clip past the box so
                  // glyph ascenders/descenders (e.g. the "g" in Blog) aren't
                  // clipped; only the right inset animates (the L→R wipe).
                  clipPath: open
                    ? "inset(-0.3em 0 -0.3em 0)"
                    : "inset(-0.3em 100% -0.3em 0)",
                  transition: `clip-path 0.55s ${EASE}`,
                  transitionDelay: open ? `${0.2 + i * 0.06}s` : "0s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Secondary columns — fade + rise in after the primary nav. On
              mobile they drop below the nav (social in a 2-column grid). */}
          <div className="flex flex-col gap-12 pt-2 text-left max-md:gap-[clamp(16px,3dvh,32px)] max-md:pt-0">
            <MenuColumn
              label="Follow us"
              links={SOCIAL_LINKS}
              open={open}
              baseDelay={0.46}
              external
              mobileCols={2}
            />
            <MenuColumn
              label="Legal"
              links={LEGAL_LINKS}
              open={open}
              baseDelay={0.58}
            />
          </div>
        </div>
      </div>
    </>
  );
}

type MenuColumnProps = {
  label: string;
  links: { label: string; href: string }[];
  open: boolean;
  baseDelay: number;
  external?: boolean;
  mobileCols?: 1 | 2;
};

function MenuColumn({
  label,
  links,
  open,
  baseDelay,
  external,
  mobileCols = 1,
}: MenuColumnProps) {
  return (
    <div className="min-w-[200px] max-md:min-w-0">
      <p
        className="mb-4 text-[15px] tracking-[-0.01em] text-[color-mix(in_srgb,var(--menu-foreground)_55%,transparent)] max-md:mb-3"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(12px)",
          transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
          transitionDelay: open ? `${baseDelay}s` : "0s",
        }}
      >
        {label}
      </p>
      <ul
        className={`flex flex-col gap-1.5 ${
          mobileCols === 2
            ? "max-md:grid max-md:grid-cols-2 max-md:gap-x-10 max-md:gap-y-1"
            : ""
        }`}
      >
        {links.map((link, i) => (
          <li key={link.href}>
            <Link
              href={link.href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="relative inline-block cursor-pointer text-[24px] font-medium leading-[1.25] tracking-[-0.02em] text-[var(--menu-foreground)] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-current after:content-[''] after:transition-[width] after:duration-300 after:ease-[cubic-bezier(0.34,0,0,1)] hover:after:w-full max-md:text-[clamp(14px,2.2dvh,20px)]"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
                transitionDelay: open ? `${baseDelay + (i + 1) * 0.05}s` : "0s",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
