#!/usr/bin/env node
/*
 * Seed script for the reusable "common" content types: cta, image, video.
 *
 * These are the building-block entry types that sections reference (rendered by
 * components/common/{Cta,ResponsiveImage,VideoPlayer}). Creating + publishing
 * them makes the matching GraphQL fragments (CtaFields/ImageFields/VideoFields)
 * resolvable and lets section content types add Link fields to them.
 *
 * Re-runnable. Env (from .env.local): CONTENTFUL_SPACE_ID,
 * CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT (optional).
 *
 * Usage:  node /path/to/project/scripts/seed-common.mjs
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

const CTA_TYPE = {
  name: "CTA",
  description: "Reusable call-to-action button referenced by sections.",
  displayField: "internalName",
  fields: [
    { id: "internalName", name: "Internal Name", type: "Symbol", required: true },
    { id: "label", name: "Label", type: "Symbol" },
    { id: "variant", name: "Variant", type: "Symbol", validations: [{ in: ["Primary", "Secondary"] }] },
    { id: "size", name: "Size", type: "Symbol", validations: [{ in: ["Small", "Medium", "Large"] }] },
    { id: "linkBehavior", name: "Link Behavior", type: "Symbol", validations: [{ in: ["Internal", "External", "Download"] }] },
    { id: "newTab", name: "Open in New Tab", type: "Boolean" },
    { id: "showArrow", name: "Show Arrow", type: "Boolean" },
    { id: "fullWidth", name: "Full Width", type: "Boolean" },
    { id: "externalLink", name: "External Link", type: "Symbol" },
    { id: "internalLink", name: "Internal Link", type: "Link", linkType: "Entry", validations: [{ linkContentType: ["flexiblePage"] }] },
    { id: "downloadableAsset", name: "Downloadable Asset", type: "Link", linkType: "Asset" },
  ],
};

const IMAGE_TYPE = {
  name: "Image",
  description: "Reusable image with an optional art-directed mobile asset.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "altText", name: "Alt Text", type: "Symbol" },
    { id: "caption", name: "Caption", type: "Symbol" },
    { id: "priority", name: "Priority", type: "Boolean" },
    { id: "desktop", name: "Desktop", type: "Link", linkType: "Asset" },
    { id: "mobile", name: "Mobile", type: "Link", linkType: "Asset" },
  ],
};

const VIDEO_TYPE = {
  name: "Video",
  description: "Reusable video — self-hosted asset, YouTube, or Vimeo.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "altText", name: "Alt Text", type: "Symbol" },
    { id: "videoType", name: "Video Type", type: "Symbol", validations: [{ in: ["Self Hosted", "YouTube", "Vimeo"] }] },
    { id: "youtubeId", name: "YouTube ID", type: "Symbol" },
    { id: "vimeoId", name: "Vimeo ID", type: "Symbol" },
    { id: "autoplay", name: "Autoplay", type: "Boolean" },
    { id: "loop", name: "Loop", type: "Boolean" },
    { id: "muted", name: "Muted", type: "Boolean" },
    { id: "controls", name: "Controls", type: "Boolean" },
    { id: "selfHostedSource", name: "Self Hosted Source", type: "Link", linkType: "Asset" },
    { id: "posterImage", name: "Poster Image", type: "Link", linkType: "Asset" },
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

await upsertContentType("cta", CTA_TYPE);
await upsertContentType("image", IMAGE_TYPE);
await upsertContentType("video", VIDEO_TYPE);

console.log("\nDone. Common content types (cta, image, video) created + published.");
