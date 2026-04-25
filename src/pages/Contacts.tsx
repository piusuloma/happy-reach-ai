import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contacts, segments } from "@/data/mock";
import { Search, Download, ShieldCheck, ShieldOff, Plus, Sparkles } from "lucide-react";

const Contacts = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Contacts & Segments"
        subtitle="Opt-in is captured at checkout. Only opted-in contacts can receive automations."
        actions={<><Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-1.5" />Export</Button><Button className="rounded-xl grad-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-1.5" />New segment</Button></>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 surface-card p-5 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">Segments</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            These are the same audiences you pick when creating an automation.
          </p>
          <ul className="space-y-1">
            {segments.map(s => (
              <li key={s.id}>
                <button type="button" className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0 leading-none">{s.emoji}</span>
                      <span className="text-sm font-medium text-foreground truncate">{s.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 font-semibold">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 pl-7">
                    <span className="text-[10px] text-muted-foreground leading-snug truncate">{s.desc}</span>
                    {s.type === "auto" && (
                      <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold text-primary bg-primary/8 px-1.5 py-0.5 rounded-full">
                        <Sparkles className="h-2.5 w-2.5" />auto
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border">
            <button type="button" className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1.5 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add custom segment
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="surface-card p-4 mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, phone…" className="pl-9 rounded-xl border-0 bg-muted/50" />
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Contact</th>
                  <th className="text-left font-medium px-4 py-3">Phone</th>
                  <th className="text-left font-medium px-4 py-3">Opt-in</th>
                  <th className="text-left font-medium px-4 py-3">Tags</th>
                  <th className="text-right font-medium px-4 py-3">Orders</th>
                  <th className="text-right font-medium px-4 py-3">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-xs font-bold">{c.name.split(' ').map(n=>n[0]).join('')}</div>
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{c.segment}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.phone}</td>
                    <td className="px-4 py-3">
                      {c.optedIn ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full"><ShieldCheck className="h-3 w-3" />Opted in</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><ShieldOff className="h-3 w-3" />No opt-in</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map(t => <span key={t} className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">{t}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{c.orders}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Contacts;
