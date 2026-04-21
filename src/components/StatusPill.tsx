import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
  sending: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-border",
  paused: "bg-warning/10 text-warning border-warning/20",
  bot: "bg-info/10 text-info border-info/20",
  agent: "bg-primary/10 text-primary border-primary/20",
  queued: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  Hot: "bg-destructive/10 text-destructive border-destructive/20",
  Warm: "bg-warning/10 text-warning border-warning/20",
  Cold: "bg-info/10 text-info border-info/20",
  in_stock: "bg-success/10 text-success border-success/20",
  low_stock: "bg-warning/10 text-warning border-warning/20",
  out_of_stock: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant="outline" className={cn("capitalize font-medium rounded-full border", styles[status] ?? "bg-muted text-muted-foreground", className)}>
      {label}
    </Badge>
  );
}
