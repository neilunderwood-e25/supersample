#!/usr/bin/env node
/*
 * Seed script for the "Hero" section.
 *
 *   - Creates (or updates) + publishes the `hero` content type
 *   - Allows `hero` as a section on `flexiblePage` (+ republishes it)
 *   - Uploads /tmp/opus-hero-asset.png as an asset (Upload API → process → publish)
 *   - Creates + publishes a `hero` entry (frontEndComponent = "Hero / Default")
 *   - Attaches that entry to the `home` page's sections (+ republishes the page)
 *
 * Re-runnable: existing content types / entries / assets are updated in place.
 *
 * Env (from .env.local next to package.json):
 *   CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT (opt)
 *
 * Usage:  node /path/to/project/scripts/seed-hero.mjs
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
const IMAGE_PATH = "/tmp/opus-hero-asset.jpg";

if (!SPACE || !CMA) {
  console.error("✗ CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN required in .env.local.");
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const UPLOAD_BASE = `https://upload.contentful.com/spaces/${SPACE}/environments/${ENV}`;

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const locales = await api("/locales");
const LOCALE =
  locales.items.find((l) => l.default)?.code || locales.items[0]?.code || "en-US";
const L = (v) => ({ [LOCALE]: v });

// ── 1. Content type ──────────────────────────────────────────────────────────
const HERO_TYPE = {
  name: "Hero",
  description: "Full-width hero section with split display typography.",
  displayField: "internalTitle",
  fields: [
    { id: "internalTitle", name: "Internal Title", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Front End Component",
      type: "Symbol",
      validations: [{ in: ["Hero / Default"] }],
    },
    { id: "headingLineOne", name: "Heading Line One", type: "Symbol" },
    { id: "headingLineTwo", name: "Heading Line Two", type: "Symbol" },
    { id: "subheading", name: "Subheading", type: "Symbol" },
    { id: "image", name: "Image", type: "Link", linkType: "Asset" },
    { id: "ctaLabel", name: "CTA Label", type: "Symbol" },
    { id: "ctaHref", name: "CTA Href", type: "Symbol" },
  ],
};

const upsertContentType = async (id, spec) => {
  let version;
  try {
    version = (await api(`/content_types/${id}`)).sys.version;
    console.log(`• content type "${id}" exists (v${version}) → updating`);
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log(`• content type "${id}" → creating`);
  }
  const result = await api(`/content_types/${id}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify(spec),
  });
  await api(`/content_types/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(result.sys.version) },
  });
  console.log(`  ✓ published content type "${id}"`);
};

await upsertContentType("hero", HERO_TYPE);

// ── 2. Allow `hero` as a section on flexiblePage ───────────────────────────────
{
  const fp = await api("/content_types/flexiblePage");
  const sections = fp.fields.find((f) => f.id === "sections");
  const current = sections.items.validations?.[0]?.linkContentType ?? [];
  if (!current.includes("hero")) {
    sections.items.validations = [{ linkContentType: [...new Set([...current, "hero"])] }];
    const updated = await api("/content_types/flexiblePage", {
      method: "PUT",
      headers: { "X-Contentful-Version": String(fp.sys.version) },
      body: JSON.stringify({
        name: fp.name,
        description: fp.description,
        displayField: fp.displayField,
        fields: fp.fields,
      }),
    });
    await api("/content_types/flexiblePage/published", {
      method: "PUT",
      headers: { "X-Contentful-Version": String(updated.sys.version) },
    });
    console.log('  ✓ flexiblePage now allows "hero" sections');
  } else {
    console.log('• flexiblePage already allows "hero" sections');
  }
}

// ── 3. Upload + create + publish the hero image asset ──────────────────────────
const ASSET_ID = "opus-hero-image";
let assetLinked = false;
if (existsSync(IMAGE_PATH)) {
  const bytes = readFileSync(IMAGE_PATH);
  const upRes = await fetch(`${UPLOAD_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CMA}`,
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!upRes.ok) throw new Error(`upload failed → ${upRes.status}\n${await upRes.text()}`);
  const uploadId = (await upRes.json()).sys.id;
  console.log(`• uploaded image bytes (upload ${uploadId})`);

  let version;
  try {
    version = (await api(`/assets/${ASSET_ID}`)).sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const asset = await api(`/assets/${ASSET_ID}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify({
      fields: {
        title: L("Opus hero abstract"),
        description: L("Abstract monochrome artwork for the hero section."),
        file: L({
          contentType: "image/jpeg",
          fileName: "opus-hero.jpg",
          uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
        }),
      },
    }),
  });
  await api(`/assets/${ASSET_ID}/files/${LOCALE}/process`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(asset.sys.version) },
  });

  // poll until processed (file url present)
  let processed;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    processed = await api(`/assets/${ASSET_ID}`);
    if (processed.fields?.file?.[LOCALE]?.url) break;
  }
  if (!processed?.fields?.file?.[LOCALE]?.url) throw new Error("asset never finished processing");
  await api(`/assets/${ASSET_ID}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(processed.sys.version) },
  });
  console.log(`  ✓ published asset "${ASSET_ID}" (${processed.fields.file[LOCALE].url})`);
  assetLinked = true;
} else {
  console.log(`• ${IMAGE_PATH} not found — creating hero entry without an image`);
}

// ── 4. Create + publish the hero entry ─────────────────────────────────────────
const ENTRY_ID = "hero-opus";
const upsertEntry = async (contentType, id, fields) => {
  let version;
  try {
    version = (await api(`/entries/${id}`)).sys.version;
    console.log(`• entry "${id}" exists (v${version}) → updating`);
  } catch (e) {
    if (e.status !== 404) throw e;
    console.log(`• entry "${id}" → creating`);
  }
  const result = await api(`/entries/${id}`, {
    method: "PUT",
    headers: {
      "X-Contentful-Content-Type": contentType,
      ...(version ? { "X-Contentful-Version": String(version) } : {}),
    },
    body: JSON.stringify({ fields }),
  });
  await api(`/entries/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(result.sys.version) },
  });
  console.log(`  ✓ published entry "${id}"`);
  return result;
};

const heroFields = {
  internalTitle: L("Home Hero — Super Sample Studio"),
  frontEndComponent: L("Hero / Default"),
  headingLineOne: L("Super Sample"),
  headingLineTwo: L("Studio"),
  subheading: L(
    "At Opus, we help companies build stronger brands, better products, and websites that actually perform."
  ),
  ctaLabel: L("Browse our services"),
  ctaHref: L("#services"),
};
if (assetLinked) {
  heroFields.image = L({ sys: { type: "Link", linkType: "Asset", id: ASSET_ID } });
}
await upsertEntry("hero", ENTRY_ID, heroFields);

// ── 5. Attach the hero entry to the home page (append, don't clobber) ──────────
{
  const home = await api("/entries/home");
  const list = home.fields.sections?.[LOCALE] ?? [];
  const present = list.some((l) => l?.sys?.id === ENTRY_ID);
  if (!present) {
    const next = [{ sys: { type: "Link", linkType: "Entry", id: ENTRY_ID } }, ...list];
    const updated = await api("/entries/home", {
      method: "PUT",
      headers: {
        "X-Contentful-Content-Type": "flexiblePage",
        "X-Contentful-Version": String(home.sys.version),
      },
      body: JSON.stringify({ fields: { ...home.fields, sections: L(next) } }),
    });
    await api("/entries/home/published", {
      method: "PUT",
      headers: { "X-Contentful-Version": String(updated.sys.version) },
    });
    console.log('  ✓ attached hero to "home" page + republished');
  } else {
    console.log('• hero already attached to "home" page');
  }
}

console.log("\nDone. Hero section seeded and attached to the home page.");
