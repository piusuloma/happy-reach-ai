import { Link, useParams, Navigate } from "react-router-dom";
import { RosLayout } from "@/components/ros/RosLayout";
import { variances, staffById, formatNgn, staff } from "@/data/ros";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, FileSearch, GraduationCap, CheckCircle2 } from "lucide-react";

const VarianceDetail = () => {
  const { id } = useParams();
  const v = variances.find((x) => x.id === id);
  if (!v) return <Navigate to="/ros/variances" replace />;
  const s = staffById(v.staffId);

  return (
    <RosLayout>
      <Link to="/ros/variances" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3 w-3" /> All variances
      </Link>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 mb-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h1 className="text-2xl font-bold">{v.ingredientName} short by {Math.abs(v.qty)} {v.unit}</h1>
        </div>
        <div className="text-sm text-destructive/80 font-semibold mt-1 tabular-nums">
          Loss value ≈ {formatNgn(v.valueNgn)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Shift</div>
          <div className="text-lg font-bold mt-1">{v.shift}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">On duty</div>
          <div className="text-lg font-bold mt-1">{s?.name ?? "Unattributed"}</div>
          {s && <div className="text-xs text-muted-foreground">{s.role} · clocked in {s.clockedInAt}</div>}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Detected</div>
          <div className="text-lg font-bold mt-1">{v.detectedAt}</div>
          <div className="text-xs text-muted-foreground capitalize">{v.status}</div>
        </div>
      </div>

      {v.pattern && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mb-5">
          <div className="text-[11px] uppercase tracking-wider text-warning font-semibold mb-1">Pattern detected</div>
          <div className="text-sm">{v.pattern}</div>
        </div>
      )}

      {/* Staff context */}
      {s && (
        <div className="rounded-xl border border-border bg-card p-4 mb-5">
          <div className="text-sm font-bold mb-3">{s.name}'s recent variances</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const filled = i < s.variancesThisWeek;
              return (
                <div key={i} className={`h-8 rounded ${filled ? "bg-destructive/70" : "bg-muted"}`} />
              );
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {s.variancesThisWeek} of last 7 days had a variance attributed to {s.name.split(" ")[0]}.
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <Button className="h-11"><GraduationCap className="h-4 w-4" /> Retrain {s?.name.split(" ")[0] ?? "staff"}</Button>
        <Button variant="outline" className="h-11"><FileSearch className="h-4 w-4" /> Review footage</Button>
        <Button variant="outline" className="h-11">Add note</Button>
        <Button variant="outline" className="h-11 border-success/40 text-success hover:bg-success/10 hover:text-success">
          <CheckCircle2 className="h-4 w-4" /> Resolve
        </Button>
      </div>

      {/* Other staff on this shift */}
      <div className="mt-6 text-xs text-muted-foreground">
        Other {v.shift} staff on duty:{" "}
        {staff.filter((x) => x.shift === v.shift && x.id !== v.staffId && x.onDuty).map((x) => x.name.split(" ")[0]).join(", ") || "none"}
      </div>
    </RosLayout>
  );
};

export default VarianceDetail;
