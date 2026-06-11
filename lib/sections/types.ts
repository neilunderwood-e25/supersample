export type ImageAsset = {
  url: string | null;
  width?: number | null;
  height?: number | null;
};

export type SeoEntry = {
  sys: { id: string };
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOgImage?: ImageAsset | null;
  seoNoIndex?: boolean | null;
  seoNoFollow?: boolean | null;
  seoCanonicalUrl?: string | null;
  seoSchemaMarkup?: unknown | null;
};

/**
 * Every concrete section extends BaseSection and sets a unique `type` literal.
 * Add your section types to the `Section` union below as you build them out.
 * See `components/ARCHITECTURE.md` for the full pattern.
 */
export type BaseSection = {
  id: string;
  type: string;
};

export type UnknownSection = BaseSection & {
  type: "unknown";
  raw: unknown;
};

export type HeroSection = BaseSection & {
  type: "hero";
  frontEndComponent: string | null;
  headingLineOne: string | null;
  headingLineTwo: string | null;
  subheading: string | null;
  image: ImageAsset | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type StatItem = {
  id: string;
  prefix: string | null;
  value: number | null;
  suffix: string | null;
  label: string | null;
};

export type InfoSection = BaseSection & {
  type: "info";
  frontEndComponent: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  stats: StatItem[];
  logos: ImageAsset[];
};

export type ServiceItem = {
  id: string;
  title: string | null;
  description: string | null;
};

export type AccordionSection = BaseSection & {
  type: "accordion";
  frontEndComponent: string | null;
  heading: string | null;
  services: ServiceItem[];
};

export type Section =
  | UnknownSection
  | HeroSection
  | InfoSection
  | AccordionSection;
