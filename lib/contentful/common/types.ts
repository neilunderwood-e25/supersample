/**
 * Shared types for the reusable "common" component entries (Cta, Image, Video).
 * These are building blocks embedded inside sections — not page sections
 * themselves. GraphQL fragments live in `lib/contentful/graphql/fragments/`,
 * components in `components/common/`. Modeled on the dynamic-fitness-2026 base.
 */

export type AssetEntry = {
  sys?: { id: string };
  url?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  description?: string | null;
  contentType?: string | null;
};

/* ---------------------------------- CTA ---------------------------------- */

export type CtaVariant = "Primary" | "Secondary";
export type CtaSize = "Small" | "Medium" | "Large";
export type CtaLinkBehavior = "Internal" | "External" | "Download";

export type CtaEntry = {
  __typename?: "Cta";
  sys: { id: string };
  /** Editor-facing identifier (display field); not rendered. */
  internalName?: string | null;
  label?: string | null;
  variant?: CtaVariant | string | null;
  size?: CtaSize | string | null;
  linkBehavior?: CtaLinkBehavior | string | null;
  newTab?: boolean | null;
  showArrow?: boolean | null;
  fullWidth?: boolean | null;
  externalLink?: string | null;
  internalLink?: { __typename?: string; slug?: string | null } | null;
  downloadableAsset?: { url?: string | null } | null;
};

/* --------------------------------- Image --------------------------------- */

export type ImageEntry = {
  __typename?: "Image";
  sys: { id: string };
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  priority?: boolean | null;
  desktop?: AssetEntry | null;
  mobile?: AssetEntry | null;
};

/* --------------------------------- Video --------------------------------- */

export type VideoType = "Self Hosted" | "YouTube" | "Vimeo";

export type VideoEntry = {
  __typename?: "Video";
  sys: { id: string };
  title?: string | null;
  altText?: string | null;
  videoType?: VideoType | string | null;
  youtubeId?: string | null;
  vimeoId?: string | null;
  autoplay?: boolean | null;
  loop?: boolean | null;
  muted?: boolean | null;
  controls?: boolean | null;
  selfHostedSource?: AssetEntry | null;
  posterImage?: AssetEntry | null;
};
