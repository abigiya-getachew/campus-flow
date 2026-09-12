import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const TESTIMONIALS = [
  {
    quote:
      "I used to miss at least one deadline every month. This semester I haven't missed a single one — my whole workflow lives in CampusFlow now, and my head is so much calmer.",
    name: "Hana T.",
    initials: "HT",
    role: "Student, Addis Ababa University",
    avatar: "from-brand-600 to-violet-600",
  },
  {
    quote:
      "The priority ranking is the killer feature. I open it in the morning and it simply tells me what to do next — no more staring at five different apps trying to decide where to start.",
    name: "Samuel K.",
    initials: "SK",
    role: "Student, Adama Science & Technology University",
    avatar: "from-violet-600 to-fuchsia-500",
  },
  {
    quote:
      "Having grade tracking and study plans in one place finally made my progress feel visible. I could see exactly which courses needed more time — and my GPA went up a full point.",
    name: "Meron A.",
    initials: "MA",
    role: "Student, Hawassa University",
    avatar: "from-cyan-500 to-brand-600",
  },
] as const;

function Stars() {
  return (
    <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="anchor-section py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="Testimonials"
          title="Students feel the difference"
          subtitle="Real routines, calmer semesters — in their words."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-7">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={0.1 + i * 0.1} className="h-full">
              <figure
                className={cn(
                  "flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-7 landing-shadow-soft",
                  i === 1 && "md:-translate-y-5"
                )}
              >
                <Stars />
                <blockquote className="mt-5 flex-1 text-[15px] leading-[1.7] text-ink/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[13px] font-bold text-white shadow-sm",
                      t.avatar
                    )}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-bold tracking-[-0.01em] text-ink">{t.name}</span>
                    <span className="block truncate text-[12.5px] text-slate-soft">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
