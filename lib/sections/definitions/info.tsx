import { contentfulFetch } from "@/lib/contentful/client";
import { INFO_BY_ID } from "@/lib/contentful/graphql/queries/info";
import type { HydrateOptions, SectionDefinition } from "@/lib/sections/config";
import type { ImageAsset, InfoSection, StatItem } from "@/lib/sections/types";
import { Info } from "@/components/sections/Info";

type InfoNode = {
  sys: { id: string };
  frontEndComponent: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  statsCollection: {
    items: Array<{
      sys: { id: string };
      prefix: string | null;
      value: number | null;
      suffix: string | null;
      label: string | null;
    } | null> | null;
  } | null;
  logosCollection: {
    items: Array<{
      url: string | null;
      title: string | null;
      width: number | null;
      height: number | null;
    } | null> | null;
  } | null;
};

const toHttps = (url: string | null): string | null =>
  url && url.startsWith("//") ? `https:${url}` : url;

async function hydrateInfo(
  id: string,
  options: HydrateOptions
): Promise<InfoSection | null> {
  const data = await contentfulFetch<{ info: InfoNode | null }>(
    INFO_BY_ID,
    { id, preview: options.preview ?? false, locale: options.locale },
    { preview: options.preview }
  );
  const node = data.info;
  if (!node) return null;

  const stats: StatItem[] = (node.statsCollection?.items ?? [])
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => ({
      id: s.sys.id,
      prefix: s.prefix ?? null,
      value: s.value ?? null,
      suffix: s.suffix ?? null,
      label: s.label ?? null,
    }));

  const logos: ImageAsset[] = (node.logosCollection?.items ?? [])
    .filter((l): l is NonNullable<typeof l> => l !== null && !!l.url)
    .map((l) => ({
      url: toHttps(l.url),
      width: l.width ?? null,
      height: l.height ?? null,
    }));

  return {
    id: node.sys.id,
    type: "info",
    frontEndComponent: node.frontEndComponent ?? null,
    eyebrow: node.eyebrow ?? null,
    heading: node.heading ?? null,
    subheading: node.subheading ?? null,
    stats,
    logos,
  };
}

export const infoDefinition: SectionDefinition = {
  contentfulTypename: "Info",
  type: "info",
  hydrate: hydrateInfo,
  render: (section) =>
    section.type === "info" ? <Info section={section} /> : null,
};
