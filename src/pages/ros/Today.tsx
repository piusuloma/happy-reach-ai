import { Link } from "react-router-dom";
import { RosLayout, StatBox } from "@/components/ros/RosLayout";
import {
  today,
  expectedCashNgn,
  cashShortageNgn,
  variances,
  totalVarianceNgn,
  formatNgn,
  staffById,
} from "@/data/ros";
import { AlertTriangle, ArrowRight, Banknote, Boxes, Users } from "lucide-react";

const Today = () => {
  const openVariances = variances.filter((v) => v.status !== "resolved");

  return (
    <RosLayout title={`Today · ${today.date}`} subtitle="Esther — Mama's Kitchen, Lekki">
      {/* Alert banner */}
      {openVariances.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-destructive">
              {openVariances.length} variances detected today · {formatNgn(totalVarianceNgn())} at risk
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Largest: {openVariances[0].ingredientName} {openVariances[0].qty}{openVariances[0].unit} during {openVariances[0].shift} shift.
            </div>
          </div>
          <Link
            to="/ros/variances"
            className="text-xs font-semibold text-destructive hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Investigate <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBox label="Sales" value={formatNgn(today.salesNgn)} hint={`${variances.length === 0 ? "All clear" : "Live"}`} tone="success" />
        <StatBox label="Cash on hand" value={formatNgn(today.cashOnHandNgn)}
          hint={cashShortageNgn > 0 ? `${formatNgn(cashShortageNgn)} short` : "Balanced"}
          tone={cashShortageNgn > 0 ? "warning" : "success"} />
        <StatBox label="Variances" value={String(openVariances.length)} hint={formatNgn(totalVarianceNgn())} tone="danger" />
        <StatBox label="Expected cash" value={formatNgn(expectedCashNgn)} hint="Sales − refunds − expenses" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { to: "/ros/inventory", icon: Boxes,    label: "Count inventory" },
          { to: "/ros/cash",      icon: Banknote, label: "Reconcile cash" },
          { to: "/ros/staff",     icon: Users,    label: "Staff insights" },
        ].map((a) => (
          <Link key={a.to} to={a.to}
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <a.icon className="h-4 w-4" />
            </div>
            <div className="font-semibold text-sm">{a.label}</div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Today's variances */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold">Today's variances</h2>
          <Link to="/ros/variances" className="text-xs text-primary font-semibold">See all</Link>
        </div>
        <ul className="divide-y divide-border">
          {openVariances.map((v) => {
            const s = staffById(v.staffId);
            return (
              <li key={v.id}>
                <Link to={`/ros/variances/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                  <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center text-sm font-bold">
                    {v.qty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{v.ingredientName} short by {Math.abs(v.qty)}{v.unit}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {v.shift} shift · {s ? s.name : "—"} · {v.detectedAt}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-destructive tabular-nums">{formatNgn(v.valueNgn)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{v.status}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </RosLayout>
  );
};

export default Today;
