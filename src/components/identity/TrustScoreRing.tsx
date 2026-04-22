import { bandFor } from "@/data/identity";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  className?: string;
}

export function TrustScoreRing({ score, size = 140, className }: Props) {
  const band = bandFor(score);
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorMap: Record<string, string> = {
    primary: "hsl(var(--primary))",
    success: "hsl(var(--success))",
    info: "hsl(var(--info))",
    muted: "hsl(var(--muted-foreground))",
  };
  const stroke = colorMap[band.tone];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={10} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display text-3xl font-bold leading-none tabular-nums">{score}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Trust score</div>
      </div>
    </div>
  );
}
