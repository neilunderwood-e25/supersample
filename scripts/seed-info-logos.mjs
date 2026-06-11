#!/usr/bin/env node
/*
 * Replaces the Info section's ticker logos with the real SVG logos exported
 * from the Figma design (downloaded to /tmp/figma-logos). Gives each SVG an
 * explicit width/height (they ship as 100% + viewBox) so <img> sizes correctly,
 * uploads them, and repoints the `info-our-vision` entry's `logos` at them.
 *
 * Re-runnable. Env from .env.local.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
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
const LOGO_DIR = "/tmp/figma-logos";
if (!SPACE || !CMA) {
  console.error("✗ CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN required.");
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const UPLOAD_BASE = `https://upload.contentful.com/spaces/${SPACE}/environments/${ENV}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
const LOCALE = locales.items.find((l) => l.default)?.code || "en-US";
const L = (v) => ({ [LOCALE]: v });

// Give the SVG explicit pixel dimensions from its viewBox so <img> has an
// intrinsic aspect ratio (Figma exports them as width/height 100%).
const fixSvg = (svg) => {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!vb) return svg;
  const w = Math.round(parseFloat(vb[1]));
  const h = Math.round(parseFloat(vb[2]));
  return svg.replace(/width="[^"]*"\s+height="[^"]*"/, `width="${w}" height="${h}"`);
};

const uploadSvg = async (id, title, svg) => {
  const up = await fetch(`${UPLOAD_BASE}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CMA}`, "Content-Type": "application/octet-stream" },
    body: Buffer.from(svg, "utf-8"),
  });
  if (!up.ok) throw new Error(`upload ${id} → ${up.status}`);
  const uploadId = (await up.json()).sys.id;

  let version;
  try {
    version = (await api(`/assets/${id}`)).sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
  }
  const asset = await api(`/assets/${id}`, {
    method: "PUT",
    headers: version ? { "X-Contentful-Version": String(version) } : {},
    body: JSON.stringify({
      fields: {
        title: L(title),
        file: L({
          contentType: "image/svg+xml",
          fileName: `${id}.svg`,
          uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
        }),
      },
    }),
  });
  await api(`/assets/${id}/files/${LOCALE}/process`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(asset.sys.version) },
  });
  let processed;
  for (let i = 0; i < 30; i++) {
    await sleep(800);
    processed = await api(`/assets/${id}`);
    if (processed.fields?.file?.[LOCALE]?.url) break;
  }
  if (!processed?.fields?.file?.[LOCALE]?.url) throw new Error(`${id} never processed`);
  await api(`/assets/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(processed.sys.version) },
  });
};

const files = readdirSync(LOGO_DIR)
  .filter((f) => f.endsWith(".bin"))
  .sort();
if (files.length === 0) {
  console.error(`✗ No logo files in ${LOGO_DIR}.`);
  process.exit(1);
}

const assetIds = [];
for (const file of files) {
  const n = file.replace(/\.bin$/, "");
  const id = `figma-logo-${n.split("-")[0]}`; // figma-logo-01 …
  const svg = fixSvg(readFileSync(join(LOGO_DIR, file), "utf-8"));
  await uploadSvg(id, `Partner logo ${n.split("-")[0]}`, svg);
  assetIds.push(id);
  console.log(`  ✓ ${id}`);
}

// repoint the info entry's logos at the Figma assets
const entry = await api("/entries/info-our-vision");
const updated = await api("/entries/info-our-vision", {
  method: "PUT",
  headers: {
    "X-Contentful-Content-Type": "info",
    "X-Contentful-Version": String(entry.sys.version),
  },
  body: JSON.stringify({
    fields: {
      ...entry.fields,
      logos: L(assetIds.map((id) => ({ sys: { type: "Link", linkType: "Asset", id } }))),
    },
  }),
});
await api("/entries/info-our-vision/published", {
  method: "PUT",
  headers: { "X-Contentful-Version": String(updated.sys.version) },
});
console.log(`\nDone. Info ticker now uses ${assetIds.length} Figma logos.`);
