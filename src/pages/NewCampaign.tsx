import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Image as ImageIcon, Sparkles, Send, Calendar, Users, Eye, Info, GitBranch, Zap, ArrowLeft, Plus, Trash2, ShoppingCart, Star, UserPlus, Heart, Clock, TrendingDown, Megaphone, PartyPopper, Tag, RotateCcw } from "lucide-react";
import { useState } from "react";
import { segments, business, type CampaignKind } from "@/data/mock";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type StartMode = "now" | "scheduled";
type EventKey = "welcome" | "order_placed" | "abandoned_cart" | "delivered" | "offer_expiry" | "comeback" | "slow_product";

const eventCatalog: { key: EventKey; name: string; desc: string; defaultDelay: string; icon: any; gradient: string }[] = [
  { key: "welcome", name: "First message / QR scan", desc: "New customer says hi for the first time", defaultDelay: "Immediate", icon: UserPlus, gradient: "grad-emerald" },
  { key: "order_placed", name: "Order placed", desc: "Customer completes an order", defaultDelay: "Immediate", icon: ShoppingCart, gradient: "grad-primary" },
  { key: "abandoned_cart", name: "Cart abandoned", desc: "Items added but no order placed", defaultDelay: "1 hour", icon: ShoppingCart, gradient: "grad-orange" },
  { key: "delivered", name: "Order delivered", desc: "Merchant marks order as delivered", defaultDelay: "3 hours", icon: Star, gradient: "grad-sky" },
  { key: "offer_expiry", name: "Offer expiring soon", desc: "Customer's active offer expires in 24h", defaultDelay: "Immediate", icon: Clock, gradient: "grad-violet" },
  { key: "comeback", name: "No order in X days", desc: "Win-back trigger after inactivity", defaultDelay: "Daily check", icon: Heart, gradient: "grad-orange" },
  { key: "slow_product", name: "Slow product", desc: "Product hasn't sold in 7 days", defaultDelay: "24 hours", icon: TrendingDown, gradient: "grad-teal" },
];

interface SequenceStep { delay: string; message: string }

interface Template {
  id: string;
  name: string;
  desc: string;
  icon: any;
  gradient: string;
  kind: CampaignKind;
  message: string;
  eventKey?: EventKey;
  steps?: SequenceStep[];
  startMode?: StartMode;
}

const templates: Template[] = [
  {
    id: "tpl-blank-campaign", name: "Blank campaign", desc: "Start from scratch — write your own message and audience.",
    icon: Megaphone, gradient: "grad-primary", kind: "campaign", startMode: "now",
    message: "Hi {{customer_name}}! 👋 …",
  },
  {
    id: "tpl-launch", name: "Menu / product launch", desc: "Announce something new to all opted-in customers.",
    icon: PartyPopper, gradient: "grad-primary", kind: "campaign", startMode: "now",
    message: "Hi {{customer_name}}! 🍛 Big news — {{business_name}} just launched a new menu.\n\nFresh dishes from ₦2,500\nOrder now: nativeid.io/mamas-kitchen",
  },
  {
    id: "tpl-flash", name: "Flash promo", desc: "Limited-time offer scheduled for peak hours.",
    icon: Tag, gradient: "grad-orange", kind: "campaign", startMode: "scheduled",
    message: "⚡ Flash deal — next 2 hours only.\n15% off everything with code MAMA15.\nTap to order: nativeid.io/mamas-kitchen",
  },
  {
    id: "tpl-winback", name: "Win-back (3 steps)", desc: "Day 0 → Day 3 → Day 7 nudge for inactive customers.",
    icon: RotateCcw, gradient: "grad-violet", kind: "campaign", startMode: "now",
    message: "Hi {{customer_name}}, we miss you 💚 It's been a while since your last order at {{business_name}}.",
    steps: [
      { delay: "72", message: "Still here for you — here's 10% off your next order with code COMEBACK10." },
      { delay: "168", message: "Last nudge — code COMEBACK10 expires tonight. Order: nativeid.io/mamas-kitchen" },
    ],
  },
  {
    id: "tpl-launchseq", name: "Launch with follow-ups", desc: "Day 0 announce → Day 2 reminder → Day 5 final w/ discount.",
    icon: Megaphone, gradient: "grad-violet", kind: "campaign", startMode: "now",
    message: "Hi {{customer_name}}! New menu drops today at {{business_name}} 🎉 Be the first to try it.",
    steps: [
      { delay: "48", message: "Missed our new menu? It's the talk of the town this week." },
      { delay: "120", message: "Final call — 10% off the new menu with code MAMA10. Ends tonight." },
    ],
  },
  {
    id: "tpl-cart", name: "Abandoned cart recovery", desc: "Auto-fires 1h after a cart is left.",
    icon: ShoppingCart, gradient: "grad-orange", kind: "triggered", eventKey: "abandoned_cart",
    message: "Hi {{customer_name}} — you left items in your cart 🛒\nFinish your order in one tap: nativeid.io/mamas-kitchen",
  },
  {
    id: "tpl-orderconf", name: "Order confirmation", desc: "Sends instantly when an order is placed.",
    icon: ShoppingCart, gradient: "grad-primary", kind: "triggered", eventKey: "order_placed",
    message: "✅ Order #{{order_id}} confirmed at {{business_name}}.\nETA: 35 mins. We'll message you when it's on the way.",
  },
  {
    id: "tpl-rating", name: "Satisfaction rating", desc: "Asks for feedback 3h after delivery.",
    icon: Star, gradient: "grad-sky", kind: "triggered", eventKey: "delivered",
    message: "How was your order from {{business_name}}? Reply 1–5 ⭐ — it helps us serve you better.",
  },
  {
    id: "tpl-welcome", name: "Welcome message", desc: "Greets every new customer who messages you.",
    icon: UserPlus, gradient: "grad-emerald", kind: "triggered", eventKey: "welcome",
    message: "Welcome to {{business_name}} 👋\nReply MENU to see today's specials, or just tell us what you'd like.",
  },
];

const NewCampaign = () => {
  const nav = useNavigate();
  const [showComposer, setShowComposer] = useState(false);
  const [kind, setKind] = useState<CampaignKind>("campaign");
  const [filter, setFilter] = useState<"all" | CampaignKind>("all");

  const [name, setName] = useState("");
  const [message, setMessage] = useState("Hi {{customer_name}}! 🍛 Big news — we have a new menu at Mama's Kitchen this weekend.\n\n3 new rice dishes · Prices from ₦2,500\nOrder now: nativeid.io/mamas-kitchen");
  const [segmentId, setSegmentId] = useState("s1");
  const [stopOnOrder, setStopOnOrder] = useState(true);
  const [startMode, setStartMode] = useState<StartMode>("now");
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [eventKey, setEventKey] = useState<EventKey>("abandoned_cart");

  const reach = segments.find(s => s.id === segmentId)?.count ?? 0;
  const preview = message.replace(/\{\{customer_name\}\}/g, "Adaeze").replace(/\{\{business_name\}\}/g, business.name);
  const event = eventCatalog.find(e => e.key === eventKey)!;

  const applyTemplate = (t: Template) => {
    setKind(t.kind);
    setName(t.name === "Blank campaign" ? "" : t.name);
    setMessage(t.message);
    if (t.eventKey) setEventKey(t.eventKey);
    setSteps(t.steps ?? []);
    if (t.startMode) setStartMode(t.startMode);
    setShowComposer(true);
  };

  const startBlank = (k: CampaignKind) => {
    setKind(k);
    setName("");
    setSteps([]);
    setShowComposer(true);
  };

  const handleSend = () => {
    const verb = kind === "triggered" ? "activated" : startMode === "now" ? (steps.length ? "started" : "queued") : "scheduled";
    toast.success(`Campaign ${verb}${kind === "triggered" ? "" : ` for ${reach.toLocaleString()} contacts`}`);
    nav("/campaigns");
  };

  const visibleTemplates = templates.filter(t => filter === "all" || t.kind === filter);

  // STEP 1 — Templates first. The choice is: pick a recipe OR start blank.
  if (!showComposer) {
    return (
      <AppLayout>
        <PageHeader
          title="New campaign"
          subtitle="Pick a template to start fast — or start blank. Every campaign can have follow-ups; triggered ones fire on events."
          actions={<Button variant="outline" asChild className="rounded-xl"><Link to="/campaigns"><ArrowLeft className="h-4 w-4 mr-1.5" />Cancel</Link></Button>}
        />

        {/* Quick start blank */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-5xl">
          <button onClick={() => startBlank("campaign")} className="text-left p-5 rounded-2xl border border-dashed border-border bg-card hover:border-primary hover:shadow-[var(--shadow-md)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl grad-primary text-white flex items-center justify-center"><Send className="h-4 w-4" /></div>
              <div className="font-display font-bold">Blank campaign</div>
            </div>
            <p className="text-xs text-muted-foreground">Send a message manually — now or scheduled. Add follow-up messages if you want a sequence.</p>
          </button>
          <button onClick={() => startBlank("triggered")} className="text-left p-5 rounded-2xl border border-dashed border-border bg-card hover:border-primary hover:shadow-[var(--shadow-md)] transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl grad-orange text-white flex items-center justify-center"><Zap className="h-4 w-4" /></div>
              <div className="font-display font-bold">Blank triggered</div>
            </div>
            <p className="text-xs text-muted-foreground">Fires automatically on an event — order placed, cart abandoned, delivered. Always on.</p>
          </button>
        </div>

        {/* Templates header + filter */}
        <div className="flex items-end justify-between mb-3 max-w-5xl">
          <div>
            <h3 className="font-display font-bold text-lg">Start from a template</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Proven recipes — pre-fills the message, follow-ups, and trigger. Edit anything before sending.</p>
          </div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            {(["all", "campaign", "triggered"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl">
          {visibleTemplates.filter(t => t.id !== "tpl-blank-campaign").map(t => {
            const Icon = t.icon;
            const kindBadge = t.kind === "triggered" ? "Triggered" : (t.steps?.length ? `Campaign · ${t.steps.length + 1} steps` : "Campaign");
            return (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className="text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${t.gradient} text-white flex items-center justify-center`}><Icon className="h-4 w-4" /></div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{kindBadge}</span>
                </div>
                <div className="font-semibold text-sm leading-snug">{t.name}</div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{t.desc}</p>
                <div className="text-[11px] text-primary font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Use template →</div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground max-w-5xl">
          <ShieldCheck className="h-4 w-4 text-success" />
          All campaigns respect the 2-per-24h cap and STOP replies.
        </div>
      </AppLayout>
    );
  }

  // STEP 2 — One unified composer.
  const k = kind;
  const kindLabel = k === "triggered" ? "triggered campaign" : "campaign";

  return (
    <AppLayout>
      <PageHeader
        title={`New ${kindLabel}`}
        subtitle="Compose, target, and confirm. Sent only to opted-in contacts."
        actions={
          <>
            <Button variant="outline" onClick={() => setShowComposer(false)} className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1.5" />Back to templates</Button>
            <Button variant="outline" className="rounded-xl">Save draft</Button>
            <Button onClick={handleSend} className="rounded-xl grad-primary text-primary-foreground border-0">
              <Send className="h-4 w-4 mr-1.5" />
              {k === "triggered" ? "Activate" : startMode === "now" ? (steps.length ? "Start campaign" : "Send now") : "Schedule"}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Name */}
          <section className="surface-card p-6">
            <Label className="text-xs">Campaign name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekend menu launch" className="mt-1 rounded-xl" />
            <p className="text-[11px] text-muted-foreground mt-1.5">Internal name — your customers never see this.</p>
          </section>

          {/* Start condition */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              {k === "triggered" ? <Zap className="h-4 w-4 text-primary" /> : <Calendar className="h-4 w-4 text-primary" />}
              {k === "triggered" ? "Trigger event" : "When does it start?"}
            </h3>

            {k !== "triggered" && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => setStartMode("now")}
                  className={`p-3 rounded-xl border text-left transition-all ${startMode === "now" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <div className="font-semibold text-sm">Send now</div>
                  <div className="text-[11px] text-muted-foreground">Goes out within seconds of confirming</div>
                </button>
                <button onClick={() => setStartMode("scheduled")}
                  className={`p-3 rounded-xl border text-left transition-all ${startMode === "scheduled" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <div className="font-semibold text-sm">Schedule for later</div>
                  <div className="text-[11px] text-muted-foreground">Pick a date and time</div>
                </button>
              </div>
            )}

            {k !== "triggered" && startMode === "scheduled" && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Input type="date" className="rounded-xl" defaultValue="2026-04-25" />
                <Input type="time" className="rounded-xl" defaultValue="10:00" />
              </div>
            )}

            {k === "triggered" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eventCatalog.map(e => {
                  const Icon = e.icon;
                  const active = eventKey === e.key;
                  return (
                    <button key={e.key} onClick={() => setEventKey(e.key)}
                      className={`p-3 rounded-xl border text-left transition-all flex gap-3 ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className={`h-9 w-9 rounded-lg ${e.gradient} text-white flex items-center justify-center shrink-0`}><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{e.name}</div>
                        <div className="text-[11px] text-muted-foreground">{e.desc} · {e.defaultDelay}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Audience */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Audience</h3>
            {k === "triggered" ? (
              <div className="rounded-xl bg-accent p-4 text-sm">
                <div className="font-semibold">Auto-defined by the trigger</div>
                <div className="text-xs text-muted-foreground mt-1">Anyone who matches the event "{event.name}" — and is opted in.</div>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Segment</Label>
                    <Select value={segmentId} onValueChange={setSegmentId}>
                      <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {segments.map(s => <SelectItem key={s.id} value={s.id}>{s.name} · {s.count.toLocaleString()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Filters</Label>
                    <Input className="mt-1 rounded-xl" placeholder="+ Add filter (location, tag, last order…)" />
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-accent p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Estimated reach: <span className="tabular-nums">{reach.toLocaleString()}</span> contacts</div>
                    <div className="text-[11px] text-muted-foreground">All recipients are opted-in. {business.totalCustomers - business.optedInContacts} contacts excluded (no opt-in).</div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Message */}
          <section className="surface-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {steps.length > 0 ? "First message (Day 0)" : "Message"}</h3>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="rounded-xl text-sm leading-relaxed" maxLength={1024} />
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1.5">
                {["{{customer_name}}", "{{business_name}}", "{{order_id}}", "{{offer_code}}"].map(v => (
                  <button key={v} onClick={() => setMessage(m => m + " " + v)} className="text-[11px] px-2 py-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/70 font-mono">{v}</button>
                ))}
                <Button variant="outline" size="sm" className="rounded-lg h-7 ml-2"><ImageIcon className="h-3.5 w-3.5 mr-1" />Add media</Button>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">{message.length} / 1024</span>
            </div>
          </section>

          {/* Follow-ups — available on every kind. Optional for everyone. */}
          <section className="surface-card p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Follow-ups <span className="text-[11px] font-normal text-muted-foreground">(optional)</span></h3>
                <p className="text-xs text-muted-foreground mt-0.5">Add nudges for contacts who haven't acted yet. Leave empty to send just one message.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSteps([...steps, { delay: "72", message: "" }])} className="rounded-lg"><Plus className="h-3.5 w-3.5 mr-1" />Add follow-up</Button>
            </div>

            {steps.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No follow-ups. This {k === "triggered" ? "trigger" : "campaign"} sends one message and stops.
              </div>
            )}

            <div className="space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full grad-violet text-white flex items-center justify-center text-[11px] font-bold">{i + 2}</span>
                      <span className="text-sm font-semibold">Follow-up {i + 1}</span>
                      <Select value={s.delay} onValueChange={v => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, delay: v } : x))}>
                        <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">After 24 hours</SelectItem>
                          <SelectItem value="48">After 48 hours</SelectItem>
                          <SelectItem value="72">After 72 hours</SelectItem>
                          <SelectItem value="120">After 5 days</SelectItem>
                          <SelectItem value="168">After 7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setSteps(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <Textarea rows={2} className="rounded-lg text-sm" value={s.message} onChange={e => setSteps(prev => prev.map((x, idx) => idx === i ? { ...x, message: e.target.value } : x))} placeholder="Write the follow-up message…" />
                </div>
              ))}
            </div>

            {steps.length > 0 && (
              <label className="flex items-center gap-2 text-sm mt-4">
                <Switch checked={stopOnOrder} onCheckedChange={setStopOnOrder} />
                Stop all follow-ups as soon as the contact places an order
              </label>
            )}
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold flex items-center gap-2"><Eye className="h-4 w-4" /> Live preview</h3>
              <span className="text-[10px] text-muted-foreground">As recipient</span>
            </div>
            <div className="rounded-2xl bg-[#E5DDD5] p-3 min-h-[280px] flex flex-col gap-2">
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[88%] shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-success mb-1">
                  <ShieldCheck className="h-3 w-3" /> {business.name} · Verified business
                </div>
                <p className="text-[13px] whitespace-pre-wrap text-gray-800 leading-snug">{preview}</p>
                <div className="text-[10px] text-gray-400 text-right mt-1">10:00 ✓✓</div>
              </div>
              {steps.length > 0 && (
                <div className="text-[10px] text-center text-gray-500 bg-white/40 rounded-full py-1 my-1">+{steps[0].delay}h follow-up if no order</div>
              )}
              {k === "triggered" && (
                <div className="text-[10px] text-center text-gray-500 bg-white/40 rounded-full py-1 my-1">⚡ Fires on: {event.name}</div>
              )}
            </div>
          </section>

          <section className="surface-card p-5">
            <h3 className="font-display font-bold flex items-center gap-2 mb-3"><Info className="h-4 w-4 text-info" /> Guardrails</h3>
            <ul className="space-y-2.5 text-xs">
              <Guard ok title="Opt-in required" desc="Only sending to contacts who consented at checkout." />
              <Guard ok title="2 per 24h cap" desc="Across all campaigns and triggers — protects sender quality." />
              <Guard ok title="STOP honoured instantly" desc="Anyone who replies STOP is removed from all automations." />
              <Guard title="Template approval" desc="Promotional templates auto-submitted to WhatsApp on send." />
            </ul>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

function Guard({ title, desc, ok }: { title: string; desc: string; ok?: boolean }) {
  return (
    <li className="flex gap-2.5">
      <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
        {ok ? "✓" : "!"}
      </div>
      <div>
        <div className="font-semibold text-[12px]">{title}</div>
        <div className="text-muted-foreground text-[11px]">{desc}</div>
      </div>
    </li>
  );
}

export default NewCampaign;
