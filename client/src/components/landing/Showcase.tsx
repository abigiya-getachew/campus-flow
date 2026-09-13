import { type MouseEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { BookOpen, CalendarClock, Flame, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Float, Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/* ------------------------------------------------------------------ */
/* Floating label chips                                                */
/* ------------------------------------------------------------------ */

const CHIPS = [
  {
    label: "High Priority",
    dot: "bg-rose-500",
    className: "left-[-16px] top-[14%] sm:left-[-36px]",
    delay: 0,
  },
  {
    label: "Study Block",
    dot: "bg-violet-500",
    className: "right-[-14px] top-[26%] sm:right-[-40px]",
    delay: 1.2,
  },
  {
    label: "Grade Prediction",
    dot: "bg-cyan-500",
    className: "left-[-14px] bottom-[22%] sm:left-[-44px]",
    delay: 0.6,
  },
  {
    label: "Due Tomorrow",
    dot: "bg-amber-400",
    className: "right-[-16px] bottom-[12%] sm:right-[-36px]",
    delay: 1.8,
  },
] as const;

function FloatingChips() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      {CHIPS.map((chip) => (
        <Float
          key={chip.label}
          className={cn("absolute", chip.className)}
          amplitude={7}
          duration={5.5 + chip.delay * 0.4}
          delay={chip.delay * 0.5}
        >
          <span className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/85 py-2 pl-3 pr-4 text-[12.5px] font-semibold text-ink shadow-[0_8px_24px_rgba(15,23,42,0.10)] backdrop-blur-md">
            <span className="relative flex size-2">
              <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-40", chip.dot)} />
              <span className={cn("relative inline-flex size-2 rounded-full", chip.dot)} />
            </span>
            {chip.label}
          </span>
        </Float>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini dashboard (styled JSX)                                         */
/* ------------------------------------------------------------------ */

const ASSIGNMENTS = [
  { course: "CS 301", title: "Problem Set 4", due: "Tomorrow · 11:59 PM", status: "In progress", statusClass: "bg-amber-50 text-amber-600", bar: "w-[68%]", barClass: "from-brand-600 to-violet-500" },
  { course: "MATH 210", title: "Chapter 7 exercises", due: "Thu · 5:00 PM", status: "Queued", statusClass: "bg-slate-100 text-slate-soft", bar: "w-[20%]", barClass: "from-cyan-500 to-brand-500" },
  { course: "ENG 105", title: "Essay draft v2", due: "Fri · 9:00 AM", status: "On track", statusClass: "bg-emerald-50 text-emerald-600", bar: "w-[45%]", barClass: "from-brand-500 to-cyan-400" },
] as const;

const CHART_BARS = [42, 66, 51, 80, 62, 92, 74] as const;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function MiniDashboard() {
  return (
    <div className="flex h-full min-h-0 text-ink">
      {/* Sidebar hints */}
      <aside className="hidden w-[52px] shrink-0 flex-col items-center gap-3 border-r border-slate-200/70 bg-slate-50/60 py-4 sm:flex" aria-hidden="true">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 text-white">
          <GraduationCap className="size-4" />
        </span>
        <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Flame className="size-4" />
        </span>
        <span className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
          <CalendarClock className="size-4" />
        </span>
        <span className="grid size-8 place-items-center rounded-lg text-slate-400">
          <BookOpen className="size-4" />
        </span>
        <span className="mt-auto size-7 rounded-full bg-gradient-to-br from-cyan-400 to-brand-500" />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold tracking-[-0.01em]">Good morning, Hana</p>
            <p className="text-[10.5px] text-slate-soft">Tuesday, March 4 · 3 tasks due today</p>
          </div>
          <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700 sm:inline">
            Week 9
          </span>
        </div>

        {/* Next up card */}
        <div className="rounded-xl border border-brand-200/60 bg-gradient-to-r from-brand-50/90 to-brand-terracotta/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">Next up</p>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-600">
              High priority
            </span>
          </div>
          <p className="mt-1.5 text-[12.5px] font-semibold">Finish CS 301 Problem Set 4</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/80">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-brand-600 to-brand-terracotta" />
            </div>
            <span className="text-[9.5px] font-semibold text-slate-soft">68% · 2h left</span>
          </div>
        </div>

        {/* Assignment rows + chart */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_150px]">
          <div className="flex flex-col gap-1.5">
            {ASSIGNMENTS.map((a) => (
              <div key={a.title} className="rounded-lg border border-slate-200/70 bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold">
                    <span className="mr-1.5 rounded bg-brand-600/10 px-1 py-px text-[8.5px] font-bold text-brand-700">{a.course}</span>
                    {a.title}
                  </p>
                  <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold", a.statusClass)}>
                    {a.status}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", a.bar, a.barClass)} />
                  </div>
                  <span className="text-[8.5px] text-slate-400">{a.due}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden flex-col gap-3 lg:flex">
            <div className="flex-1 rounded-lg border border-slate-200/70 bg-white p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Study load</p>
              <div className="mt-2 flex h-[58px] items-end justify-between gap-[5px]">
                {CHART_BARS.map((h, i) => (
                  <span key={i} className="flex-1 rounded-t-[3px] bg-gradient-to-t from-brand-600/70 to-violet-400/70" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[7.5px] font-medium text-slate-400">
                {DAYS.map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-white p-3">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">GPA</p>
              <p className="mt-0.5 text-[20px] font-extrabold tracking-[-0.02em]">3.72</p>
              <p className="text-[9px] font-semibold text-emerald-600">▲ +0.18 this term</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase section with subtle mouse parallax tilt (desktop only)     */
/* ------------------------------------------------------------------ */

export function Showcase() {
  const reduce = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 90, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 90, damping: 18, mass: 0.6 });

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || e.currentTarget.offsetWidth < 900) return; // desktop-ish only
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 5);   // left/right → rotateY
    rotateX.set(-py * 4);  // up/down → rotateX
  };

  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <section aria-label="Product showcase" className="relative overflow-hidden py-24 md:py-32">
      {/* Glow behind the frame */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[820px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-400/15 via-brand-terracotta/15 to-brand-sage/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <SectionHeading
          kicker="Inside CampusFlow"
          title="Your whole semester, one screen"
          subtitle="A calm command center that turns courses, deadlines, and grades into one clear next move"
        />

        <Reveal delay={0.15} className="mt-14 md:mt-16">
          <div
            className="relative mx-auto max-w-[980px]"
            style={{ perspective: 1400 }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <FloatingChips />

            <motion.div
              style={reduce ? undefined : { rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
              className="relative rounded-[22px] border border-slate-200/90 bg-white landing-shadow-lift"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-slate-200/80 px-4 py-3 sm:px-5">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#F87171]/80" />
                  <span className="size-2.5 rounded-full bg-[#FBBF24]/80" />
                  <span className="size-2.5 rounded-full bg-[#34D399]/80" />
                </span>
                <span className="mx-auto flex max-w-[280px] flex-1 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 px-3.5 py-1 text-[11px] font-medium text-slate-400">
                  app.campusflow.app
                </span>
                <span className="w-[52px]" aria-hidden="true" />
              </div>

              {/* Dashboard body */}
              <div className="h-[400px] rounded-b-[21px] bg-[#FBFCFE] sm:h-[440px]">
                <MiniDashboard />
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
