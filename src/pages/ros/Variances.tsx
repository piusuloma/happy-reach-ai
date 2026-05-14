import { Link } from "react-router-dom";
import { RosLayout } from "@/components/ros/RosLayout";
import { variances, staffById, formatNgn, totalVarianceNgn } from "@/data/ros";
import { ArrowRight } from "lucide-react";

const statusTone = {
  open:           "bg-destructive/10 text-destructive",
  investigating:  "bg-warning/15 text-warning",
  resolved:       "bg-success/10 text-success",
} as const;

const Variances = () => (
  <RosLayout title="Variances" subtitle={`${variances.length} open · ${formatNgn(totalVarianceNgn())} at risk`}>
    <ul className="space-y-2">
      {variances.map((v) => {
        const s = staffById(v.staffId);
        return (
          <li key={v.id}>
            <Link to={`/ros/variances/${v.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                {v.qty}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{v.ingredientName} {v.qty}{v.unit}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {v.shift} · {s?.name ?? "Unattributed"} · {v.detectedAt}
                </div>
                {v.pattern && (
                  <div className="text-xs text-muted-foreground italic mt-1">{v.pattern}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-base font-bold text-destructive tabular-nums">{formatNgn(v.valueNgn)}</div>
                <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mt-1 ${statusTone[v.status]}`}>
                  {v.status}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  </RosLayout>
);

export default Variances;
