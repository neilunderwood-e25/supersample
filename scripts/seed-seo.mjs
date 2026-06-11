#!/usr/bin/env node
/*
 * Fills the home page's SEO entry ("seo-home"): title, description, canonical,
 * OG image (the hero asset), and index/follow flags. The agency Organization +
 * WebSite structured data is rendered site-wide from lib/seo.ts, so it isn't
 * stored here; the per-page `seoSchemaMarkup` field stays free for page-specific
 * schema if ever needed.
 *
 * Re-runnable. Env (from .env.local): CONTENTFUL_SPACE_ID,
 * CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT (optional).
 *
 * NOTE: SITE_URL below is a placeholder — change it (and NEXT_PUBLIC_SITE_URL)
 * to the real production domain.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const envFile = join(scriptDir, "..", ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";
const CMA = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
if (!SPACE || !CMA) {
  console.error("✗ CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN required in .env.local.");
  process.exit(1);
}

const SITE_URL = "https://supersample.studio";
const OG_ASSET_ID = "opus-hero-image";

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const api = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${CMA}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`${opts.method || "GET"} ${path} → ${res.status}\n${text}`);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
};

const locales = await api("/locales");
const LOCALE =
  locales.items.find((l) => l.default)?.code || locales.items[0]?.code || "en-US";
const L = (v) => ({ [LOCALE]: v });

const fields = {
  seoTitle: L("Super Sample Studio — Brand, Product & Web Design Agency"),
  seoDescription: L(
    "Super Sample Studio is a design agency helping companies build stronger brands, better products, and websites that actually perform."
  ),
  seoCanonicalUrl: L(`${SITE_URL}/`),
  seoOgImage: L({ sys: { type: "Link", linkType: "Asset", id: OG_ASSET_ID } }),
  seoNoIndex: L(false),
  seoNoFollow: L(false),
};

const existing = await api("/entries/seo-home");
console.log(`• entry "seo-home" (v${existing.sys.version}) → updating`);
const result = await api("/entries/seo-home", {
  method: "PUT",
  headers: {
    "X-Contentful-Content-Type": "seo",
    "X-Contentful-Version": String(existing.sys.version),
  },
  // Merge over the existing fields so nothing else is dropped.
  body: JSON.stringify({ fields: { ...existing.fields, ...fields } }),
});
await api("/entries/seo-home/published", {
  method: "PUT",
  headers: { "X-Contentful-Version": String(result.sys.version) },
});
console.log("  ✓ published home SEO (title, description, canonical, OG image).");
