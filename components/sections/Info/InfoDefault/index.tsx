import type { InfoSection } from "@/lib/sections/types";
import { Counter } from "./Counter";

type InfoDefaultProps = { section: InfoSection };

const DIVIDER = "bg-[color-mix(in_srgb,var(--text-default)_20%,transparent)]";

/**
 * "Info / Default" — an "Our Vision" style block: an eyebrow pill on the left,
 * a large heading + statement and three count-up stat counters on the right, a
 * divider, and a scrolling partner-logo ticker. Mirrors the Figma design.
 */
export function InfoDefault({ section }: InfoDefaultProps) {
  const { eyebrow, heading, subheading, stats, logos } = section;

  return (
    <section className="relative w-full bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center gap-[clamp(48px,5.2vw,100px)] px-[60px] py-[clamp(56px,5.2vw,100px)] max-md:px-5">
        {/* Eyebrow (left) + content (right) */}
        <div className="flex w-full max-w-[1800px] items-start justify-between gap-10 max-md:flex-col max-md:gap-8">
          {eyebrow && (
            <div className="inline-flex shrink-0 items-center gap-2 rounded-[20px] border border-[color-mix(in_srgb,var(--text-default)_8%,transparent)] bg-[color-mix(in_srgb,var(--text-default)_2%,transparent)] py-2 pl-4 pr-[18px]">
              <span className="flex items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] p-1">
                <span className="size-2 rounded-[4px] bg-[var(--brand-primary)]" />
              </span>
              <span className="text-[14px] font-medium uppercase leading-none tracking-[0.02em] text-[var(--text-default)]">
                {eyebrow}
              </span>
            </div>
          )}

          <div className="flex w-full max-w-[900px] flex-col gap-[clamp(48px,5.2vw,100px)] max-md:max-w-none">
            <div className="flex flex-col gap-[clamp(20px,1.6vw,30px)]">
              {heading && (
                <h2 className="font-medium leading-[1.07] tracking-[-0.04em] text-[var(--text-default)] text-[clamp(34px,3.5vw,67px)]">
                  {heading}
                </h2>
              )}
              {subheading && (
                <p className="max-w-[500px] font-medium leading-[1.4] tracking-[-0.02em] text-[var(--text-muted)] text-[clamp(17px,1.05vw,20px)]">
                  {subheading}
                </p>
              )}
            </div>

            {stats.length > 0 && (
              <div className="flex w-full items-start justify-between gap-8 max-md:flex-col max-md:gap-10">
                {stats.map((stat) => (
                  <Counter key={stat.id} stat={stat} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px w-full max-w-[1800px] ${DIVIDER}`} />

        {/* Partner-logo ticker — duplicated list translated by one set for a
            seamless loop; edges fade via a mask. Pauses for reduced motion. */}
        {logos.length > 0 && (
          <div className="w-full max-w-[1800px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
            <ul className="flex w-max items-center motion-reduce:animate-none animate-[marquee_32s_linear_infinite]">
              {[...logos, ...logos].map((logo, i) =>
                logo.url ? (
                  <li key={i} className="mr-[60px] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.url}
                      alt=""
                      aria-hidden="true"
                      className="h-7 w-auto opacity-40"
                    />
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
