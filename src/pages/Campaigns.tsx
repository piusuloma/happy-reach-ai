import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/StatusPill";
import { Link } from "react-router-dom";
import { Megaphone, Search, Filter, Eye, Pencil, MoreHorizontal, Pause, Play } from "lucide-react";
import { campaigns } from "@/data/mock";
import { useState } from "react";

const Campaigns = () => {
  const [filter, setFilter] = useState<string>("all");
  const filtered = campaigns.filter((c) => c.type === "broadcast" && (filter === "all" || c.status === filter));

  return (
    <AppLayout>
      <PageHeader
        title="Broadcast Campaigns"
        subtitle="One message, sent once, to a defined audience of opted-in contacts."
        actions={
          <Button asChild className="rounded-xl grad-primary text-primary-foreground border-0">
            <Link to="/campaigns/new"><Megaphone className="h-4 w-4 mr-1.5" />New broadcast</Link>
          </Button>
        }
      />

      <div className="surface-card p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search campaigns…" className="pl-9 rounded-xl border-0 bg-muted/50" />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
          {["all","draft","scheduled","sending","completed","paused"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${filter===s ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >{s}</button>
          ))}
        </div>
        <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4 mr-1.5" />Filters</Button>
      </div>

      <div className="grid gap-3">
        {filtered.map((c) => (
          <div key={c.id} className="surface-card p-5 hover:shadow-[var(--shadow-md)] transition-shadow">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-12 w-12 rounded-xl grad-primary flex items-center justify-center text-white shrink-0">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{c.name}</h3>
                  <StatusPill status={c.status} />
                  {c.scheduledFor && <span className="text-[11px] text-info bg-info/10 px-2 py-0.5 rounded-full">⏰ {c.scheduledFor}</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.preview}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span><b className="text-foreground">{c.audience}</b></span>
                  <span>·</span>
                  <span>Reach <b className="text-foreground tabular-nums">{c.reach.toLocaleString()}</b></span>
                  {c.sent > 0 && <>
                    <span>·</span>
                    <span>Read <b className="text-foreground tabular-nums">{Math.round((c.read/Math.max(c.delivered,1))*100)}%</b></span>
                    <span>·</span>
                    <span>Orders <b className="text-success tabular-nums">{c.orders}</b></span>
                  </>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-xl"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-xl"><Pencil className="h-4 w-4" /></Button>
                {c.status === "sending" || c.status === "scheduled"
                  ? <Button variant="ghost" size="icon" className="rounded-xl"><Pause className="h-4 w-4" /></Button>
                  : <Button variant="ghost" size="icon" className="rounded-xl"><Play className="h-4 w-4" /></Button>}
                <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
            </div>

            {c.sent > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-border">
                <Stat label="Sent" value={c.sent} />
                <Stat label="Delivered" value={c.delivered} pct={c.delivered/c.sent} />
                <Stat label="Read" value={c.read} pct={c.read/c.sent} />
                <Stat label="Replied" value={c.replied} pct={c.replied/c.sent} />
                <Stat label="Opted out" value={c.optedOut} pct={c.optedOut/c.sent} danger />
              </div>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

function Stat({ label, value, pct, danger }: { label: string; value: number; pct?: number; danger?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums mt-0.5">{value.toLocaleString()}</div>
      {pct !== undefined && (
        <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
          <div className={`h-full ${danger ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(pct*100, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

export default Campaigns;
