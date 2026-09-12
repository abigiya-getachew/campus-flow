import { CalendarDays, Crosshair, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

interface Feature {
  icon: LucideIcon;
  title: string;
  tagline: string;
  body: string;
  tile: string;
}

const FEATURES: Feature[] = [
  {
    icon: Crosshair,
    title: "Smart Priorities",
    tagline: "Know what deserves attention first",
    body: "CampusFlow weighs deadlines, difficulty, and workload so the next right task is always obvious",
    tile: "from-brand-600 to-brand-700 shadow-[0_8px_20px_rgba(49,87,232,0.35)]",
  },
  {
    icon: CalendarDays,
    title: "Weekly Planning",
    tagline: "See classes and study sessions together",
    body: "Lectures, labs, and study blocks share one calm weekly view so free hours turn into real progress",
    tile: "from-brand-terracotta to-brand-purple shadow-[0_8px_20px_rgba(219,139,98,0.35)]",
  },
  {
    icon: TrendingUp,
    title: "Grade Tracking",
    tagline: "Stay on top of your academic progress",
    body: "Log grades as they arrive and watch your GPA, per course trends, and forecasts update instantly",
    tile: "from-brand-sage to-brand-600 shadow-[0_8px_20px_rgba(129,169,147,0.35)]",
  },
];

export function Features() {
  return (
    <section id="features" className="anchor-section py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="Features"
          title="Everything your semester needs"
          subtitle="One workspace for courses, tasks, grades, and study time designed so the next step is always clear"
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-7">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={0.1 + i * 0.1}>
              <article
                className={cn(
                  "group h-full rounded-3xl border border-slate-200/80 bg-white p-7 transition-all duration-300",
                  "landing-shadow-soft hover:-translate-y-1.5 hover:border-brand-200 hover:landing-shadow-lift",
                  "focus-within:-translate-y-1.5 focus-within:border-brand-200"
                )}
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-105",
                    f.tile
                  )}
                >
                  <f.icon className="size-[22px]" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-[19px] font-bold tracking-[-0.02em] text-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] font-medium leading-snug text-brand-700">{f.tagline}</p>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-soft">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
