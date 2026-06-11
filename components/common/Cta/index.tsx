"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type {
  CtaEntry,
  CtaSize,
  CtaVariant,
} from "@/lib/contentful/common/types";
import {
  isExternalHref,
  resolveCtaHref,
} from "@/lib/contentful/common/resolveCtaHref";
import { getLocaleFromPathname, localizeHref } from "@/lib/i18n/locale";

/**
 * Reusable CTA button. `variant` (Primary | Secondary) and `size` (Small |
 * Medium | Large) are routed with switch-case, so adding an option in
 * Contentful means adding one branch here. Colors come from CSS variables in
 * app/globals.css — never hard-coded hex (see components/ARCHITECTURE.md).
 */

type CtaProps = {
  cta: CtaEntry;
  className?: string;
};

const sizeClasses = (size: CtaSize): string => {
  switch (size) {
    case "Small":
      return "px-5 py-2 text-[15px]";
    case "Large":
      return "px-9 py-4 text-[20px]";
    case "Medium":
    default:
      return "px-7 py-3 text-[17px]";
  }
};

const variantClasses = (variant: CtaVariant): string => {
  switch (variant) {
    case "Secondary":
      return "border border-[var(--text-default)] text-[var(--text-default)] hover:bg-[var(--text-default)] hover:text-[var(--background)]";
    case "Primary":
    default:
      return "border border-transparent bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]";
  }
};

export function Cta({ cta, className = "" }: CtaProps) {
  const current = getLocaleFromPathname(usePathname() ?? "/");

  if (!cta?.label) return null;

  const href = resolveCtaHref(cta);
  const variant = (cta.variant as CtaVariant) || "Primary";
  const size = (cta.size as CtaSize) || "Medium";

  const external = isExternalHref(href) || cta.linkBehavior === "Download";
  const openNewTab = cta.newTab ?? external;

  const classes = [
    "group/cta inline-flex w-fit items-center justify-center gap-2 rounded-full font-medium leading-none tracking-[-0.01em] transition-colors duration-300",
    sizeClasses(size),
    variantClasses(variant),
    cta.fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span>{cta.label}</span>
      {cta.showArrow ? (
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover/cta:translate-x-1"
        >
          →
        </span>
      ) : null}
    </>
  );

  // Internal app routes use next/link for client-side navigation; external and
  // downloadable links use a plain anchor.
  if (!external && href.startsWith("/")) {
    return (
      <Link href={localizeHref(href, current)} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      target={openNewTab ? "_blank" : undefined}
      rel={openNewTab ? "noopener noreferrer" : undefined}
      download={cta.linkBehavior === "Download" ? "" : undefined}
    >
      {inner}
    </a>
  );
}

export default Cta;
