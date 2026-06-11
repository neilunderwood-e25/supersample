#!/usr/bin/env node
/*
 * Seed script for the "Info / Default" section (the "Our Vision" stats block).
 *
 *   - Creates + publishes `statItem` and `info` content types
 *   - Allows `info` as a section on `flexiblePage`
 *   - Generates + uploads simple wordmark logo SVGs (the ticker)
 *   - Creates 3 statItem entries + one info entry, attaches it to the home page
 *
 * Re-runnable. Env (from .env.local): CONTENTFUL_SPACE_ID,
 * CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT (optional).
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
const LOCALE =
  locales.items.find((l) => l.default)?.code || locales.items[0]?.code || "en-US";
const L = (v) => ({ [LOCALE]: v });

// ── content types ──────────────────────────────────────────────────────────
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

await upsertContentType("statItem", {
  name: "Stat Item",
  description: "A single count-up statistic (prefix + value + suffix + label).",
  displayField: "label",
  fields: [
    { id: "label", name: "Label", type: "Symbol", required: true },
    { id: "prefix", name: "Prefix", type: "Symbol" },
    { id: "value", name: "Value", type: "Integer" },
    { id: "suffix", name: "Suffix", type: "Symbol" },
  ],
});

await upsertContentType("info", {
  name: "Info",
  description: "Eyebrow + heading + statement, count-up stats, and a logo ticker.",
  displayField: "internalTitle",
  fields: [
    { id: "internalTitle", name: "Internal Title", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Front End Component",
      type: "Symbol",
      validations: [{ in: ["Info / Default"] }],
    },
    { id: "eyebrow", name: "Eyebrow", type: "Symbol" },
    { id: "heading", name: "Heading", type: "Symbol" },
    { id: "subheading", name: "Subheading", type: "Symbol" },
    {
      id: "stats",
      name: "Stats",
      type: "Array",
      items: { type: "Link", linkType: "Entry", validations: [{ linkContentType: ["statItem"] }] },
    },
    {
      id: "logos",
      name: "Logos",
      type: "Array",
      items: { type: "Link", linkType: "Asset" },
    },
  ],
});

// allow `info` as a flexiblePage section (preserve existing allowed types)
{
  const fp = await api("/content_types/flexiblePage");
  const sections = fp.fields.find((f) => f.id === "sections");
  const current = sections.items.validations?.[0]?.linkContentType ?? [];
  if (!current.includes("info")) {
    sections.items.validations = [{ linkContentType: [...new Set([...current, "info"])] }];
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
    console.log('  ✓ flexiblePage now allows "info" sections');
  } else {
    console.log('• flexiblePage already allows "info" sections');
  }
}

// ── logo ticker assets (generated wordmark SVGs) ─────────────────────────────
const LOGOS = ["Stroupe", "Alexun", "GrowthView", "Kinetic", "Journey", "Grasshopper"];

const logoSvg = (name) => {
  const w = Math.round(34 + name.length * 12);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="28" viewBox="0 0 ${w} 28"><circle cx="11" cy="14" r="6" fill="#0c120c"/><text x="26" y="20" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="-0.6" fill="#0c120c">${name}</text></svg>`;
};

const uploadSvgAsset = async (id, name) => {
  const bytes = Buffer.from(logoSvg(name), "utf-8");
  const up = await fetch(`${UPLOAD_BASE}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CMA}`, "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  if (!up.ok) throw new Error(`upload ${id} → ${up.status}\n${await up.text()}`);
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
        title: L(`${name} logo`),
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
  if (!processed?.fields?.file?.[LOCALE]?.url) throw new Error(`asset ${id} never processed`);
  await api(`/assets/${id}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(processed.sys.version) },
  });
  return id;
};

const logoAssetIds = [];
for (const name of LOGOS) {
  const id = `logo-${name.toLowerCase()}`;
  await uploadSvgAsset(id, name);
  logoAssetIds.push(id);
  console.log(`  ✓ logo asset "${id}"`);
}

// ── entries ──────────────────────────────────────────────────────────────────
const upsertEntry = async (contentType, id, fields) => {
  let version;
  try {
    version = (await api(`/entries/${id}`)).sys.version;
  } catch (e) {
    if (e.status !== 404) throw e;
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

const STATS = [
  { id: "stat-projects", label: "Projects delivered", value: 47, suffix: "+" },
  { id: "stat-retention", label: "Client retention", value: 95, suffix: "%" },
  { id: "stat-revenue", label: "Client revenue impacted", prefix: "$", value: 21, suffix: "M" },
];

for (const s of STATS) {
  await upsertEntry("statItem", s.id, {
    label: L(s.label),
    value: L(s.value),
    ...(s.prefix ? { prefix: L(s.prefix) } : {}),
    ...(s.suffix ? { suffix: L(s.suffix) } : {}),
  });
}

const link = (id, linkType) => ({ sys: { type: "Link", linkType, id } });

await upsertEntry("info", "info-our-vision", {
  internalTitle: L("Our Vision — stats + logos"),
  frontEndComponent: L("Info / Default"),
  eyebrow: L("Our Vision"),
  heading: L(
    "Whether it's a website, an app, or a complete brand identity - we create work that works."
  ),
  subheading: L(
    "Good design isn't just about looks. It's about solving real problems and getting results. Here's ours."
  ),
  stats: L(STATS.map((s) => link(s.id, "Entry"))),
  logos: L(logoAssetIds.map((id) => link(id, "Asset"))),
});

// ── attach to the home page (append after the hero) ──────────────────────────
{
  const home = await api("/entries/home");
  const list = home.fields.sections?.[LOCALE] ?? [];
  if (!list.some((l) => l?.sys?.id === "info-our-vision")) {
    const next = [...list, link("info-our-vision", "Entry")];
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
    console.log('  ✓ attached info to "home" page + republished');
  } else {
    console.log('• info already attached to "home" page');
  }
}

console.log("\nDone. Info / Default section seeded and attached to the home page.");
