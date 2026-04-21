import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { campaigns } from "@/data/mock";
import { GitBranch, Plus, ArrowRight, Clock, CheckCircle2, X } from "lucide-react";

const sequenceTemplates = [
  { name: "Product launch", color: "grad-primary", trigger: "Manual", steps: ["Day 0 — launch message", "Day 2 — non-buyer follow-up", "Day 5 — final reminder + 10% off"], stops: "Contact orders or opts out" },
  { name: "Re-engagement", color: "grad-violet", trigger: "No order in 30 days", steps: ["Day 0 — return offer", "Day 3 — second nudge", "Day 7 — final message"], stops: "Contact orders, replies, or opts out" },
  { name: "Abandoned cart", color: "grad-orange", trigger: "Cart inactive > 1 hour", steps: ["Hour 1 — cart reminder", "Hour 4 — second reminder", "Hour 24 — final + discount"], stops: "Contact completes order" },
  { name: "Quote follow-up", color: "grad-teal", trigger: "Quote sent", steps: ["Day 0 — quote sent confirmation", "Day 2 — review nudge", "Day 5 — final check-in"], stops: "Contact responds" },
  { name: "Appointment reminder", color: "grad-sky", trigger: "Appointment created", steps: ["Day −2 — upcoming reminder", "Day −1 — tomorrow reminder", "Hour −2 — see you soon"], stops: "Appointment occurs or is cancelled" },
  { name: "Post-purchase nurture", color: "grad-emerald", trigger: "Order completed", steps: ["Day 3 — thank you", "Day 7 — satisfaction check-in", "Day 21 — next-order prompt"], stops: "Contact orders again or opts out" },
];

const Sequences = () => {
  const running = campaigns.filter(c => c.type === "sequence");

  return (
    <AppLayout>
      <PageHeader
        title="Campaign Sequences"
        subtitle="Multi-step follow-ups that only message contacts who haven't taken the desired action yet."
        actions={<Button className="rounded-xl grad-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-1.5" />New sequence</Button>}
      />

      <h3 className="font-display font-bold text-lg mb-3">Running sequences</h3>
      <div className="grid gap-3 mb-10">
        {running.map(c => {
          const conv = c.sent > 0 ? Math.round((c.orders / c.sent) * 100) : 0;
          return (
            <div key={c.id} className="surface-card p-5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl grad-violet text-white flex items-center justify-center"><GitBranch className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{c.name}</h4>
                    <StatusPill status={c.status} />
                    <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c.steps} steps · {c.updatedAt}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.preview}</p>

                  <div className="grid grid-cols-3 mt-4 gap-2">
                    {Array.from({ length: c.steps ?? 3 }).map((_, i) => {
                      const done = i < (c.steps ?? 3) - 1;
                      const active = i === (c.steps ?? 3) - 2;
                      return (
                        <div key={i} className={`rounded-xl border p-3 text-xs ${done ? "border-success/30 bg-success/5" : active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
                          <div className="flex items-center gap-1.5 font-semibold">
                            {done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                            Step {i + 1}
                          </div>
                          <div className="text-muted-foreground mt-1">{["Day 0", "Day 2", "Day 5"][i] ?? `Step ${i+1}`}</div>
                          <div className="tabular-nums font-semibold mt-1">{done ? `${Math.round(c.sent / 3).toLocaleString()} sent` : active ? "queuing…" : "waiting"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold font-display text-success tabular-nums">{conv}%</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">conversion</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.orders} orders</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="font-display font-bold text-lg mb-3">Start from a template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sequenceTemplates.map(t => (
          <div key={t.name} className="surface-card p-5 hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className={`h-10 w-10 rounded-xl ${t.color} text-white flex items-center justify-center mb-3`}><GitBranch className="h-5 w-5" /></div>
            <h4 className="font-semibold">{t.name}</h4>
            <p className="text-[11px] text-muted-foreground mb-3">Trigger: {t.trigger}</p>
            <ul className="space-y-1.5 text-xs">
              {t.steps.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                  <span className="text-foreground">{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-border flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <X className="h-3 w-3 mt-0.5 text-destructive shrink-0" /> Stops when: {t.stops}
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl w-full mt-3 text-primary hover:text-primary">Use template <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Sequences;
