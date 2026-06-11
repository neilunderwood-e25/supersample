import type { AccordionSection } from "@/lib/sections/types";
import { AccordionServices } from "./AccordionServices";

type AccordionProps = { section: AccordionSection };

/**
 * Variant router for the Accordion section. Routes on the `frontEndComponent`
 * dropdown value set on the Contentful entry. See components/ARCHITECTURE.md.
 */
export function Accordion({ section }: AccordionProps) {
  switch (section.frontEndComponent) {
    case "Accordion / Services":
      return <AccordionServices section={section} />;
    default:
      return <AccordionServices section={section} />;
  }
}
