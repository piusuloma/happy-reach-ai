import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/StatusPill";
import { Link } from "react-router-dom";
import { Megaphone, Search, Filter, Eye, Pencil, MoreHorizontal, Pause, Play, Send, GitBranch, Zap, ShieldCheck } from "lucide-react";
import { campaigns, type CampaignKind } from "@/data/mock";
import { useState } from "react";

const kindMeta: Record<CampaignKind, { label: string; icon: any; gradient: string; desc: string }> = {
  "one-time": { label: "One-time", icon: Send, gradient: "grad-primary", desc: "Sent once · now or scheduled" },
  "sequence": { label: "Sequence", icon: GitBranch, gradient: "grad-violet", desc: "Multi-step · stops on conversion" },
  "triggered": { label: "Triggered", icon: Zap, gradient: "grad-orange", desc: "Fires on an event · always on" },
};

const tabs: ("all" | CampaignKind)[] = ["all", "one-time", "sequence", "triggered"];

const Campaigns = () => {
  const [tab, setTab] = useState<"all" | CampaignKind>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = campaigns.filter(c =>
    (tab === "all" || c.kind === tab) &&
    (status === "all" || c.status === status)
  );

  const counts = {
    all: campaigns.length,
    "one-time": campaigns.filter(c => c.kind === "one-time").length,
    sequence: campaigns.filter(c => c.kind === "sequence").length,
    triggered: campaigns.filter(c => c.kind === "triggered").length,
  };

  return (
    <AppLayout>
      <PageHeader
        title="Campaigns"
        subtitle="Every automated message — one-time broadcasts, multi-step sequences, and event-triggered messages — live in one place."
        actions={
          <Button asChild className="rounded-xl grad-primary text-primary-foreground border-0">
            <Link to="/campaigns/new"><Megaphone className="h-4 w-4 mr-1.5" />New campaign</Link>
          </Button>
        }
      />

      {/* Kind tabs — the new mental model */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KindTab active={tab === "all"} onClick={() => setTab("all")} title="All campaigns" hint={`${counts.all} total`} icon={Megaphone} gradient="grad-primary" />
        {(["one-time", "sequence", "triggered"] as CampaignKind[]).map(k => {
          const m = kindMeta[k];
          return <KindTab key={k} active={tab === k} onClick={() => setTab(k)} title={m.label} hint={`${counts[k]} · ${m.desc}`} icon={m.icon} gradient={m.gradient} />;
        })}
      </div>

      <div className="surface-card p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search campaigns…" className="pl-9 rounded-xl border-0 bg-muted/50" />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto">
          {["all", "live", "draft", "scheduled", "sending", "completed", "paused"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${status === s ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
        <Button variant="outline" className="rounded-xl"><Filter className="h-4 w-4 mr-1.5" />Filters</Button>
      </div>

      <div className="grid gap-3">
        {filtered.map(c => {
          const m = kindMeta[c.kind];
          const Icon = m.icon;
          return (
            <div key={c.id} className="surface-card p-5 hover:shadow-[var(--shadow-md)] transition-shadow">
              <div className="flex flex-wrap items-start gap-4">
                <div className={`h-12 w-12 rounded-xl ${m.gradient} flex items-center justify-center text-white shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{c.name}</h3>
                    <StatusPill status={c.status} />
                    <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{m.label}</span>
                    {c.steps && <span className="text-[11px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{c.steps} steps</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.preview}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{c.startCondition}</span>
                    <span>·</span>
                    <span>Audience <b className="text-foreground">{c.audience}</b></span>
                    <span>·</span>
                    <span>Reach <b className="text-foreground tabular-nums">{c.reach.toLocaleString()}</b></span>
                    {c.sent > 0 && <>
                      <span>·</span>
                      <span>Read <b className="text-foreground tabular-nums">{Math.round((c.read / Math.max(c.delivered, 1)) * 100)}%</b></span>
                      <span>·</span>
                      <span>Orders <b className="text-success tabular-nums">{c.orders}</b></span>
                    </>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-xl"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl"><Pencil className="h-4 w-4" /></Button>
                  {c.status === "sending" || c.status === "scheduled" || c.status === "live"
                    ? <Button variant="ghost" size="icon" className="rounded-xl"><Pause className="h-4 w-4" /></Button>
                    : <Button variant="ghost" size="icon" className="rounded-xl"><Play className="h-4 w-4" /></Button>}
                  <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>

              {c.sent > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-border">
                  <Stat label="Sent" value={c.sent} />
                  <Stat label="Delivered" value={c.delivered} pct={c.delivered / c.sent} />
                  <Stat label="Read" value={c.read} pct={c.read / c.sent} />
                  <Stat label="Replied" value={c.replied} pct={c.replied / c.sent} />
                  <Stat label="Opted out" value={c.optedOut} pct={c.optedOut / c.sent} danger />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 surface-card p-4 flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
        Every campaign respects the 2-per-24h frequency cap and STOP replies — no matter the kind.
      </div>
    </AppLayout>
  );
};

function KindTab({ active, onClick, title, hint, icon: Icon, gradient }: any) {
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all ${active ? "border-primary/40 bg-primary/5 shadow-[var(--shadow-md)]" : "border-border bg-card hover:border-primary/20"}`}>
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg ${gradient} text-white flex items-center justify-center`}><Icon className="h-4 w-4" /></div>
        <div className="min-w-0">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value, pct, danger }: { label: string; value: number; pct?: number; danger?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums mt-0.5">{value.toLocaleString()}</div>
      {pct !== undefined && (
        <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
          <div className={`h-full ${danger ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

export default Campaigns;
