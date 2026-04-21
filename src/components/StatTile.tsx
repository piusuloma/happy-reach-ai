import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  gradient?: "emerald" | "teal" | "orange" | "violet" | "sky" | "primary";
}
const grads: Record<string, string> = {
  emerald: "grad-emerald",
  teal: "grad-teal",
  orange: "grad-orange",
  violet: "grad-violet",
  sky: "grad-sky",
  primary: "grad-primary",
};

export function StatTile({ icon: Icon, value, label, hint, gradient = "primary" }: StatTileProps) {
  return (
    <div className={cn("stat-tile", grads[gradient])}>
      <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl md:text-3xl font-bold font-display leading-none">{value}</div>
        <div className="text-sm text-white/85 mt-1">{label}</div>
        {hint && <div className="text-[11px] text-white/70 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
