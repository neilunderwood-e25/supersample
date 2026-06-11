import { contentfulFetch } from "@/lib/contentful/client";
import { ACCORDION_BY_ID } from "@/lib/contentful/graphql/queries/accordion";
import type { HydrateOptions, SectionDefinition } from "@/lib/sections/config";
import type { AccordionSection, ServiceItem } from "@/lib/sections/types";
import { Accordion } from "@/components/sections/Accordion";

type AccordionNode = {
  sys: { id: string };
  frontEndComponent: string | null;
  heading: string | null;
  servicesCollection: {
    items: Array<{
      sys: { id: string };
      title: string | null;
      description: string | null;
    } | null> | null;
  } | null;
};

async function hydrateAccordion(
  id: string,
  options: HydrateOptions
): Promise<AccordionSection | null> {
  const data = await contentfulFetch<{ accordion: AccordionNode | null }>(
    ACCORDION_BY_ID,
    { id, preview: options.preview ?? false, locale: options.locale },
    { preview: options.preview }
  );
  const node = data.accordion;
  if (!node) return null;

  const services: ServiceItem[] = (node.servicesCollection?.items ?? [])
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => ({
      id: s.sys.id,
      title: s.title ?? null,
      description: s.description ?? null,
    }));

  return {
    id: node.sys.id,
    type: "accordion",
    frontEndComponent: node.frontEndComponent ?? null,
    heading: node.heading ?? null,
    services,
  };
}

export const accordionDefinition: SectionDefinition = {
  contentfulTypename: "Accordion",
  type: "accordion",
  hydrate: hydrateAccordion,
  render: (section) =>
    section.type === "accordion" ? <Accordion section={section} /> : null,
};
