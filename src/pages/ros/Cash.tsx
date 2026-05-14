import { useState } from "react";
import { RosLayout, StatBox } from "@/components/ros/RosLayout";
import { today, expectedCashNgn, formatNgn } from "@/data/ros";
import { Button } from "@/components/ui/button";
import { Delete, CheckCircle2, AlertTriangle } from "lucide-react";

const Cash = () => {
  const [entered, setEntered] = useState<string>("");

  const press = (k: string) => {
    if (k === "back") return setEntered((s) => s.slice(0, -1));
    if (k === "clear") return setEntered("");
    setEntered((s) => (s + k).slice(0, 9));
  };

  const actual = Number(entered || 0);
  const variance = actual - expectedCashNgn;
  const hasEntry = entered !== "";

  return (
    <RosLayout title="End-of-shift reconciliation" subtitle="Dinner shift · Ngozi (cashier)">
      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        <StatBox label="Total sales"  value={formatNgn(today.salesNgn)} />
        <StatBox label="Refunds"      value={`-${formatNgn(today.refundsNgn)}`} />
        <StatBox label="Expenses"     value={`-${formatNgn(today.expensesNgn)}`} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 mb-5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Expected in drawer</div>
        <div className="text-3xl font-bold tabular-nums">{formatNgn(expectedCashNgn)}</div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Counted amount</div>
        <div className="h-20 rounded-xl bg-muted flex items-center justify-end px-5 text-4xl font-bold tabular-nums mb-4">
          {hasEntry ? formatNgn(actual) : <span className="text-muted-foreground">₦0</span>}
        </div>

        {hasEntry && (
          <div className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
            variance === 0 ? "bg-success/10 text-success" :
            variance < 0 ? "bg-destructive/10 text-destructive" :
            "bg-warning/10 text-warning"
          }`}>
            {variance === 0 ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
            <div>
              <div className="font-bold text-base">
                {variance === 0 ? "Balanced" :
                 variance < 0 ? `${formatNgn(Math.abs(variance))} short` :
                 `${formatNgn(variance)} over`}
              </div>
              <div className="text-xs opacity-80">
                Expected {formatNgn(expectedCashNgn)} · counted {formatNgn(actual)}
              </div>
            </div>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {["1","2","3","4","5","6","7","8","9","clear","0","back"].map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="h-14 rounded-xl border border-border bg-card hover:bg-muted text-xl font-semibold flex items-center justify-center transition-colors"
            >
              {k === "back" ? <Delete className="h-5 w-5" /> : k === "clear" ? <span className="text-xs uppercase tracking-wider">Clear</span> : k}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <Button variant="outline" className="h-12">Recount</Button>
          <Button className="h-12" disabled={!hasEntry}>Close shift</Button>
        </div>
      </div>
    </RosLayout>
  );
};

export default Cash;
