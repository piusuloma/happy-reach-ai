import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Eye,
  Filter,
  Megaphone,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Send,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { campaigns, business, type Campaign, type CampaignKind } from "@/data/mock";
import { useState } from "react";

const liveBroadcasts = campaigns.filter(c => c.kind === "campaign" && (c.status === "sending" || c.status === "scheduled")).length;
const liveTriggered = campaigns.filter(c => c.kind === "triggered" && c.status === "live").length;
const sent30d = 14_286;
const delivered30d = 13_902;
const readRate = 68.4;
const ordersAttr = 412;

const STATUS_DOT: Record<string, string> = {
  live:      "bg-emerald-500",
  sending:   "bg-blue-500",
  completed: "bg-slate-400",
  scheduled: "bg-amber-400",
  paused:    "bg-orange-400",
  draft:     "bg-slate-300",
};

const STATUS_LABEL: Record<string, string> = {
  live:      "Live",
  sending:   "Sending",
  completed: "Completed",
  scheduled: "Scheduled",
  paused:    "Paused",
  draft:     "Draft",
};

const Automations = () => {
  const [tab, setTab] = useState<"all" | CampaignKind>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = campaigns.filter(
    c => (tab === "all" || c.kind === tab) && (status === "all" || c.status === status)
  );

  const counts = {
    all: campaigns.length,
    campaign: campaigns.filter(c => c.kind === "campaign").length,
    triggered: campaigns.filter(c => c.kind === "triggered").length,
  };

  return (
    <AppLayout>
      <PageHeader
        title="Automations"
        subtitle={`Verified WhatsApp messaging for ${business.name} — one-off broadcasts and always-on triggers, side by side.`}
        actions={
          <Button asChild className="rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]">
            <Link to="/automations/new"><Megaphone className="h-4 w-4 mr-1.5" />New automation</Link>
          </Button>
        }
      />

      {/* ── Performance summary ── */}
      <div className="surface-card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Last 30 days</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
              <Zap className="h-3 w-3" /> {liveTriggered} live triggers
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">
              <Send className="h-3 w-3" /> {liveBroadcasts} active
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <SummaryTile icon={Users}         color="text-sky-500"     label="Opted-in contacts" value={business.optedInContacts.toLocaleString()} sub="+38 this week" />
          <SummaryTile icon={Send}          color="text-primary"     label="Messages sent"     value={sent30d.toLocaleString()}                 sub={`${((delivered30d / sent30d) * 100).toFixed(1)}% delivered`} />
          <SummaryTile icon={Eye}           color="text-emerald-600" label="Read rate"         value={`${readRate}%`}                           sub="Industry avg 41%" />
          <SummaryTile icon={ArrowUpRight}  color="text-orange-500"  label="Orders attributed" value={ordersAttr.toLocaleString()}              sub="₦4.8M revenue" />
        </div>
      </div>

      {/* ── Kind + status filters ── */}
      <div className="surface-card p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
          {([
            { key: "all" as const, label: `All (${counts.all})` },
            { key: "campaign" as const, label: `Broadcasts (${counts.campaign})` },
            { key: "triggered" as const, label: `Triggered (${counts.triggered})` },
          ]).map(t => (
            <button type="button" key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto">
          {["all", "live", "sending", "scheduled", "completed", "paused", "draft"].map(s => (
            <button type="button" key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap ${status === s ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "All status" : s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-8 h-9 rounded-xl border-0 bg-muted/50 w-44 text-sm" />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl h-9"><Filter className="h-3.5 w-3.5 mr-1.5" />Filter</Button>
        </div>
      </div>

      {/* ── Automation list ── */}
      <div className="surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">No automations match the current filters.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c, i) => <AutomationRow key={c.id} c={c} index={i + 1} />)}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
        Every outbound automation is capped at one follow-up message. STOP replies remove the customer immediately.
      </div>
    </AppLayout>
  );
};

function AutomationRow({ c, index }: { c: Campaign; index: number }) {
  const hasData = c.sent > 0;
  const dot = STATUS_DOT[c.status] ?? "bg-slate-300";
  const label = STATUS_LABEL[c.status] ?? c.status;

  const isRunning = c.status === "sending" || c.status === "scheduled" || c.status === "live";

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm leading-tight">{c.name}</span>
          {c.kind === "triggered" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/30 text-orange-600 px-2 py-0.5 rounded-full">
              <Zap className="h-2.5 w-2.5" /> Triggered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
          <span className="font-medium text-foreground/70">{label}</span>
          <span>·</span>
          <span>{c.startCondition}</span>
          <span>·</span>
          <span>#{index}</span>
        </div>
        {c.audience && (
          <div className="mt-1 text-[11px] text-muted-foreground truncate max-w-xs">
            Audience: <span className="text-foreground/70">{c.audience}</span>
          </div>
        )}
      </div>

      {hasData ? (
        <div className="hidden md:flex items-center gap-6 shrink-0">
          <StatCol label="Recipients" value={c.reach} pct={100} />
          <StatCol label="Read" value={c.read} pct={Math.round((c.read / Math.max(c.delivered, 1)) * 100)} />
          <StatCol label="Replies" value={c.replied} pct={Math.round((c.replied / Math.max(c.sent, 1)) * 100)} />
          <StatCol label="Orders" value={c.orders} pct={Math.round((c.orders / Math.max(c.sent, 1)) * 100)} highlight={c.orders > 0} />
          <StatCol label="Opt-out" value={c.optedOut} pct={Math.round((c.optedOut / Math.max(c.sent, 1)) * 100)} muted />
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span>Reach <b className="text-foreground/70">{c.reach > 0 ? c.reach.toLocaleString() : "—"}</b></span>
          {c.scheduledFor && (
            <>
              <span>·</span>
              <span>Sends <b className="text-foreground/70">{c.scheduledFor}</b></span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {hasData && (
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
            <Activity className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
          {isRunning
            ? <Pause className="h-4 w-4" />
            : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatCol({ label, value, pct, highlight, muted }: {
  label: string; value: number; pct: number; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div className="text-center w-16">
      <div className="text-[10px] text-muted-foreground font-medium mb-1">{label}</div>
      <div className={`text-base font-bold tabular-nums leading-tight ${highlight ? "text-success" : muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value.toLocaleString()}
      </div>
      <div className={`text-[10px] tabular-nums ${muted ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{pct}%</div>
    </div>
  );
}

function SummaryTile({ icon: Icon, color, label, value, sub }: {
  icon: any; color: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="font-display font-bold text-lg leading-tight tabular-nums">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

export default Automations;
