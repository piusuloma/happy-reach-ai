import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { flows } from "@/data/mock";
import { Plus, MessagesSquare, Eye, Pencil, Layers, ArrowRight, Bot } from "lucide-react";

const flowTemplates = [
  { name: "Main Menu", desc: "Restaurants, retail, multi-category", color: "grad-primary" },
  { name: "FAQ Handler", desc: "Repetitive questions, hours, delivery", color: "grad-sky" },
  { name: "Lead Qualifier", desc: "Real estate, B2B, services — Hot/Warm/Cold tagging", color: "grad-orange" },
  { name: "Appointment Booking", desc: "Clinics, salons, consultants", color: "grad-teal" },
  { name: "Complaint Logger", desc: "Post-purchase issues with ticket reference", color: "grad-violet" },
  { name: "Quote Follow-up", desc: "Service businesses chasing quotes", color: "grad-emerald" },
];

const Flows = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Chatbot Flows"
        subtitle="Two-way conversational automation. Numbered options + keyword triggers — predictable on any phone."
        actions={<Button className="rounded-xl grad-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-1.5" />New flow</Button>}
      />

      <h3 className="font-display font-bold text-lg mb-3">Your flows</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {flows.map(f => (
          <div key={f.id} className="surface-card p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl grad-sky text-white flex items-center justify-center"><Bot className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{f.name}</h4>
                  <StatusPill status={f.status === 'active' ? 'active' : f.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Template: {f.template} · Trigger: <span className="font-mono">{f.trigger}</span></p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span><b className="tabular-nums">{f.nodes}</b> <span className="text-muted-foreground">nodes</span></span>
                  <span>·</span>
                  <span><b className="tabular-nums">{f.sessions7d}</b> <span className="text-muted-foreground">sessions/7d</span></span>
                  <span>·</span>
                  <span className="text-success"><b className="tabular-nums">{f.resolution}%</b> resolved</span>
                  <span>·</span>
                  <span className="text-warning"><b className="tabular-nums">{f.handoffRate}%</b> handoff</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="rounded-xl"><Eye className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-xl"><Pencil className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-display font-bold text-lg mb-3">Pre-built templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {flowTemplates.map(t => (
          <div key={t.name} className="surface-card p-5 hover:shadow-[var(--shadow-md)] transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className={`h-10 w-10 rounded-xl ${t.color} text-white flex items-center justify-center mb-3`}><MessagesSquare className="h-5 w-5" /></div>
            <h4 className="font-semibold">{t.name}</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">{t.desc}</p>
            <Button variant="ghost" size="sm" className="rounded-xl w-full text-primary group-hover:bg-accent">Use template <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
          </div>
        ))}
      </div>

      {/* Builder preview */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Flow builder</h3>
            <p className="text-xs text-muted-foreground">Form-based: add a message, add numbered options, define what each option does next.</p>
          </div>
          <span className="text-[11px] text-muted-foreground">Max 20 nodes per flow</span>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-muted/40 to-accent/30 p-6 overflow-x-auto">
          <div className="flex items-start gap-4 min-w-[700px]">
            <FlowNode title="Welcome" body="Hi 👋 Welcome to Mama's Kitchen! What would you like to do?" options={["Browse menu","Track an order","Speak to an agent"]} />
            <Arrow />
            <FlowNode title="Browse menu" body="Today's specials. Reply with a number to add to cart." options={["🍛 Jollof — ₦2,500","🍚 Ofada — ₦3,000","🥘 Egusi — ₦2,800"]} />
            <Arrow />
            <FlowNode title="Confirm order" body="Great! Confirm your order to checkout." options={["Confirm & pay","Add another item","Cancel"]} success />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

function Arrow() { return <div className="pt-12 text-muted-foreground"><ArrowRight className="h-5 w-5" /></div>; }

function FlowNode({ title, body, options, success }: { title: string; body: string; options: string[]; success?: boolean }) {
  return (
    <div className={`w-[230px] surface-card p-3 ${success ? "ring-2 ring-success/40" : ""}`}>
      <div className="text-[10px] uppercase tracking-wide font-bold text-primary mb-1">{title}</div>
      <p className="text-xs leading-relaxed text-foreground mb-2">{body}</p>
      <div className="space-y-1">
        {options.map((o, i) => (
          <div key={i} className="text-[11px] bg-accent text-accent-foreground rounded-lg px-2 py-1.5 flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">{i+1}</span>
            {o}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Flows;
