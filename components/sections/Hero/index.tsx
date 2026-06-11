import type { HeroSection } from "@/lib/sections/types";
import { HeroDefault } from "./HeroDefault";

type HeroProps = { section: HeroSection };

/**
 * Variant router for the Hero section. Routes on the `frontEndComponent`
 * dropdown value set on the Contentful entry. See components/ARCHITECTURE.md.
 */
export function Hero({ section }: HeroProps) {
  switch (section.frontEndComponent) {
    case "Hero / Default":
      return <HeroDefault section={section} />;
    default:
      return <HeroDefault section={section} />;
  }
}
