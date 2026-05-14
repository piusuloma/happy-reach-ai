import { RosLayout } from "@/components/ros/RosLayout";
import { staff } from "@/data/ros";
import { Camera, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Staff = () => {
  const onDuty = staff.filter((s) => s.onDuty);
  const off = staff.filter((s) => !s.onDuty);

  return (
    <RosLayout
      title="Staff"
      subtitle={`${onDuty.length} on duty now`}
      actions={<Button><Camera className="h-4 w-4" /> Clock in</Button>}
    >
      <Section title="On duty" people={onDuty} />
      <div className="h-6" />
      <Section title="Off duty" people={off} />
    </RosLayout>
  );
};

function Section({ title, people }: { title: string; people: typeof staff }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border text-sm font-bold">{title}</div>
      <ul className="divide-y divide-border">
        {people.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.role} · {s.shift}</div>
            </div>
            {s.onDuty && s.clockedInAt && (
              <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <Clock className="h-3 w-3" /> {s.clockedInAt}
              </div>
            )}
            <div className="text-right shrink-0">
              <div className={`text-sm font-bold tabular-nums ${s.variancesThisWeek > 2 ? "text-destructive" : s.variancesThisWeek > 0 ? "text-warning" : "text-success"}`}>
                {s.variancesThisWeek}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">7-day var.</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Staff;
