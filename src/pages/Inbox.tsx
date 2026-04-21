import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conversations } from "@/data/mock";
import { StatusPill } from "@/components/StatusPill";
import { useState } from "react";
import { Send, Bot, Pause, Play, ShieldCheck, Sparkles, User, AlertTriangle } from "lucide-react";

const transcript = [
  { from: "customer", t: "10:02", text: "Hi, do you deliver to Lekki Phase 1 today?" },
  { from: "bot", t: "10:02", text: "Hi 👋 Yes — we deliver to Lekki Phase 1 daily 11am–9pm. Reply 1 to see today's menu, 2 to track an order, 3 to speak to an agent." },
  { from: "customer", t: "10:03", text: "1" },
  { from: "bot", t: "10:03", text: "Today's specials:\n1️⃣ Smoky jollof — ₦2,500\n2️⃣ Ofada with sauce — ₦3,000\n3️⃣ Egusi & pounded yam — ₦2,800\nReply with the number to add to cart." },
  { from: "customer", t: "10:05", text: "Actually I'd like to speak to a person" },
  { from: "system", t: "10:05", text: "🤖 Bot paused — agent injection" },
  { from: "agent", t: "10:06", text: "Hi Tunde, this is Esther from Mama's Kitchen. Happy to help! Were you looking to place an order or ask about delivery?" },
];

const Inbox = () => {
  const [active, setActive] = useState(conversations[1]);
  const [draft, setDraft] = useState("");

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-4 h-[calc(100vh-9rem)]">
        {/* Conversation list */}
        <aside className="surface-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-lg">Inbox</h2>
            <p className="text-[11px] text-muted-foreground">Live bot + agent conversations</p>
            <Input placeholder="Search conversations…" className="mt-3 rounded-xl border-0 bg-muted/50" />
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left p-3 border-b border-border hover:bg-accent/40 transition-colors ${active.id === c.id ? "bg-accent" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full grad-emerald text-white flex items-center justify-center text-xs font-bold shrink-0">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{c.customer}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{c.updatedAt}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.lastMessage}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <StatusPill status={c.state} />
                      {c.tag && <StatusPill status={c.tag} />}
                      {c.unread > 0 && <span className="ml-auto h-5 min-w-[20px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Active conversation */}
        <section className="surface-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full grad-emerald text-white flex items-center justify-center text-xs font-bold">{active.avatar}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">{active.customer}<span className="inline-flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full"><ShieldCheck className="h-2.5 w-2.5" />Verified opt-in</span></div>
              <div className="text-[11px] text-muted-foreground tabular-nums">{active.phone}</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl"><Bot className="h-3.5 w-3.5 mr-1" />Bot {active.state === "bot" ? "running" : "paused"}</Button>
            <Button size="sm" className="rounded-xl grad-primary text-primary-foreground border-0">{active.state === "agent" ? <><Play className="h-3.5 w-3.5 mr-1" />Hand back to bot</> : <><Pause className="h-3.5 w-3.5 mr-1" />Take over</>}</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-[#E5DDD5]/40 space-y-2">
            {transcript.map((m, i) => {
              if (m.from === "system") return (
                <div key={i} className="flex justify-center my-3">
                  <span className="text-[10px] text-muted-foreground bg-card px-3 py-1 rounded-full border border-border flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-warning" />{m.text}</span>
                </div>
              );
              const isCustomer = m.from === "customer";
              const isAgent = m.from === "agent";
              return (
                <div key={i} className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isCustomer ? "bg-white rounded-tl-sm" : isAgent ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-[#DCF8C6] rounded-tr-sm"}`}>
                    {!isCustomer && (
                      <div className={`flex items-center gap-1 text-[10px] font-semibold mb-1 ${isAgent ? "text-primary-foreground/80" : "text-success"}`}>
                        {isAgent ? <><User className="h-2.5 w-2.5" />Esther · agent</> : <><Bot className="h-2.5 w-2.5" />Mama's Kitchen bot</>}
                      </div>
                    )}
                    <p className={`text-[13px] whitespace-pre-wrap leading-snug ${isAgent ? "" : "text-gray-800"}`}>{m.text}</p>
                    <div className={`text-[10px] mt-1 text-right ${isAgent ? "text-primary-foreground/60" : "text-gray-400"}`}>{m.t}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-border bg-card">
            <div className="rounded-xl bg-warning/10 text-warning text-[11px] px-3 py-1.5 mb-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" />Type below — bot pauses automatically the moment you send.</div>
            <div className="flex items-end gap-2">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a reply…" className="rounded-xl" />
              <Button className="rounded-xl grad-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </section>

        {/* Right rail context */}
        <aside className="surface-card p-5 overflow-y-auto">
          <h3 className="font-display font-bold mb-1">Customer context</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Auto-attached for every handoff.</p>

          <Field label="Lead tag" value={<StatusPill status={active.tag ?? "Cold"} />} />
          <Field label="Total orders" value="6" />
          <Field label="Last order" value="5 days ago · ₦7,200" />
          <Field label="Lifetime value" value="₦48,400" />
          <Field label="Location" value="Lekki Phase 1, Lagos" />
          <Field label="Opted in" value="Mar 2 · checkout" />

          <div className="mt-5 rounded-xl bg-accent p-3">
            <div className="text-xs font-semibold text-accent-foreground">Handoff reason</div>
            <p className="text-[11px] text-muted-foreground mt-1">Customer typed "speak to a person" — handoff trigger matched.</p>
          </div>

          <h4 className="font-semibold mt-5 mb-2 text-sm">Quick replies</h4>
          <div className="space-y-1.5">
            {["Order menu link","Delivery zones","Payment options","Refund policy"].map(q => (
              <button key={q} className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-accent transition-colors">{q}</button>
            ))}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default Inbox;
