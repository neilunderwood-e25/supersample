import { contentfulFetch } from "@/lib/contentful/client";
import { HERO_BY_ID } from "@/lib/contentful/graphql/queries/hero";
import type { HydrateOptions, SectionDefinition } from "@/lib/sections/config";
import type { HeroSection, ImageAsset } from "@/lib/sections/types";
import { Hero } from "@/components/sections/Hero";

type HeroNode = {
  sys: { id: string };
  frontEndComponent: string | null;
  headingLineOne: string | null;
  headingLineTwo: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: {
    url: string | null;
    width: number | null;
    height: number | null;
    title: string | null;
  } | null;
};

const mapImage = (img: HeroNode["image"]): ImageAsset | null => {
  if (!img?.url) return null;
  const url = img.url.startsWith("//") ? `https:${img.url}` : img.url;
  return { url, width: img.width ?? null, height: img.height ?? null };
};

async function hydrateHero(
  id: string,
  options: HydrateOptions
): Promise<HeroSection | null> {
  const data = await contentfulFetch<{ hero: HeroNode | null }>(
    HERO_BY_ID,
    { id, preview: options.preview ?? false, locale: options.locale },
    { preview: options.preview }
  );
  const node = data.hero;
  if (!node) return null;

  return {
    id: node.sys.id,
    type: "hero",
    frontEndComponent: node.frontEndComponent ?? null,
    headingLineOne: node.headingLineOne ?? null,
    headingLineTwo: node.headingLineTwo ?? null,
    subheading: node.subheading ?? null,
    ctaLabel: node.ctaLabel ?? null,
    ctaHref: node.ctaHref ?? null,
    image: mapImage(node.image),
  };
}

export const heroDefinition: SectionDefinition = {
  contentfulTypename: "Hero",
  type: "hero",
  hydrate: hydrateHero,
  render: (section) =>
    section.type === "hero" ? <Hero section={section} /> : null,
};
