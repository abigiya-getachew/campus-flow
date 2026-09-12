import { Github, GraduationCap, Mail, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
] as const;

const SOCIALS = [
  { label: "CampusFlow on GitHub", href: "#", icon: Github },
  { label: "CampusFlow on X (Twitter)", href: "#", icon: Twitter },
] as const;

const linkClass =
  "rounded text-[13.5px] leading-6 text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 md:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_minmax(0,1.2fr)]">
          {/* Brand blurb */}
          <div className="col-span-2 md:col-span-1 md:pr-8">
            <a
              href="#top"
              className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
              aria-label="CampusFlow — back to top"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
                <GraduationCap className="size-[18px] text-white" aria-hidden="true" />
              </span>
              <span className="text-[17px] font-bold tracking-[-0.02em] text-white">CampusFlow</span>
            </a>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-slate-400">
              The academic workspace for students. Courses, assignments, grades, and study
              plans in one calm place. Always know what to do next.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-slate-300">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* GitHub + Contact */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-slate-300">
              Connect
            </h3>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a href="#" className={cn(linkClass, "inline-flex items-center gap-2")}>
                  <Github className="size-4" aria-hidden="true" /> GitHub
                </a>
              </li>
              <li>
                <a href="mailto:hello@campusflow.app" className={cn(linkClass, "inline-flex items-center gap-2")}>
                  <Mail className="size-4" aria-hidden="true" /> hello@campusflow.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[13px] text-slate-400">© 2026 CampusFlow. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
              >
                <s.icon className="size-[17px]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
