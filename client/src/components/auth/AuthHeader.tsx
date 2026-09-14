import { Link } from "wouter";
import { GraduationCap } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center">
      <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6">
        <span className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 h-12 w-12 text-white">
          <GraduationCap className="h-6 w-6" />
        </span>
        <span className="font-display text-2xl tracking-[-0.04em] text-[#1e2433]">campusflow</span>
      </Link>
      <h2 className="font-display text-3xl tracking-[-0.04em] text-[#1e2433]">{title}</h2>
      <p className="mt-2 text-sm text-[#747b88]">{subtitle}</p>
    </div>
  );
}
