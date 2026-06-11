#!/usr/bin/env node
/*
 * Seed script for the "Accordion / Services" section.
 *
 *   - Creates + publishes `serviceItem` and `accordion` content types
 *   - Allows `accordion` as a section on `flexiblePage`
 *   - Creates 5 serviceItem entries + one accordion entry, attaches it to home
 *
 * Re-runnable. Env from .env.local (CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN,
 * CONTENTFUL_ENVIRONMENT optional).
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

const locales = await api("/locales");
const LOCALE = locales.items.find((l) => l.default)?.code || "en-US";
const L = (v) => ({ [LOCALE]: v });

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

await upsertContentType("serviceItem", {
  name: "Service Item",
  description: "A single service row (title + hover description) for the accordion.",
  displayField: "title",
  fields: [
    { id: "title", name: "Title", type: "Symbol", required: true },
    { id: "description", name: "Description", type: "Symbol" },
  ],
});

await upsertContentType("accordion", {
  name: "Accordion",
  description: "Heading + a list of services revealed on hover.",
  displayField: "internalTitle",
  fields: [
    { id: "internalTitle", name: "Internal Title", type: "Symbol", required: true },
    {
      id: "frontEndComponent",
      name: "Front End Component",
      type: "Symbol",
      validations: [{ in: ["Accordion / Services"] }],
    },
    { id: "heading", name: "Heading", type: "Symbol" },
    {
      id: "services",
      name: "Services",
      type: "Array",
      items: { type: "Link", linkType: "Entry", validations: [{ linkContentType: ["serviceItem"] }] },
    },
  ],
});

// allow `accordion` as a flexiblePage section (preserve existing)
{
  const fp = await api("/content_types/flexiblePage");
  const sections = fp.fields.find((f) => f.id === "sections");
  const current = sections.items.validations?.[0]?.linkContentType ?? [];
  if (!current.includes("accordion")) {
    sections.items.validations = [{ linkContentType: [...new Set([...current, "accordion"])] }];
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
    console.log('  ✓ flexiblePage now allows "accordion" sections');
  } else {
    console.log('• flexiblePage already allows "accordion" sections');
  }
}

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
};

const SERVICES = [
  {
    id: "svc-website",
    title: "Website Design",
    description:
      "Every website we design is crafted to engage and inspire, built on proven principles of what makes users stay, explore, and return.",
  },
  {
    id: "svc-product",
    title: "Product Design",
    description:
      "We transform complex user needs into intuitive, elegant solutions that solve real business challenges and create meaningful interactions between people and technology.",
  },
  {
    id: "svc-branding",
    title: "Branding",
    description:
      "Our branding process goes beyond visual identity, crafting comprehensive narratives that capture your unique essence and create lasting emotional connections with your audience.",
  },
  {
    id: "svc-motion",
    title: "Motion Graphics",
    description:
      "We bring ideas to life through dynamic, engaging animations that communicate complex concepts with clarity, creativity, and visual storytelling.",
  },
  {
    id: "svc-development",
    title: "Development",
    description:
      "Our development approach combines technical excellence with strategic thinking, building robust digital solutions that are scalable, performant, and aligned with your business objectives.",
  },
];

for (const s of SERVICES) {
  await upsertEntry("serviceItem", s.id, {
    title: L(s.title),
    description: L(s.description),
  });
}

const link = (id, linkType) => ({ sys: { type: "Link", linkType, id } });

await upsertEntry("accordion", "accordion-services", {
  internalTitle: L("Services accordion"),
  frontEndComponent: L("Accordion / Services"),
  heading: L("This is how we help ambitious companies succeed."),
  services: L(SERVICES.map((s) => link(s.id, "Entry"))),
});

// attach to the home page (append after existing sections)
{
  const home = await api("/entries/home");
  const list = home.fields.sections?.[LOCALE] ?? [];
  if (!list.some((l) => l?.sys?.id === "accordion-services")) {
    const next = [...list, link("accordion-services", "Entry")];
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
    console.log('  ✓ attached accordion to "home" page + republished');
  } else {
    console.log('• accordion already attached to "home" page');
  }
}

console.log("\nDone. Accordion / Services seeded and attached to the home page.");
