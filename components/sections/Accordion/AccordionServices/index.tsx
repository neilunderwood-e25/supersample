import type { AccordionSection } from "@/lib/sections/types";

type AccordionServicesProps = { section: AccordionSection };

/**
 * "Accordion / Services" — a numbered list of services. Hovering a row fills it
 * with a blue rounded block, turns the number + title white, fades the "+" out
 * and the white description in (mirrors the live Opus site's services section).
 * The whole interaction is CSS `group-hover` — no client JS. On mobile (no
 * hover) the description sits statically below each title.
 */
export function AccordionServices({ section }: AccordionServicesProps) {
  const { heading, services } = section;

  return (
    <section className="relative w-full bg-[var(--background)]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center px-[60px] pb-[clamp(56px,5.2vw,100px)] pt-[clamp(56px,5.2vw,99px)] max-md:px-5">
        <div className="flex w-full max-w-[1800px] flex-col gap-[clamp(40px,4.2vw,80px)]">
          {heading && (
            <h2 className="max-w-[810px] font-medium leading-[1.2] tracking-[-0.043em] text-[var(--text-default)] text-[clamp(30px,2.3vw,44px)]">
              {heading}
            </h2>
          )}

          <div className="flex w-full flex-col">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="group relative border-b border-[rgba(151,151,151,0.2)] transition-colors duration-300 hover:border-transparent"
              >
                {/* Blue fill — fades in on hover, behind the content. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[14px] bg-[var(--brand-primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-center py-6 transition-[padding] duration-300 group-hover:px-8 max-md:flex-wrap max-md:gap-y-1 max-md:py-5 max-md:group-hover:px-0">
                  <span className="w-[80px] shrink-0 font-medium leading-none tracking-[-0.05em] text-[var(--text-default)] transition-colors duration-300 text-[36px] group-hover:text-white max-md:w-[38px] max-md:text-[20px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="ml-[clamp(32px,5vw,96px)] shrink-0 whitespace-nowrap font-medium leading-[1.06] tracking-[-0.042em] text-[var(--text-default)] transition-colors duration-300 text-[clamp(30px,3.55vw,68px)] group-hover:text-white max-md:ml-6 max-md:whitespace-normal">
                    {service.title}
                  </h3>

                  {service.description && (
                    <p className="pointer-events-none absolute right-[88px] top-1/2 max-w-[600px] -translate-y-1/2 font-medium leading-[1.4] tracking-[-0.02em] text-white opacity-0 transition-opacity duration-300 text-[20px] group-hover:opacity-100 max-md:static max-md:order-last max-md:mt-1 max-md:w-full max-md:max-w-none max-md:translate-y-0 max-md:text-[15px] max-md:text-[var(--text-muted)] max-md:opacity-100">
                      {service.description}
                    </p>
                  )}

                  <span
                    aria-hidden="true"
                    className="ml-auto shrink-0 text-[var(--text-default)] transition-opacity duration-300 group-hover:opacity-0 max-md:hidden"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="size-10"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
