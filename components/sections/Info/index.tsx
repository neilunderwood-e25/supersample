import type { InfoSection } from "@/lib/sections/types";
import { InfoDefault } from "./InfoDefault";

type InfoProps = { section: InfoSection };

/**
 * Variant router for the Info section. Routes on the `frontEndComponent`
 * dropdown value set on the Contentful entry. See components/ARCHITECTURE.md.
 */
export function Info({ section }: InfoProps) {
  switch (section.frontEndComponent) {
    case "Info / Default":
      return <InfoDefault section={section} />;
    default:
      return <InfoDefault section={section} />;
  }
}
