/**
 * Site-level SEO constants + structured-data builders shared across routes.
 * `SITE_URL` drives `metadataBase` (so relative OG/canonical URLs resolve to
 * absolute) and the JSON-LD below. Set NEXT_PUBLIC_SITE_URL to the production
 * domain — the fallback is a placeholder.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supersample.studio"
).replace(/\/+$/, "");

export const SITE_NAME = "Super Sample Studio";

export const SITE_TAGLINE =
  "Super Sample Studio — Brand, Product & Web Design Agency";

export const SITE_DESCRIPTION =
  "Super Sample Studio is a design agency helping companies build stronger brands, better products, and websites that actually perform.";

/**
 * Brand facts used in structured data — the single source of truth. Update here
 * if any of these change. The social URLs mirror the header links; swap them for
 * the studio's real profiles when available.
 */
export const BRAND = {
  email: "hello@supersample.studio",
  sameAs: [
    "https://www.facebook.com",
    "https://www.dribbble.com",
    "https://www.instagram.com",
    "https://www.behance.net",
  ],
  services: [
    "Brand Identity",
    "Web Design",
    "Product Design",
    "Development",
    "Motion Design",
  ],
} as const;

/** Resolve a path or partial URL to an absolute URL on the canonical host. */
export function absoluteUrl(path?: string | null): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Sitewide Organization schema (rendered once in the root layout). Establishes
 * the agency entity: name, logo, description, services, and social profiles.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/assets/images/logo-full.svg"),
    },
    image: absoluteUrl("/assets/images/logo-full.svg"),
    description: SITE_DESCRIPTION,
    email: BRAND.email,
    sameAs: BRAND.sameAs,
    knowsAbout: BRAND.services,
    areaServed: "Worldwide",
    contactPoint: {
      "@type": "ContactPoint",
      email: BRAND.email,
      contactType: "sales",
      availableLanguage: ["en"],
    },
  };
}

/** Sitewide WebSite schema, linked to the Organization as publisher. */
export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
  };
}
