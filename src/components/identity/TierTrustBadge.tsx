import {
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { bandFor, type Tier } from "@/data/identity";
import { cn } from "@/lib/utils";

interface Props {
  tier: Tier;
  trustScore: number;
  className?: string;
}

/**
 * Composite hero badge shown on the public profile. One unit combining the
 * NativeID verification mark, the merchant's tier, and their trust score.
 *
 * Each tier has a distinct visual treatment so customers can read trust
 * level at a glance without comparing badges:
 *  - Tier 1 (Contact Verified): sky gradient, plain shield, soft shadow.
 *  - Tier 2 (CAC & NIN Verified): primary gradient, badge-check icon,
 *    inner ring, glow shadow, single accent star.
 *  - Tier 3 (Address Verified): violet gradient, sparkles icon, double
 *    ring, stronger glow, two accent stars — feels "premium".
 */
const tierStyle: Record<
  Tier,
  {
    label: string;
    icon: typeof ShieldCheck;
    gradient: string;
    shadow: string;
    ring: string;
    stars: number;
  }
> = {
  1: {
    label: "Contact Verified",
    icon: ShieldCheck,
    gradient: "grad-sky",
    shadow: "shadow-[var(--shadow-md)]",
    ring: "",
    stars: 0,
  },
  2: {
    label: "CAC & NIN Verified",
    icon: BadgeCheck,
    gradient: "grad-primary",
    shadow: "shadow-[var(--shadow-glow)]",
    ring: "ring-1 ring-white/30",
    stars: 1,
  },
  3: {
    label: "Address Verified",
    icon: Sparkles,
    gradient: "grad-violet",
    shadow: "shadow-[0_18px_45px_-12px_hsl(var(--primary)/0.45)]",
    ring: "ring-2 ring-white/40",
    stars: 2,
  },
};

export function TierTrustBadge({ tier, trustScore, className }: Props) {
  const meta = tierStyle[tier];
  const band = bandFor(trustScore);
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 text-white",
        meta.gradient,
        meta.shadow,
        meta.ring,
        className,
      )}
    >
      {/* Soft sheen so higher tiers read as premium without animation cost */}
      <div className="absolute -top-12 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      {tier === 3 && (
        <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      )}

      {/* Accent stars — subtle ornament that scales with tier */}
      {meta.stars > 0 && (
        <div className="absolute top-3 right-3 flex gap-0.5 text-white/70">
          {Array.from({ length: meta.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-white/80" />
          ))}
        </div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Tier icon */}
        <div
          className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
            "bg-white/20 backdrop-blur-sm border border-white/20",
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        {/* Identity + tier label */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-90">
            <ShieldCheck className="h-3 w-3" />
            NativeID Verified
          </div>
          <div className="font-display font-bold text-[15px] leading-tight mt-0.5 truncate">
            {meta.label}
          </div>
          <div className="text-[11px] opacity-85 mt-0.5">
            Tier {tier} · {band.label}
          </div>
        </div>

        {/* Trust score */}
        <div className="shrink-0 text-center pl-3 border-l border-white/25">
          <div className="font-display text-3xl font-bold tabular-nums leading-none">
            {trustScore}
          </div>
          <div className="text-[9px] uppercase tracking-wider opacity-90 font-semibold mt-1">
            Trust score
          </div>
        </div>
      </div>
    </div>
  );
}
