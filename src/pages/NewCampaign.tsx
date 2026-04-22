import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { business, segments } from "@/data/mock";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────────────── */
// Audiences come from the single source of truth in mock.ts (same as Contacts page segments).
// Order here controls display order in the wizard — put most-used first.
const AUDIENCE_ORDER = ["s1", "s3", "s2", "s6", "s5", "s4"];
const AUDIENCES = AUDIENCE_ORDER.map(id => segments.find(s => s.id === id)!).filter(Boolean);

const TRIGGERS = [
  { id: "order_placed",   emoji: "📦", label: "Someone places an order",              desc: "Send a confirmation right away",       when: "Right away",    defaultMsg: "✅ Order confirmed at {{business_name}}! We'll have it ready in 35 mins." },
  { id: "abandoned_cart", emoji: "🛒", label: "Someone leaves their cart",            desc: "Remind them 1 hour later",             when: "After 1 hour",  defaultMsg: "Hi {{customer_name}} — you left something in your cart! Tap to finish your order 👇" },
  { id: "delivered",      emoji: "⭐", label: "An order is delivered",                desc: "Ask for a rating 3 hours later",       when: "After 3 hours", defaultMsg: "How was your order from {{business_name}}? Reply 1–5 to rate us ⭐" },
  { id: "welcome",        emoji: "👋", label: "A new customer messages me",           desc: "Welcome them straight away",           when: "Right away",    defaultMsg: "Welcome to {{business_name}} 👋 Reply MENU to see what we have today!" },
  { id: "offer_expiry",   emoji: "⏰", label: "An offer is about to expire",          desc: "Remind them before it's gone",         when: "24 hrs before", defaultMsg: "⏰ Don't miss out! Your offer at {{business_name}} expires tomorrow." },
  { id: "comeback",       emoji: "💚", label: "A customer hasn't ordered in a while", desc: "Win them back with a nudge",           when: "Daily check",   defaultMsg: "Hi {{customer_name}}, we miss you! Come back and get 10% off your next order 🎉" },
];

const TRIGGER_DELAYS = [
  { id: "immediate", emoji: "⚡", label: "Right away",      desc: "Best for order confirmations and welcomes" },
  { id: "1h",        emoji: "🕐", label: "After 1 hour",   desc: "Best for cart recovery — gives them time but not too long" },
  { id: "3h",        emoji: "🕒", label: "After 3 hours",  desc: "Best for post-delivery feedback" },
  { id: "24h",       emoji: "🕛", label: "After 24 hours", desc: "Best for daily win-back checks" },
];

// Industry-recommended follow-up windows for WhatsApp marketing.
// Day 2 → Day 5 → Day 10 is the proven sweet spot:
// close enough to stay relevant, far enough not to feel spammy.
const FOLLOWUP_DELAYS = [
  { id: "2",  label: "2 days later",  recommended: true  },
  { id: "3",  label: "3 days later",  recommended: false },
  { id: "5",  label: "5 days later",  recommended: true  },
  { id: "7",  label: "7 days later",  recommended: false },
  { id: "10", label: "10 days later", recommended: true  },
  { id: "14", label: "14 days later", recommended: false },
];

// Pre-filled follow-up templates per context.
// Index = which follow-up (0 = first, 1 = second, 2 = third).
const CAMPAIGN_FOLLOWUPS: Record<string, { delay: string; message: string }[]> = {
  s1: [ // Everyone
    { delay: "2",  message: "Hi {{customer_name}} 👋 Just a quick reminder — our offer at {{business_name}} is still open. Have you had a chance to check it out?" },
    { delay: "5",  message: "{{customer_name}}, this is your last reminder 🔔 We'd hate for you to miss out. Reply now or visit us to grab this before it's gone." },
    { delay: "10", message: "Final message from us 💚 We'll leave you be after this — but we'd love to see you again at {{business_name}}. Here's 10% off if you come back." },
  ],
  s3: [ // Recent buyers
    { delay: "2",  message: "Hey {{customer_name}}! Loved having you recently 🙌 Just wanted to make sure you saw our latest offer — we think you'll love it." },
    { delay: "5",  message: "{{customer_name}}, still thinking it over? Your spot is waiting at {{business_name}} 😊 Reply YES and we'll sort you out right away." },
    { delay: "10", message: "One last nudge! 🎉 We appreciate your loyalty — here's something special just for coming back. Reply to claim it." },
  ],
  s2: [ // Best customers (3+ orders)
    { delay: "2",  message: "Hi {{customer_name}} — as one of our regulars, we wanted to make sure you saw this first 🙏 Don't miss out, it's going fast." },
    { delay: "5",  message: "{{customer_name}}, you've always been a great customer 💚 We saved something for you — just reply and we'll take care of the rest." },
    { delay: "10", message: "Last call, {{customer_name}} 🔔 We rarely do this, but here's an exclusive extra 10% just for loyal customers like you. Valid this week only." },
  ],
  s6: [ // Customers I miss (60d+ dormant)
    { delay: "3",  message: "Hi {{customer_name}}, it's been a while and we genuinely miss you 💚 A lot has changed at {{business_name}} — come see what's new!" },
    { delay: "7",  message: "{{customer_name}}, we know life gets busy 😊 We'd love to welcome you back. Reply YES and we'll hold something aside for you." },
    { delay: "14", message: "Last one from us, {{customer_name}} 🙏 We'll stop after this. But if you ever want to come back, {{business_name}} will be here for you." },
  ],
  s5: [ // Almost lost (21–60d)
    { delay: "2",  message: "Hey {{customer_name}} 👋 We noticed it's been a little while — we'd love to see you back at {{business_name}}. Anything we can help with?" },
    { delay: "5",  message: "{{customer_name}}, we've missed having you! 🙌 Here's a little something to make coming back worth your while — just reply to claim it." },
    { delay: "10", message: "Final message, {{customer_name}} 💬 We're here whenever you're ready. Reply anytime and we'll take care of you at {{business_name}}." },
  ],
  s4: [ // VIP only
    { delay: "2",  message: "Hi {{customer_name}} 👑 As a VIP customer, you get first access. We just wanted to make sure this didn't slip past you — reply to secure yours." },
    { delay: "5",  message: "{{customer_name}}, this one's just for our top customers 💎 We've reserved something exclusive. Don't let it go to someone else!" },
    { delay: "10", message: "Final VIP reminder, {{customer_name}} ✨ We'll close this after today. Reply now and we'll make it worth the wait — promise." },
  ],
};

const TRIGGER_FOLLOWUPS: Record<string, { delay: string; message: string }[]> = {
  abandoned_cart: [
    { delay: "2",  message: "Hi {{customer_name}} 👋 Still thinking it over? Your items are still in your cart at {{business_name}} — tap to complete your order before they sell out." },
    { delay: "5",  message: "Last chance, {{customer_name}} 🛒 Your cart is about to expire. Complete your order now and we'll throw in a little extra for you." },
  ],
  order_placed: [
    { delay: "3",  message: "Hi {{customer_name}} 😊 Hope you enjoyed your order! We'd love to have you back — reply MENU to see what's fresh this week at {{business_name}}." },
    { delay: "7",  message: "{{customer_name}}, it's been a week! 🍽 Ready for another order? Reply and we'll make it quick and easy for you." },
  ],
  delivered: [
    { delay: "3",  message: "Hi {{customer_name}} — did you get a chance to rate your order? 🌟 Your feedback really helps us improve. Just reply 1–5 when you're ready." },
    { delay: "7",  message: "Hey {{customer_name}} 👋 Just checking in! Ready for your next order at {{business_name}}? Reply MENU and we'll get started." },
  ],
  welcome: [
    { delay: "2",  message: "Hi {{customer_name}}! 🌟 Did you get a chance to check our menu? Reply MENU anytime and we'll show you what's available at {{business_name}} today." },
    { delay: "5",  message: "{{customer_name}}, first order is always special 🎉 We'd love to serve you. Reply ORDER and we'll guide you through it step by step." },
  ],
  offer_expiry: [
    { delay: "2",  message: "{{customer_name}}, your offer at {{business_name}} is about to expire! ⏰ Don't lose it — tap here to use it before it's gone." },
  ],
  comeback: [
    { delay: "5",  message: "Hey {{customer_name}} 💚 Still here for you at {{business_name}}! Here's 15% off your next order — just reply YES to claim it." },
    { delay: "10", message: "Final message from us, {{customer_name}} 🙏 We hope to see you again soon. Your exclusive 15% off expires today." },
  ],
};

const VARS = [
  { token: "{{customer_name}}", label: "Customer name" },
  { token: "{{business_name}}", label: "Business name" },
  { token: "{{order_id}}",      label: "Order number" },
];

/* ─── Types ──────────────────────────────────────────────────── */
type Mode     = "campaign" | "trigger" | null;
type WhenOpt  = "now" | "later";
interface FollowUp { delay: string; message: string; }

/* ─── Shared UI pieces ───────────────────────────────────────── */
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
            ${i + 1 < current  ? "bg-primary text-primary-foreground" :
              i + 1 === current ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                                  "bg-muted text-muted-foreground"}`}>
            {i + 1 < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 rounded-full transition-colors ${i + 1 < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Step {current} of {total}</span>
    </div>
  );
}

function OptionCard({ emoji, label, desc, sub, selected, onClick }: {
  emoji: string; label: string; desc: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4
        ${selected
          ? "border-primary bg-primary/5 shadow-[var(--shadow-md)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"}`}>
      <span className="text-3xl shrink-0 leading-none mt-0.5">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
        {sub && <div className="text-[11px] font-semibold text-primary mt-1">{sub}</div>}
      </div>
      {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
    </button>
  );
}

function Nav({ onBack, onNext, nextLabel = "Continue", nextDisabled = false }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      )}
      <Button type="button" onClick={onNext} disabled={nextDisabled}
        className="rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] gap-2 ml-auto">
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl shrink-0 leading-none mt-0.5">{icon}</span>
      <div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
        <div className="text-sm font-semibold mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function Guard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" /> {label}
    </div>
  );
}

/* ─── Wizard ─────────────────────────────────────────────────── */
const TOTAL_STEPS = 6;

const NewCampaign = () => {
  const nav = useNavigate();

  const [step,         setStep]         = useState(1);
  const [mode,         setMode]         = useState<Mode>(null);
  const [audienceId,   setAudienceId]   = useState<string | null>(null);
  const [triggerId,    setTriggerId]    = useState<string | null>(null);
  const [message,      setMessage]      = useState("");
  const [followUps,    setFollowUps]    = useState<FollowUp[]>([]);
  const [when,         setWhen]         = useState<WhenOpt>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [triggerDelay, setTriggerDelay] = useState("immediate");
  const [campaignName, setCampaignName] = useState("");

  const selectedAudience = segments.find(a => a.id === audienceId);
  const selectedTrigger  = TRIGGERS.find(t => t.id === triggerId);

  const pickAudience = (id: string) => {
    setAudienceId(id);
    if (!message) setMessage(`Hi {{customer_name}}! 👋 We have something special for you at ${business.name} this week.`);
  };

  const pickTrigger = (id: string) => {
    setTriggerId(id);
    const t = TRIGGERS.find(x => x.id === id);
    if (t && !message) setMessage(t.defaultMsg);
  };

  const addFollowUp = () => {
    if (followUps.length >= 3) return;
    const idx = followUps.length;
    const pool = mode === "campaign"
      ? (CAMPAIGN_FOLLOWUPS[audienceId ?? "s1"] ?? CAMPAIGN_FOLLOWUPS["s1"])
      : (TRIGGER_FOLLOWUPS[triggerId ?? ""] ?? []);
    const prefill = pool[idx] ?? { delay: FOLLOWUP_DELAYS[Math.min(idx * 2, FOLLOWUP_DELAYS.length - 1)].id, message: "" };
    setFollowUps(f => [...f, prefill]);
  };
  const removeFollowUp = (i: number) => setFollowUps(f => f.filter((_, idx) => idx !== i));
  const updateFollowUp = (i: number, patch: Partial<FollowUp>) =>
    setFollowUps(f => f.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const resolve = (txt: string) => txt
    .replace(/\{\{customer_name\}\}/g, "Adaeze")
    .replace(/\{\{business_name\}\}/g, business.name)
    .replace(/\{\{order_id\}\}/g, "#4821");

  const handleLaunch = () => {
    const verb = mode === "trigger" ? "activated" : when === "now" ? "sent" : "scheduled";
    toast.success(`🎉 Your message has been ${verb}!`);
    nav("/campaigns");
  };

  /* ════════════════════════════════════════════
     STEP 1 — What do you want to do?
  ════════════════════════════════════════════ */
  if (step === 1) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
        </Link>
        <StepBar current={1} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">What do you want to do?</h1>
        <p className="text-muted-foreground text-sm mb-6">Pick one — you can always change it later.</p>
        <div className="space-y-3">
          <OptionCard emoji="📢" label="Send a message to my customers"
            desc="You write the message, choose who gets it, and decide when. Great for announcements, offers, and promotions."
            selected={mode === "campaign"} onClick={() => setMode("campaign")} />
          <OptionCard emoji="⚡" label="Set up an automatic message"
            desc="The message sends itself whenever something happens — like when a customer orders or leaves their cart. Set it once and it runs forever."
            selected={mode === "trigger"} onClick={() => setMode("trigger")} />
        </div>
        <Nav onNext={() => setStep(2)} nextDisabled={!mode} nextLabel="Next" />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 2a (Campaign) — Who gets it?
  ════════════════════════════════════════════ */
  if (step === 2 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={2} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">Who should get the message?</h1>
        <p className="text-muted-foreground text-sm mb-6">You can only message customers who agreed to hear from you.</p>
        <div className="space-y-3">
          {AUDIENCES.map(a => (
            <OptionCard key={a.id} emoji={a.emoji} label={a.name} desc={a.desc}
              sub={`${a.count.toLocaleString()} customers`}
              selected={audienceId === a.id} onClick={() => pickAudience(a.id)} />
          ))}
        </div>
        <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!audienceId} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 2b (Trigger) — When does it fire?
  ════════════════════════════════════════════ */
  if (step === 2 && mode === "trigger") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={2} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">When should it send?</h1>
        <p className="text-muted-foreground text-sm mb-6">Pick the moment that should trigger your message.</p>
        <div className="space-y-3">
          {TRIGGERS.map(t => (
            <OptionCard key={t.id} emoji={t.emoji} label={t.label} desc={t.desc}
              sub={`Sends: ${t.when}`}
              selected={triggerId === t.id} onClick={() => pickTrigger(t.id)} />
          ))}
        </div>
        <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!triggerId} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 3 — Write your message
  ════════════════════════════════════════════ */
  if (step === 3) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4">
        <StepBar current={3} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">Write your message</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Keep it short and friendly. We've filled in a starting point — just edit it to sound like you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <Textarea value={message} onChange={e => setMessage(e.target.value)}
              rows={8} maxLength={1024} placeholder="Type your message here…"
              className="rounded-xl text-sm leading-relaxed resize-none" />
            <span className="text-[11px] text-muted-foreground mt-1.5 block">{message.length} / 1024</span>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                Tap to personalise — we fill these in for each customer automatically:
              </p>
              <div className="flex flex-wrap gap-2">
                {VARS.map(v => (
                  <button type="button" key={v.token}
                    onClick={() => setMessage(m => m + v.token)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary font-medium transition-colors">
                    + {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Preview — how it looks to a customer
            </p>
            <div className="rounded-2xl bg-[#E5DDD5] p-4 min-h-[200px]">
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mb-1.5">
                  <ShieldCheck className="h-3 w-3" /> {business.name} · Verified
                </div>
                <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap">
                  {resolve(message) || "Your message will appear here…"}
                </p>
                <div className="text-[10px] text-gray-400 text-right mt-2">10:00 ✓✓</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Your customers see your verified business name above every message.
            </p>
          </div>
        </div>

        <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={message.trim().length < 5} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 4 — Follow-up messages
  ════════════════════════════════════════════ */
  if (step === 4) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={4} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">Want to add follow-ups?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Follow-ups are extra messages that send automatically to customers who didn't respond to your first message.
          You can add up to 3. <span className="text-primary font-medium">This step is optional</span> — tap Continue to skip.
        </p>

        {/* Existing follow-ups */}
        <div className="space-y-4 mb-4">
          {/* First message — read-only summary */}
          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground font-medium mb-1">First message · sends {mode === "trigger" ? "on event" : when === "now" ? "right away" : "at scheduled time"}</div>
              <p className="text-sm text-foreground/80 line-clamp-2 whitespace-pre-wrap">{resolve(message)}</p>
            </div>
          </div>

          {/* Follow-up cards */}
          {followUps.map((fu, i) => (
            <div key={i} className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                    {i + 2}
                  </span>
                  <span className="text-sm font-semibold">Follow-up {i + 1}</span>
                </div>
                <button type="button" title="Remove follow-up" onClick={() => removeFollowUp(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-2">Send this…</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {FOLLOWUP_DELAYS.map(d => (
                  <button type="button" key={d.id} onClick={() => updateFollowUp(i, { delay: d.id })}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors inline-flex items-center gap-1 ${
                      fu.delay === d.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {d.label}
                    {d.recommended && fu.delay !== d.id && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">✓ recommended</span>
                    )}
                  </button>
                ))}
              </div>

              <Textarea value={fu.message} onChange={e => updateFollowUp(i, { message: e.target.value })}
                rows={3} maxLength={1024} placeholder="Write your follow-up here…"
                className="rounded-xl text-sm leading-relaxed resize-none" />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Only sent to customers who haven't responded to the previous message.
              </p>
            </div>
          ))}
        </div>

        {/* Add follow-up button */}
        {followUps.length < 3 && (
          <button type="button" onClick={addFollowUp}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-all flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium">
            <Plus className="h-4 w-4" /> Add a follow-up message
          </button>
        )}

        <Nav onBack={() => setStep(3)} onNext={() => setStep(5)}
          nextLabel={followUps.length > 0 ? "Continue" : "Skip — no follow-ups"} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 5a (Campaign) — When to send
  ════════════════════════════════════════════ */
  if (step === 5 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={5} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">When do you want to send it?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your message will go to <b>{selectedAudience?.count.toLocaleString()}</b> customers.
        </p>

        <div className="space-y-3 mb-6">
          <OptionCard emoji="🚀" label="Send it now" desc="Your message goes out within seconds."
            selected={when === "now"} onClick={() => setWhen("now")} />
          <OptionCard emoji="🗓" label="Schedule for later"
            desc="Pick a day and time — perfect for morning announcements or lunch promos."
            selected={when === "later"} onClick={() => setWhen("later")} />
        </div>

        {when === "later" && (
          <div className="surface-card p-5 space-y-4 mb-5">
            <div>
              <label className="text-sm font-medium block mb-1.5">What date?</label>
              <Input type="date" className="rounded-xl" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">What time?</label>
              <Input type="time" className="rounded-xl" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1.5">
            Give this a name <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input value={campaignName} onChange={e => setCampaignName(e.target.value)}
            placeholder="e.g. Weekend promo, Lunch offer…" className="rounded-xl" />
          <p className="text-[11px] text-muted-foreground mt-1">Only you see this — just to help you find it later.</p>
        </div>

        <Nav onBack={() => setStep(4)} onNext={() => setStep(6)}
          nextDisabled={when === "later" && (!scheduleDate || !scheduleTime)} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 5b (Trigger) — Delay after event
  ════════════════════════════════════════════ */
  if (step === 5 && mode === "trigger") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={5} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">How long after it happens?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Choose when the first message should arrive after <b>{selectedTrigger?.label.toLowerCase()}</b>.
        </p>
        <div className="space-y-3">
          {TRIGGER_DELAYS.map(d => (
            <OptionCard key={d.id} emoji={d.emoji} label={d.label} desc={d.desc}
              selected={triggerDelay === d.id} onClick={() => setTriggerDelay(d.id)} />
          ))}
        </div>
        <Nav onBack={() => setStep(4)} onNext={() => setStep(6)} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 6 — Review & launch
  ════════════════════════════════════════════ */
  if (step === 6) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={6} total={TOTAL_STEPS} />
        <h1 className="font-display text-2xl font-bold mb-1">Ready to go! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-6">Check everything below, then hit launch.</p>

        {/* Summary */}
        <div className="surface-card p-5 mb-5 space-y-4">
          <SummaryRow icon={mode === "campaign" ? "📢" : "⚡"} label="Type"
            value={mode === "campaign" ? "Send to customers" : "Automatic message"} />
          {mode === "campaign" && selectedAudience && (
            <SummaryRow icon={selectedAudience.emoji} label="Who gets it"
              value={`${selectedAudience.name} — ${selectedAudience.count.toLocaleString()} customers`} />
          )}
          {mode === "trigger" && selectedTrigger && (
            <SummaryRow icon={selectedTrigger.emoji} label="Fires when" value={selectedTrigger.label} />
          )}
          {mode === "campaign" && (
            <SummaryRow icon={when === "now" ? "🚀" : "🗓"} label="Sends"
              value={when === "now" ? "Right now" : `${scheduleDate} at ${scheduleTime}`} />
          )}
          {mode === "trigger" && (
            <SummaryRow icon="⏱" label="Delay"
              value={TRIGGER_DELAYS.find(d => d.id === triggerDelay)?.label ?? triggerDelay} />
          )}
          {followUps.length > 0 && (
            <SummaryRow icon="💬" label="Follow-ups"
              value={`${followUps.length} follow-up${followUps.length > 1 ? "s" : ""} — only if no response`} />
          )}
          {campaignName && <SummaryRow icon="🏷" label="Name" value={campaignName} />}
        </div>

        {/* Full message thread preview */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message thread</p>
          <div className="rounded-2xl bg-[#E5DDD5] p-4 space-y-3">
            <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mb-1.5">
                <ShieldCheck className="h-3 w-3" /> {business.name} · Verified
              </div>
              <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap">{resolve(message)}</p>
              <div className="text-[10px] text-gray-400 text-right mt-2">10:00 ✓✓</div>
            </div>
            {followUps.filter(fu => fu.message.trim()).map((fu, i) => (
              <div key={i}>
                <div className="text-[9px] text-center text-gray-500 my-1">
                  {FOLLOWUP_DELAYS.find(d => d.id === fu.delay)?.label} · if no response
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm ml-2">
                  <p className="text-[12px] text-gray-800 leading-snug whitespace-pre-wrap">{resolve(fu.message)}</p>
                  <div className="text-[10px] text-gray-400 text-right mt-1">✓✓</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guardrails */}
        <div className="surface-card p-4 mb-6 space-y-2.5">
          <Guard label="Only opted-in customers will receive this" />
          <Guard label="Max 2 automated messages per customer per day" />
          <Guard label="Anyone who replies STOP is removed immediately" />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={handleLaunch}
            className="h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] text-base font-bold gap-2">
            <Sparkles className="h-5 w-5" />
            {mode === "trigger" ? "Activate auto-message" : when === "now" ? "Send now" : "Schedule"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setStep(5)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Go back and edit
          </Button>
        </div>
      </div>
    </AppLayout>
  );

  return null;
};

export default NewCampaign;
