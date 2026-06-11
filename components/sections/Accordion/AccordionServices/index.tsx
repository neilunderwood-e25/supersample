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
            <h2 className="max-w-[810px] font-medium leading-[1.2] tracking-[-0.043em] text-[var(--text-default)] text-[48px] max-md:text-[30px]">
              {heading}
            </h2>
          )}

          <div className="flex w-full flex-col">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="group relative border-b border-[rgba(151,151,151,0.2)] transition-colors duration-300 md:hover:border-transparent"
              >
                {/* Blue fill — fades in on hover (desktop only; never on touch). */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[14px] bg-[var(--brand-primary)] opacity-0 transition-opacity duration-300 md:group-hover:opacity-100 max-md:hidden"
                />

                <div className="relative flex items-center py-6 transition-[padding] duration-300 md:group-hover:px-8 max-md:flex-wrap max-md:gap-y-1.5 max-md:py-5">
                  <span className="w-[80px] shrink-0 self-center font-medium leading-none tracking-[-0.05em] text-[var(--text-default)] transition-colors duration-300 text-[36px] md:group-hover:text-white max-md:w-auto max-md:text-[30px] max-md:text-[var(--brand-primary)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3 className="ml-[clamp(32px,5vw,96px)] shrink-0 self-center whitespace-nowrap font-medium leading-[1.06] tracking-[-0.042em] text-[var(--text-default)] transition-colors duration-300 text-[72px] md:group-hover:text-white max-md:ml-4 max-md:whitespace-normal max-md:text-[30px]">
                    {service.title}
                  </h3>

                  {service.description && (
                    <p className="pointer-events-none ml-auto min-w-0 max-w-[600px] shrink self-center pl-10 font-medium leading-[1.4] tracking-[-0.02em] text-white opacity-0 transition-opacity duration-300 text-[20px] md:group-hover:opacity-100 max-md:ml-0 max-md:pl-0 max-md:order-last max-md:mt-1.5 max-md:w-full max-md:max-w-none max-md:text-[15px] max-md:text-[var(--text-muted)] max-md:opacity-100">
                      {service.description}
                    </p>
                  )}

                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1/2 shrink-0 -translate-y-1/2 text-[var(--text-default)] transition-opacity duration-300 md:group-hover:opacity-0 max-md:hidden"
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
