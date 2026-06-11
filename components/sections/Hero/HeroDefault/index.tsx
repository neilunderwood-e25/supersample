import type { HeroSection } from "@/lib/sections/types";
import { Reveal } from "@/components/common/Reveal";
import { ParallaxImage } from "./ParallaxImage";

type HeroDefaultProps = { section: HeroSection };

const HEADING =
  "font-semibold uppercase leading-[1.05] tracking-[-0.06em] text-[var(--text-default)] whitespace-nowrap text-[clamp(38px,11.6vw,222px)] max-md:text-[12.5vw] max-md:leading-[0.9]";

/**
 * "Hero / Default" — oversized split display heading.
 *
 * Desktop (>=720px): line one right-aligned across the full width; line two at
 * the left with a parallax image block beside it.
 * Mobile (<720px): everything stacks — line one left, line two right, then the
 * parallax image as a full-width banner, then the divider, statement and link.
 *
 * On load each piece slides up + fades in (Reveal), staggered, using the live
 * site's cubic-bezier(0.34,0,0,1) curve.
 */
export function HeroDefault({ section }: HeroDefaultProps) {
  const { headingLineOne, headingLineTwo, subheading, image, ctaLabel, ctaHref } =
    section;

  return (
    <section className="relative w-full bg-[var(--background)] max-md:min-h-[100dvh]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center gap-[clamp(32px,3.1vw,60px)] px-[60px] pb-[100px] pt-[clamp(112px,15.6vw,300px)] max-md:min-h-[100dvh] max-md:justify-end max-md:gap-5 max-md:px-5 max-md:pb-12 max-md:pt-[104px]">
        {/* Heading */}
        <div className="flex w-full max-w-[1800px] flex-col items-end gap-[20px] max-md:items-stretch max-md:gap-0">
          {headingLineOne && (
            <Reveal
              as="h1"
              delay={0}
              y={64}
              className={`w-full text-right max-md:text-left ${HEADING}`}
            >
              {headingLineOne}
            </Reveal>
          )}

          <div className="flex w-full items-stretch gap-[20px] max-md:flex-col max-md:gap-5">
            {headingLineTwo && (
              <div className="flex flex-1 items-center max-md:block max-md:flex-none">
                <Reveal
                  as="span"
                  delay={0.26}
                  y={64}
                  className={`inline-block text-left max-md:block max-md:w-full max-md:text-right ${HEADING}`}
                >
                  {headingLineTwo}
                </Reveal>
              </div>
            )}
            {image?.url && (
              <Reveal
                delay={0.52}
                y={56}
                className="relative flex-1 max-md:h-[32dvh] max-md:w-full max-md:flex-none"
              >
                <ParallaxImage src={image.url} />
              </Reveal>
            )}
          </div>
        </div>

        {/* Divider */}
        <Reveal
          delay={0.7}
          y={20}
          className="h-px w-full max-w-[1800px] bg-[color-mix(in_srgb,var(--text-default)_20%,transparent)]"
        />

        {/* Statement + browse link */}
        <div className="w-full max-w-[1800px]">
          {subheading && (
            <Reveal
              as="p"
              delay={0.8}
              y={36}
              className="max-w-[1000px] font-medium leading-[1.2] tracking-[-0.044em] text-[var(--text-default)] text-[clamp(22px,2.3vw,44px)] max-md:text-[clamp(18px,5vw,22px)]"
            >
              {subheading}
            </Reveal>
          )}

          {ctaLabel && (
            <Reveal delay={0.9} y={36}>
              <a
                href={ctaHref ?? "#"}
                className="group mt-[clamp(28px,3vw,58px)] inline-flex items-center gap-2 font-medium leading-none tracking-[-0.02em] text-[var(--text-default)] text-[32px] max-md:mt-6 max-md:text-[20px]"
              >
                {/* Underline spans text + arrow by default, then retracts to the
                    text width on hover. */}
                <span className="relative inline-block pb-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-[calc(100%_+_8px_+_1em)] after:bg-current after:content-[''] after:transition-[width] after:duration-300 after:ease-[cubic-bezier(0.34,0,0,1)] group-hover:after:w-full">
                  {ctaLabel}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-[1em] w-[1em] transition-[rotate,color] duration-300 ease-[cubic-bezier(0.34,0,0,1)] group-hover:rotate-45 group-hover:text-[var(--brand-primary)]"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
