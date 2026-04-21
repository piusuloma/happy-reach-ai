import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { triggers } from "@/data/mock";
import { Zap, ShieldCheck, Sparkles, Pencil } from "lucide-react";
import { useState } from "react";
import { ShoppingCart, Star, Clock, UserPlus, Heart, TrendingDown } from "lucide-react";

const iconFor: Record<string, any> = {
  welcome: UserPlus, order_confirmation: ShoppingCart, abandoned_cart: ShoppingCart,
  satisfaction: Star, offer_expiry: Clock, comeback: Heart, slow_product: TrendingDown,
};
const colorFor: Record<string, string> = {
  lifecycle: "grad-emerald", recovery: "grad-orange", retention: "grad-violet", ops: "grad-sky",
};
const groupLabel: Record<string, string> = {
  lifecycle: "Lifecycle", recovery: "Recovery", retention: "Retention", ops: "Operations",
};

const Triggers = () => {
  const [items, setItems] = useState(triggers);
  const groups = ["lifecycle", "recovery", "retention", "ops"] as const;

  return (
    <AppLayout>
      <PageHeader
        title="Trigger Automations"
        subtitle="Event-based one-way messages. The system fires the right message the moment the right thing happens."
        actions={<Button variant="outline" className="rounded-xl"><Sparkles className="h-4 w-4 mr-1.5" />Custom trigger</Button>}
      />

      {/* Hero stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Active triggers", v: items.filter(i=>i.enabled).length, sub: `of ${items.length}`, c: "text-success" },
          { l: "Fired · 30 days", v: items.reduce((a,b)=>a+b.fired30d,0).toLocaleString(), sub: "across all triggers", c: "" },
          { l: "Cap protection", v: "2/24h", sub: "per customer enforced", c: "text-primary" },
          { l: "STOP honoured", v: "100%", sub: "instant opt-out compliance", c: "text-info" },
        ].map(s => (
          <div key={s.l} className="surface-card p-5">
            <div className={`text-3xl font-bold font-display tabular-nums ${s.c}`}>{s.v}</div>
            <div className="text-sm font-medium mt-1">{s.l}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {groups.map(g => (
        <section key={g} className="mb-8">
          <h3 className="font-display font-bold text-lg mb-3">{groupLabel[g]}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(t => t.category === g).map(t => {
              const Icon = iconFor[t.key] ?? Zap;
              return (
                <div key={t.id} className="surface-card p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl ${colorFor[t.category]} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{t.name}</h4>
                        {t.enabled && <span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded">⏱ {t.delay}</span>
                        {t.enabled && <>
                          <span>· <b className="text-foreground tabular-nums">{t.fired30d.toLocaleString()}</b> fired/30d</span>
                          <span>· <b className="text-success tabular-nums">{t.conv}%</b> conv</span>
                        </>}
                      </div>
                    </div>
                    <Switch checked={t.enabled} onCheckedChange={(v) => setItems(p => p.map(x => x.id === t.id ? { ...x, enabled: v } : x))} />
                  </div>
                  <div className="mt-4 rounded-xl bg-muted/40 p-3 text-[12px] italic text-muted-foreground border-l-2 border-primary/40">
                    "{t.example}"
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-[11px] flex items-center gap-1 text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-success" /> Respects 2/24h cap & STOP
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg h-7 text-xs"><Pencil className="h-3 w-3 mr-1" />Edit message</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </AppLayout>
  );
};

export default Triggers;
