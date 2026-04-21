import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, MessageCircle, Lock } from "lucide-react";

const phases = [
  { phase: "Phase 2 — today", title: "Numbered menus + keywords", desc: "Customer presses 1, 2, 3 or types a known keyword. Predictable. Works on any device.", example: "1️⃣ Browse menu  2️⃣ Track order  3️⃣ Speak to agent", color: "grad-sky", live: true },
  { phase: "Phase 3 — building", title: "Expanded intent detection", desc: "Customer types natural phrases like 'track my order' or 'is X in stock' without needing a menu.", example: "Customer: \"where is my food?\" → routed to order tracking flow", color: "grad-orange", live: false },
  { phase: "Phase 4 — vision", title: "Conversational AI · no menus", desc: "Customer says what they want, the AI understands and acts. Built on top of every Phase 2 flow.", example: "Customer: \"book me a table for 4 at 7pm Saturday\" → booked, confirmed, calendar synced", color: "grad-violet", live: false },
];

const Ai = () => {
  return (
    <AppLayout>
      <PageHeader
        title="AI Conversational Layer"
        subtitle="The long-term direction: replace numbered menus with a conversation that just understands. Built on top of Phase 2 flow infrastructure."
        actions={<Button variant="outline" className="rounded-xl" disabled><Lock className="h-4 w-4 mr-1.5" />Joining waitlist</Button>}
      />

      <div className="rounded-3xl grad-primary p-8 text-primary-foreground mb-8 shadow-[var(--shadow-glow)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <Sparkles className="h-8 w-8 mb-3" />
        <h2 className="font-display text-3xl font-bold max-w-2xl leading-tight">From menus to natural conversation — without losing the verified-business trust signal.</h2>
        <p className="text-primary-foreground/85 mt-3 max-w-xl">Customers will say what they want. NativeID's AI will respond, act, and hand off to a human only when nuance demands it. Every reply still comes from your verified business.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {phases.map(p => (
          <div key={p.phase} className={`surface-card p-6 ${p.live ? "ring-2 ring-primary/30" : ""}`}>
            <div className={`h-12 w-12 rounded-xl ${p.color} text-white flex items-center justify-center mb-4`}>
              {p.live ? <MessageCircle className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{p.phase}</div>
            <h3 className="font-display font-bold text-lg mt-1">{p.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-[12px] italic border-l-2 border-primary/40">{p.example}</div>
            {p.live ? (
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-success font-semibold"><span className="h-2 w-2 rounded-full bg-success animate-pulse-soft" /> Live in your account</div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Coming soon</div>
            )}
          </div>
        ))}
      </div>

      <div className="surface-card p-6">
        <h3 className="font-display font-bold text-lg mb-3">What we're protecting along the way</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { title: "Verified identity", desc: "Every AI reply comes from your verified business profile — that's NativeID's structural advantage." },
            { title: "Predictable fallback", desc: "If the AI is uncertain, the customer always gets the menu — never a dead end." },
            { title: "Human escalation", desc: "Hot lead, complaint, or repeated confusion auto-routes to your agent inbox with full transcript." },
          ].map(b => (
            <div key={b.title} className="rounded-xl bg-accent p-4">
              <div className="font-semibold text-accent-foreground">{b.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Ai;
