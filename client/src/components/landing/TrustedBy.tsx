import { Reveal } from "./Reveal";

interface CrestProps {
  variant: "shield" | "hex" | "circle" | "diamond";
}

/** Simple geometric crest glyphs — inline SVG, no external assets. */
function Crest({ variant }: CrestProps) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 26 26",
    fill: "none",
    "aria-hidden": true as const,
    className: "shrink-0",
  };
  switch (variant) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M13 2.5 21.5 6v7c0 5-3.6 8.6-8.5 10.5C8.1 21.6 4.5 18 4.5 13V6L13 2.5Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13 8.5v9M9.5 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "hex":
      return (
        <svg {...common}>
          <path d="M13 2.8 21.8 7.9v10.2L13 23.2 4.2 18.1V7.9L13 2.8Z" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="13" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "circle":
      return (
        <svg {...common}>
          <circle cx="13" cy="13" r="10.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 16.5 13 7l5 9.5H8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="18" height="18" rx="2.5" transform="rotate(45 13 13)" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13 8.8v8.4M8.8 13h8.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}

const UNIVERSITIES = [
  { name: "Addis Ababa University", short: "AAU", crest: "shield" as const },
  { name: "Adama Science & Technology University", short: "ASTU", crest: "hex" as const },
  { name: "Hawassa University", short: "HU", crest: "circle" as const },
  { name: "Bahir Dar University", short: "BDU", crest: "diamond" as const },
];

export function TrustedBy() {
  return (
    <section aria-label="Universities whose students use CampusFlow" className="pb-20 md:pb-24">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-[12.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Trusted by students at
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-8 md:grid-cols-4">
            {UNIVERSITIES.map((u) => (
              <li key={u.short} className="flex">
                <span
                  className="flex items-center gap-2.5 text-slate-400 opacity-70 grayscale transition-all duration-300 hover:text-brand-600 hover:opacity-100 hover:grayscale-0"
                  title={u.name}
                >
                  <Crest variant={u.crest} />
                  <span className="text-left">
                    <span className="block text-[14px] font-semibold leading-tight tracking-[-0.01em]">
                      {u.short}
                    </span>
                    <span className="block max-w-[150px] truncate text-[10.5px] font-medium leading-tight text-slate-400/90">
                      {u.name}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
