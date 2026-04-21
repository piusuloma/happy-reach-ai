import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Image as ImageIcon, Sparkles, Send, Calendar, Users, Eye, Info, GitBranch, Zap, ArrowLeft, ArrowRight, Plus, Trash2, ShoppingCart, Star, UserPlus, Heart, Clock, TrendingDown, Megaphone, PartyPopper, Tag, RotateCcw, FileText } from "lucide-react";
import { useState } from "react";
import { segments, business, type CampaignKind } from "@/data/mock";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type StartMode = "now" | "scheduled" | "event";
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

const NewCampaign = () => {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [kind, setKind] = useState<CampaignKind | null>(null);

  // shared
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Hi {{customer_name}}! 🍛 Big news — we have a new menu at Mama's Kitchen this weekend.\n\n3 new rice dishes · Prices from ₦2,500\nOrder now: nativeid.io/mamas-kitchen");
  const [segmentId, setSegmentId] = useState("s1");
  const [stopOnOrder, setStopOnOrder] = useState(true);

  // one-time / sequence
  const [startMode, setStartMode] = useState<StartMode>("now");

  // sequence
  const [steps, setSteps] = useState<SequenceStep[]>([
    { delay: "48", message: "Missed our new menu? Order before Sunday and get 10% off with code MAMA10." },
    { delay: "120", message: "Last call — the launch promo ends tonight. Tap to order: nativeid.io/mamas-kitchen" },
  ]);

  // triggered
  const [eventKey, setEventKey] = useState<EventKey>("abandoned_cart");

  const reach = segments.find(s => s.id === segmentId)?.count ?? 0;
  const preview = message.replace(/\{\{customer_name\}\}/g, "Adaeze").replace(/\{\{business_name\}\}/g, business.name);
  const event = eventCatalog.find(e => e.key === eventKey)!;

  const handleSend = () => {
    const verb = kind === "triggered" ? "activated" : kind === "sequence" ? "scheduled" : startMode === "now" ? "queued" : "scheduled";
    toast.success(`Campaign ${verb}${kind === "triggered" ? "" : ` for ${reach.toLocaleString()} contacts`}`);
    nav("/campaigns");
  };

  // STEP 1 — Pick the kind. This sets the mental frame before anything else.
  if (step === 1) {
    return (
      <AppLayout>
        <PageHeader
          title="What are you sending?"
          subtitle="Pick how this campaign starts. Everything else — message, audience, follow-ups — works the same way."
          actions={<Button variant="outline" asChild className="rounded-xl"><Link to="/campaigns"><ArrowLeft className="h-4 w-4 mr-1.5" />Cancel</Link></Button>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
          <KindCard
            kind="one-time" current={kind} setKind={setKind}
            icon={Send} gradient="grad-primary"
            title="One-time campaign"
            desc="Send a single message — now or scheduled. Best for promotions, launches, announcements."
            example="🍛 New menu this weekend — order now"
          />
          <KindCard
            kind="sequence" current={kind} setKind={setKind}
            icon={GitBranch} gradient="grad-violet"
            title="Sequence"
            desc="Send a first message then auto follow-ups. Stops as soon as the contact converts."
            example="Day 0 → Day 2 → Day 5 with discount"
          />
          <KindCard
            kind="triggered" current={kind} setKind={setKind}
            icon={Zap} gradient="grad-orange"
            title="Triggered"
            desc="Fires on an event — order placed, cart abandoned, delivered. Always on, no scheduling."
            example="On cart abandoned (1h) → reminder"
          />
        </div>

        <div className="mt-8 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            All kinds respect the 2-per-24h cap and STOP replies.
          </div>
          <Button onClick={() => setStep(2)} disabled={!kind} className="rounded-xl grad-primary text-primary-foreground border-0">
            Continue <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </AppLayout>
    );
  }

  // STEP 2 — One unified composer, configured by kind.
  const k = kind!;
  const kindLabel = k === "one-time" ? "one-time campaign" : k === "sequence" ? "sequence" : "triggered campaign";

  return (
    <AppLayout>
      <PageHeader
        title={`New ${kindLabel}`}
        subtitle="Compose, target, and confirm. Sent only to opted-in contacts."
        actions={
          <>
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
            <Button variant="outline" className="rounded-xl">Save draft</Button>
            <Button onClick={handleSend} className="rounded-xl grad-primary text-primary-foreground border-0">
              <Send className="h-4 w-4 mr-1.5" />
              {k === "triggered" ? "Activate" : k === "sequence" ? "Start sequence" : startMode === "now" ? "Send now" : "Schedule"}
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

          {/* Start condition — different per kind, same section */}
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
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {k === "sequence" ? "First message (Day 0)" : "Message"}</h3>
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

          {/* Follow-ups (sequence + one-time both support — sequence requires) */}
          {(k === "sequence" || k === "one-time") && (
            <section className="surface-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-lg flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> Follow-ups</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Each step only sends to contacts who haven't taken the desired action yet.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSteps([...steps, { delay: "72", message: "" }])} className="rounded-lg"><Plus className="h-3.5 w-3.5 mr-1" />Add step</Button>
              </div>

              {steps.length === 0 && k === "one-time" && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No follow-ups. This campaign sends once and stops.
                </div>
              )}

              <div className="space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full grad-violet text-white flex items-center justify-center text-[11px] font-bold">{i + 2}</span>
                        <span className="text-sm font-semibold">Step {i + 2}</span>
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

              <label className="flex items-center gap-2 text-sm mt-4">
                <Switch checked={stopOnOrder} onCheckedChange={setStopOnOrder} />
                Stop all follow-ups as soon as the contact places an order
              </label>
            </section>
          )}
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
              {k === "sequence" && steps.length > 0 && (
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

function KindCard({ kind, current, setKind, icon: Icon, gradient, title, desc, example }: any) {
  const active = current === kind;
  return (
    <button onClick={() => setKind(kind)}
      className={`text-left p-6 rounded-2xl border-2 transition-all ${active ? "border-primary bg-primary/5 shadow-[var(--shadow-md)] -translate-y-0.5" : "border-border bg-card hover:border-primary/30"}`}>
      <div className={`h-12 w-12 rounded-xl ${gradient} text-white flex items-center justify-center mb-4`}><Icon className="h-5 w-5" /></div>
      <h3 className="font-display font-bold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 leading-relaxed">{desc}</p>
      <div className="text-[11px] font-mono bg-accent text-accent-foreground rounded-lg px-2.5 py-1.5 inline-block">{example}</div>
    </button>
  );
}

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
