import { ShieldCheck, BadgeCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tier } from "@/data/identity";

interface Props {
  tier: Tier;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const tierMeta: Record<Tier, { label: string; gradient: string; icon: typeof ShieldCheck }> = {
  1: { label: "Contact Verified", gradient: "grad-sky", icon: ShieldCheck },
  2: { label: "CAC & NIN Verified", gradient: "grad-primary", icon: BadgeCheck },
  3: { label: "Address Verified", gradient: "grad-violet", icon: Sparkles },
};

const sizeMap = {
  sm: { wrap: "px-2 py-1 text-[10px] gap-1", icon: "h-3 w-3" },
  md: { wrap: "px-3 py-1.5 text-xs gap-1.5", icon: "h-3.5 w-3.5" },
  lg: { wrap: "px-4 py-2 text-sm gap-2", icon: "h-4 w-4" },
  xl: { wrap: "px-5 py-2.5 text-base gap-2", icon: "h-5 w-5" },
};

export function VerifiedBadge({ tier, size = "md", className }: Props) {
  const m = tierMeta[tier];
  const s = sizeMap[size];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold text-white shadow-[var(--shadow-md)]",
        m.gradient,
        s.wrap,
        className,
      )}
    >
      <Icon className={s.icon} />
      {m.label}
    </span>
  );
}
