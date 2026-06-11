import type { CtaEntry } from "./types";

const withLeadingSlash = (slug: string) =>
  slug.startsWith("/") ? slug : `/${slug}`;

/**
 * Resolve a CTA entry to a single href. Priority follows `linkBehavior` when
 * set, then falls back through external → internal → download so a CTA with any
 * one link field populated still resolves. Returns "#" when nothing is set.
 */
export function resolveCtaHref(cta: CtaEntry): string {
  switch (cta.linkBehavior) {
    case "Download":
      if (cta.downloadableAsset?.url) return cta.downloadableAsset.url;
      break;
    case "Internal":
      if (cta.internalLink?.slug) return withLeadingSlash(cta.internalLink.slug);
      break;
    case "External":
      if (cta.externalLink) return cta.externalLink;
      break;
  }

  // Fallbacks when linkBehavior is unset or its matching field is empty.
  if (cta.externalLink) return cta.externalLink;
  if (cta.internalLink?.slug) return withLeadingSlash(cta.internalLink.slug);
  if (cta.downloadableAsset?.url) return cta.downloadableAsset.url;
  return "#";
}

/** True for absolute/protocol links that should render as a plain `<a>`. */
export function isExternalHref(href: string): boolean {
  return (
    /^https?:\/\//i.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("//")
  );
}
