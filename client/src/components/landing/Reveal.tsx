import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/** Signature landing easing — smooth, damped, confident. */
export const LANDING_EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Entrance travel distance in px. */
  y?: number;
  duration?: number;
}

/**
 * Scroll-triggered reveal: y 24→0 + opacity fade, fires once when the
 * element enters the viewport (margin -80px). Honors prefers-reduced-motion.
 */
export function Reveal({ children, className, delay = 0, y = 24, duration = 0.6 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduce ? { duration: 0 } : { duration, ease: LANDING_EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

interface FloatProps {
  children?: ReactNode;
  className?: string;
  /** Oscillation amplitude in px. */
  amplitude?: number;
  /** Cycle duration in seconds. */
  duration?: number;
  delay?: number;
  style?: CSSProperties;
}

/**
 * Infinite gentle y oscillation for hero/showcase floating cards.
 * Rendered static when the user prefers reduced motion.
 */
export function Float({ children, className, amplitude = 8, duration = 6, delay = 0, style }: FloatProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={style}
      animate={reduce ? undefined : { y: [0, -amplitude, 0] }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration, repeat: Infinity, ease: "easeInOut", delay }
      }
    >
      {children}
    </motion.div>
  );
}
