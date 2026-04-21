import { AppLayout, PageHeader } from "@/components/AppLayout";
import { StatTile } from "@/components/StatTile";
import { StatusPill } from "@/components/StatusPill";
import { Megaphone, Users, MessageSquare, CheckCircle2, ArrowUpRight, Zap, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { campaigns, triggers, messagesSeries, business } from "@/data/mock";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const Index = () => {
  const active = campaigns.filter((c) => c.status === "sending" || c.status === "scheduled").length;
  const sent30d = 14_286;
  const delivered = 13_902;
  const deliveryRate = ((delivered / sent30d) * 100).toFixed(1);
  const enabledTriggers = triggers.filter((t) => t.enabled).length;

  return (
    <AppLayout>
      <PageHeader
        title="Automation Engine"
        subtitle={`Verified WhatsApp messaging on top of ${business.name} · the right message to the right customer at the right moment.`}
        actions={
          <>
            <Button variant="outline" asChild className="rounded-xl"><Link to="/campaigns"><Megaphone className="h-4 w-4 mr-1.5" />All campaigns</Link></Button>
            <Button asChild className="rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]">
              <Link to="/campaigns/new"><Megaphone className="h-4 w-4 mr-1.5" />New campaign</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Users} value={business.optedInContacts.toLocaleString()} label="Opted-in contacts" hint="+38 this week" gradient="emerald" />
        <StatTile icon={MessageSquare} value={sent30d.toLocaleString()} label="Messages sent · 30d" hint={`${deliveryRate}% delivered`} gradient="teal" />
        <StatTile icon={CheckCircle2} value="68.4%" label="Read rate" hint="Industry avg 41%" gradient="sky" />
        <StatTile icon={ArrowUpRight} value="412" label="Orders from automations" hint="₦4.8M attributed revenue" gradient="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-display text-lg font-bold">Messaging volume</h3>
              <p className="text-xs text-muted-foreground">Last 14 days · all automations and campaigns</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />Read</span>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={messagesSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gSent)" />
                <Area type="monotone" dataKey="read" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#gRead)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-6">
          <h3 className="font-display text-lg font-bold mb-4">Engine status</h3>
          <ul className="space-y-3 text-sm">
            <Row icon={Megaphone} label="Active one-time" value={campaigns.filter(c => c.kind === 'one-time' && (c.status === 'sending' || c.status === 'scheduled')).length} to="/campaigns" />
            <Row icon={GitBranch} label="Running sequences" value={campaigns.filter(c => c.kind === 'sequence' && c.status === 'sending').length} to="/campaigns" />
            <Row icon={Zap} label="Live triggered" value={campaigns.filter(c => c.kind === 'triggered' && c.status === 'live').length} to="/campaigns" />
            <Row icon={Sparkles} label="2-per-24h cap" value="Enforced" to="/campaigns" />
          </ul>
          <div className="mt-5 rounded-xl bg-accent p-4">
            <div className="text-xs font-semibold text-accent-foreground">Frequency cap protected</div>
            <p className="text-[11px] text-muted-foreground mt-1">Each customer receives at most 2 automated messages per 24 hours across all campaigns.</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold">Recent campaigns</h3>
            <p className="text-xs text-muted-foreground">Top of mind · last 7 days</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-xl"><Link to="/campaigns">View all<ArrowUpRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="pb-2 pr-4 font-medium">Campaign</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 pr-4 font-medium">Audience</th>
                <th className="pb-2 pr-4 font-medium text-right">Reach</th>
                <th className="pb-2 pr-4 font-medium text-right">Read</th>
                <th className="pb-2 font-medium text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[320px]">{c.preview}</div>
                  </td>
                  <td className="py-3 pr-4"><StatusPill status={c.status} /></td>
                  <td className="py-3 pr-4 text-muted-foreground">{c.audience}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.reach.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.read ? `${Math.round((c.read / Math.max(c.delivered,1))*100)}%` : '—'}</td>
                  <td className="py-3 text-right tabular-nums font-semibold text-success">{c.orders || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

function Row({ icon: Icon, label, value, to }: any) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 py-1.5 hover:text-primary transition-colors">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center"><Icon className="h-4 w-4 text-accent-foreground" /></div>
        <span className="text-muted-foreground">{label}</span>
        <span className="ml-auto font-semibold tabular-nums">{value}</span>
      </Link>
    </li>
  );
}

export default Index;
