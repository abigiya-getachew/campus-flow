import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/* ------------------------------------------------------------------ */
/* Mini JSX illustrations                                              */
/* ------------------------------------------------------------------ */

function CoursesIllustration() {
  const chips = [
    { code: "CS 301", name: "Operating Systems", className: "bg-brand-50 text-brand-700 border-brand-200/60" },
    { code: "MATH 210", name: "Calculus II", className: "bg-violet-50 text-violet-700 border-violet-200/60" },
    { code: "ENG 105", name: "Academic Writing", className: "bg-cyan-50 text-cyan-700 border-cyan-200/60" },
  ];
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      {chips.map((c) => (
        <span
          key={c.code}
          className={cn("inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5", c.className)}
        >
          <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide">
            {c.code}
          </span>
          <span className="text-[10.5px] font-semibold">{c.name}</span>
        </span>
      ))}
    </div>
  );
}

function ChecklistIllustration() {
  const rows = [
    { label: "Problem Set 4 · CS 301", done: true, chip: "Due today", chipClass: "bg-rose-50 text-rose-600" },
    { label: "Ch. 7 exercises · MATH 210", done: true, chip: "Thu", chipClass: "bg-slate-100 text-slate-soft" },
    { label: "Essay draft v2 · ENG 105", done: false, chip: "Fri", chipClass: "bg-slate-100 text-slate-soft" },
  ];
  return (
    <ul className="flex flex-col gap-2" aria-hidden="true">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white px-3 py-2"
        >
          <span
            className={cn(
              "grid size-4 shrink-0 place-items-center rounded-full border",
              r.done ? "border-brand-600 bg-brand-600" : "border-slate-300 bg-white"
            )}
          >
            {r.done && <Check className="size-2.5 text-white" strokeWidth={3.5} />}
          </span>
          <span className={cn("min-w-0 flex-1 truncate text-[10.5px] font-medium", r.done ? "text-slate-400 line-through decoration-slate-300" : "text-ink")}>
            {r.label}
          </span>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-bold", r.chipClass)}>{r.chip}</span>
        </li>
      ))}
    </ul>
  );
}

function RecommendationIllustration() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="rounded-xl border border-brand-200/60 bg-gradient-to-r from-brand-50 to-brand-terracotta/20 px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-600">
          <Sparkles className="size-3" /> Suggested now
        </p>
        <p className="mt-1 text-[11px] font-semibold text-ink">
          Study Calculus II · Ch. 7 <span className="font-normal text-slate-soft">— Thu 4:00 PM, 90 min</span>
        </p>
      </div>
      <div className="flex gap-2">
        <span className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-[9.5px] font-medium text-slate-soft">
          Matches a free slot
        </span>
        <span className="rounded-lg border border-slate-200/70 bg-white px-2.5 py-1.5 text-[9.5px] font-medium text-slate-soft">
          Before exam
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Add your courses",
    body: "Import your timetable in minutes. Lectures, labs, and sections with every detail in one place",
    Illustration: CoursesIllustration,
  },
  {
    n: "02",
    title: "Track assignments",
    body: "Every task gets a deadline, a course, and a priority automatically sorted into one clear queue",
    Illustration: ChecklistIllustration,
  },
  {
    n: "03",
    title: "Follow smart study recommendations",
    body: "CampusFlow suggests what to study and when adapting as your workload and exams approach",
    Illustration: RecommendationIllustration,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="anchor-section py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="How it works"
          title="From chaos to clarity in three steps"
          subtitle="Set up once on Sunday evening and let CampusFlow steer the rest of the week"
        />

        <div className="relative mt-14 md:mt-20">
          {/* Connecting gradient line — vertical on mobile, horizontal on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-500 via-brand-terracotta to-brand-sage opacity-30 md:left-0 md:right-0 md:top-[23px] md:bottom-auto md:h-px md:w-auto md:bg-gradient-to-r"
          />

          <ol className="flex flex-col gap-12 md:flex-row md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.n} className="relative md:flex-1">
                <Reveal delay={0.1 + i * 0.12}>
                  <div className="flex flex-col">
                    <div className="flex items-start gap-5 md:block">
                      {/* Numbered gradient badge */}
                      <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-[13px] font-extrabold tracking-wide text-white shadow-[0_6px_18px_rgba(49,87,232,0.4)] ring-8 ring-canvas md:mb-6">
                        {step.n}
                      </span>

                      {/* Illustrated mini-card (mobile: beside badge) */}
                      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <step.Illustration />
                      </div>
                    </div>

                    <h3 className="mt-5 text-[19px] font-bold tracking-[-0.02em] text-ink md:mt-6">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-slate-soft">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
