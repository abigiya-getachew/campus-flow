import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Float, Reveal } from "./Reveal";

export function CTA() {
  return (
    <section aria-label="Get started" className="py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-600 via-brand-terracotta to-brand-sage px-6 py-16 text-center shadow-[0_24px_64px_rgba(49,87,232,0.35)] sm:px-12 md:py-20">
            {/* Inner glow + decorative floating shapes */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.22),transparent_70%)]" />
              <div className="landing-dot-grid absolute inset-0 opacity-[0.14]" />
              <Float className="absolute -left-10 top-10 size-40 rounded-full bg-white/10 blur-2xl" amplitude={10} duration={7} />
              <Float className="absolute -right-14 bottom-0 size-52 rounded-full bg-brand-sage/20 blur-3xl" amplitude={12} duration={8.5} delay={1} />
              <Float className="absolute right-[14%] top-[18%] size-3 rounded-full bg-white/50" amplitude={6} duration={5} delay={0.5} />
              <Float className="absolute left-[18%] bottom-[22%] size-2 rounded-full bg-brand-terracotta/70" amplitude={5} duration={6} delay={1.4} />
              <Float className="absolute right-[30%] bottom-[14%] size-1.5 rounded-full bg-white/60" amplitude={4} duration={5.5} delay={2} />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-[-0.025em] text-white sm:text-4xl md:text-[2.9rem] md:leading-[1.08]">
                Take control of your semester
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
                Join thousands of students who start every morning knowing exactly what to do next.
                Set up in minutes. It is free.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-brand-700 shadow-[0_8px_24px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.3)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Start Free
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/app"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
                >
                  Explore Dashboard
                </Link>
              </div>

              <p className="mt-6 text-[12.5px] font-medium text-white/70">
                Free for students. No credit card required.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
