import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  subtitle?: string;
  className?: string;
  /** Render left-aligned instead of centered. */
  align?: "center" | "left";
}

export function SectionHeading({ kicker, title, subtitle, className, align = "center" }: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand-600">
        {kicker}
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-slate-soft sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
