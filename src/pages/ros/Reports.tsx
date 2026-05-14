import { RosLayout, StatBox } from "@/components/ros/RosLayout";
import { recipes, weeklyVarianceTrend, formatNgn, today, totalVarianceNgn } from "@/data/ros";
import { TrendingDown } from "lucide-react";

const Reports = () => {
  const max = Math.max(...weeklyVarianceTrend.map((d) => d.value));
  const weekTotal = weeklyVarianceTrend.reduce((s, d) => s + d.value, 0);
  const topItems = [...recipes].sort((a, b) => b.soldToday * b.price - a.soldToday * a.price).slice(0, 5);

  return (
    <RosLayout title="Reports" subtitle="Daily and weekly trends">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBox label="Today's sales" value={formatNgn(today.salesNgn)} tone="success" />
        <StatBox label="Today's variance" value={formatNgn(totalVarianceNgn())} tone="danger" />
        <StatBox label="7-day variance" value={formatNgn(weekTotal)} />
        <StatBox label="Trend" value="↓ Improving" hint="vs prior 7 days" tone="success" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold">Variance — last 7 days</h2>
            <p className="text-xs text-muted-foreground">Naira lost per day</p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs text-success font-semibold">
            <TrendingDown className="h-3 w-3" /> Down vs prior week
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {weeklyVarianceTrend.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1.5">
              <div className="text-[10px] tabular-nums text-muted-foreground">{Math.round(d.value / 1000)}k</div>
              <div
                className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                style={{ height: `${(d.value / max) * 100}%` }}
              />
              <div className="text-[11px] font-medium text-muted-foreground">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-bold">Top sellers today</div>
        <ul className="divide-y divide-border">
          {topItems.map((r) => (
            <li key={r.itemId} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="text-xl">{r.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.category} · {formatNgn(r.price)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold tabular-nums">{r.soldToday} sold</div>
                <div className="text-xs text-muted-foreground tabular-nums">{formatNgn(r.soldToday * r.price)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </RosLayout>
  );
};

export default Reports;
