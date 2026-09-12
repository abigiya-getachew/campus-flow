import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { LANDING_EASE } from "./Reveal";

/* ------------------------------------------------------------------ */
/* Aurora + texture backdrop                                           */
/* ------------------------------------------------------------------ */

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-36 -left-32 size-[520px] rounded-full bg-brand-400/25 blur-[120px]" />
      <div className="absolute top-10 -right-28 size-[460px] rounded-full bg-violet-400/20 blur-[130px]" />
      <div className="absolute -bottom-40 left-1/3 size-[420px] rounded-full bg-cyan-300/25 blur-[120px]" />
      <div className="landing-dot-grid absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-canvas" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating glass constellation (design canvas: 560 x 590 px)          */
/* ------------------------------------------------------------------ */

const DESIGN_W = 560;
const DESIGN_H = 590;

/** Scale the fixed-size mockup canvas to the available column width. */
function useCanvasScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? DESIGN_W;
      setScale(Math.min(w / DESIGN_W, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, scale };
}

interface GlassCardProps {
  /** Absolute position + rotation (static, never animated). */
  style: CSSProperties;
  className?: string;
  zIndex: number;
  delay: number;
  floatDuration: number;
  floatAmplitude?: number;
  children: ReactNode;
}

/** Entrance (staggered fade/rise) wrapping an infinite gentle float. */
function GlassCard({ style, className, zIndex, delay, floatDuration, floatAmplitude = 8, children }: GlassCardProps) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute" style={{ ...style, zIndex }}>
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: LANDING_EASE, delay: reduce ? 0 : delay }}
      >
        <motion.div
          className={cn("landing-glass rounded-[20px]", className)}
          animate={reduce ? undefined : { y: [0, -floatAmplitude, 0] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.4 }
          }
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProgressRing() {
  const r = 37;
  const c = 2 * Math.PI * r; // ~232.5
  const pct = 0.72;
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label="Weekly goal: 72 percent complete">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="46" cy="46" r={r} fill="none" stroke="#E2E8F0" strokeWidth="7" opacity="0.7" />
      <circle
        cx="46"
        cy="46"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 46 46)"
      />
      <text x="46" y="44" textAnchor="middle" className="fill-ink text-[17px] font-bold">
        72%
      </text>
      <text x="46" y="59" textAnchor="middle" className="fill-slate-soft text-[8.5px] font-medium">
        this week
      </text>
    </svg>
  );
}

const PRIORITY_TASKS = [
  {
    title: "CS 301 · Problem Set 4",
    meta: "Due 11:59 PM",
    chip: "High",
    dot: "bg-rose-500 ring-rose-500/15",
    chipClass: "bg-rose-50 text-rose-600",
  },
  {
    title: "Calculus II — Ch. 7 review",
    meta: "Study block · 2h",
    chip: "Med",
    dot: "bg-amber-400 ring-amber-400/15",
    chipClass: "bg-amber-50 text-amber-600",
  },
  {
    title: "Group meeting — Library",
    meta: "4:00 PM · 45 min",
    chip: "Low",
    dot: "bg-cyan-500 ring-cyan-500/15",
    chipClass: "bg-cyan-50 text-cyan-600",
  },
] as const;

interface WeekDay {
  label: string;
  blocks: string[];
  today?: boolean;
}

const WEEK_DAYS: WeekDay[] = [
  { label: "M", blocks: ["h-8 bg-brand-500/80", "h-5 bg-violet-400/60"] },
  { label: "T", blocks: ["h-6 bg-cyan-400/70", "h-9 bg-brand-500/70"] },
  { label: "W", blocks: ["h-10 bg-brand-600/85", "h-4 bg-amber-300/70"], today: true },
  { label: "T", blocks: ["h-5 bg-violet-400/70", "h-7 bg-brand-400/70"] },
  { label: "F", blocks: ["h-7 bg-cyan-400/70"] },
];

const EXAMS = [
  { date: "MAR", day: "12", title: "Linear Algebra", meta: "in 8 days", chip: "bg-rose-50 text-rose-600" },
  { date: "MAR", day: "18", title: "Data Structures", meta: "in 14 days", chip: "bg-cyan-50 text-cyan-600" },
] as const;

function HeroConstellation() {
  const { ref, scale } = useCanvasScale();

  return (
    <div ref={ref} className="w-full" aria-hidden="true">
      <div
        className="mx-auto relative"
        style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Soft glow under the constellation */}
          <div className="absolute left-1/2 top-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-400/20 via-violet-400/15 to-cyan-300/20 blur-[90px]" />

          {/* Weekly goal ring */}
          <GlassCard
            style={{ left: 366, top: 0, width: 186, transform: "rotate(3deg)" }}
            className="p-4"
            zIndex={10}
            delay={0.35}
            floatDuration={7}
            floatAmplitude={7}
          >
            <div className="flex flex-col items-center gap-1">
              <ProgressRing />
              <p className="text-[11px] font-semibold text-ink">Weekly goal</p>
              <p className="text-[10px] text-slate-soft">18h of 25h studied</p>
            </div>
          </GlassCard>

          {/* Today's priorities — hero card */}
          <GlassCard
            style={{ left: 0, top: 54, width: 352, transform: "rotate(-1.5deg)" }}
            className="bg-white/75 p-4"
            zIndex={30}
            delay={0.15}
            floatDuration={6}
            floatAmplitude={9}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-bold tracking-[-0.01em] text-ink">Today&rsquo;s priorities</p>
              <span className="rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-0.5 text-[10px] font-medium text-slate-soft">
                Tue · Mar 4
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {PRIORITY_TASKS.map((t) => (
                <div
                  key={t.title}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/75 px-3 py-2"
                >
                  <span className={cn("size-2 shrink-0 rounded-full ring-4", t.dot)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11.5px] font-semibold leading-tight text-ink">
                      {t.title}
                    </span>
                    <span className="block text-[10px] leading-tight text-slate-soft">{t.meta}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      t.chipClass
                    )}
                  >
                    {t.chip}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Mini week calendar */}
          <GlassCard
            style={{ left: 294, top: 196, width: 266, transform: "rotate(2deg)" }}
            className="p-4"
            zIndex={20}
            delay={0.5}
            floatDuration={6.5}
            floatAmplitude={8}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-bold text-ink">This week</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9.5px] font-semibold text-brand-700">
                Week 9
              </span>
            </div>
            <div className="flex justify-between gap-1.5">
              {WEEK_DAYS.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-lg py-1.5",
                    d.today && "bg-brand-50/90"
                  )}
                >
                  <span className={cn("text-[9.5px] font-semibold", d.today ? "text-brand-700" : "text-slate-400")}>
                    {d.label}
                  </span>
                  <span className="flex h-[68px] w-full flex-col items-center justify-start gap-1 px-1">
                    {d.blocks.map((b, j) => (
                      <span key={j} className={cn("w-full rounded-md", b)} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Assignment card */}
          <GlassCard
            style={{ left: 4, top: 336, width: 306, transform: "rotate(1deg)" }}
            className="p-4"
            zIndex={40}
            delay={0.65}
            floatDuration={5.5}
            floatAmplitude={7}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded-md bg-brand-600/10 px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-brand-700">
                  CS 301
                </span>
                <p className="truncate text-[11.5px] font-semibold text-ink">Operating Systems — PS4</p>
              </div>
              <span className="shrink-0 rounded-full border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[9.5px] font-semibold text-amber-600">
                Due tomorrow
              </span>
            </div>
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-soft">Progress</span>
              <span className="font-semibold text-ink">68%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-brand-600 via-brand-terracotta to-brand-sage" />
            </div>
          </GlassCard>

          {/* Upcoming exams */}
          <GlassCard
            style={{ left: 322, top: 416, width: 234, transform: "rotate(-2deg)" }}
            className="p-4"
            zIndex={30}
            delay={0.8}
            floatDuration={7.5}
            floatAmplitude={6}
          >
            <p className="mb-3 text-[12px] font-bold text-ink">Upcoming exams</p>
            <div className="flex flex-col gap-2">
              {EXAMS.map((e) => (
                <div
                  key={e.title}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/75 px-2.5 py-2"
                >
                  <span className="grid w-9 shrink-0 place-items-center rounded-lg bg-slate-50 py-1">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{e.date}</span>
                    <span className="text-[13px] font-extrabold leading-none text-ink">{e.day}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold leading-tight text-ink">{e.title}</span>
                    <span className="block text-[9.5px] text-slate-soft">{e.meta}</span>
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 } as const,
          animate: { opacity: 1, y: 0 } as const,
          transition: { duration: 0.7, ease: LANDING_EASE, delay } as const,
        };

  return (
    <section className="relative overflow-hidden pt-[132px] pb-20 md:pt-[156px] md:pb-28">
      <HeroBackdrop />

      <div className="relative mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.div {...enter(0.05)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-brand-50/80 px-3.5 py-1.5 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-brand-600" aria-hidden="true" />
              <span className="text-[12.5px] font-semibold text-brand-700">Now available for everyone</span>
            </span>
          </motion.div>

          <motion.h1
            {...enter(0.15)}
            className="mt-6 font-extrabold tracking-[-0.03em] text-ink"
            style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)", lineHeight: 1.04 }}
          >
            Know exactly what to do next
          </motion.h1>

          <motion.p {...enter(0.25)} className="mt-6 text-[17px] leading-[1.65] text-slate-soft">
            Stop juggling deadlines across different apps. CampusFlow helps you organize
            courses, assignments, grades, and study plans all in one beautiful workspace.
          </motion.p>

          <motion.div {...enter(0.35)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/app"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_28px_rgba(49,87,232,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(49,87,232,0.5)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            >
              Get Started
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300/80 bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-ink backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            >
              <span className="grid size-6 place-items-center rounded-full bg-brand-50">
                <Play className="size-3 translate-x-px fill-brand-600 text-brand-600" aria-hidden="true" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          <motion.p {...enter(0.45)} className="mt-6 flex items-center gap-2 text-[13px] font-medium text-slate-soft">
            <Check className="size-4 text-brand-600" aria-hidden="true" />
            Free for students. No credit card required.
          </motion.p>
        </div>

        {/* Constellation */}
        <motion.div
          initial={reduce ? undefined : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: LANDING_EASE, delay: reduce ? 0 : 0.3 }}
          className="lg:pl-4"
        >
          <HeroConstellation />
        </motion.div>
      </div>
    </section>
  );
}
