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
  Clock,
  MessageCircle,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */
type Mode = "campaign" | "trigger" | null;

type AudienceOption = { id: string; label: string; desc: string; count: number; emoji: string };
const AUDIENCES: AudienceOption[] = [
  { id: "s1", label: "Everyone",           desc: "All your opted-in customers",           count: 1240, emoji: "👥" },
  { id: "s3", label: "Recent buyers",      desc: "Ordered in the last 30 days",           count: 412,  emoji: "🕐" },
  { id: "s2", label: "My best customers",  desc: "3 or more orders with you",             count: 684,  emoji: "⭐" },
  { id: "s6", label: "Customers I miss",   desc: "Haven't ordered in over 60 days",       count: 318,  emoji: "💤" },
  { id: "s5", label: "Almost lost",        desc: "No order in 21–60 days — at risk",      count: 218,  emoji: "⚠️" },
  { id: "s4", label: "VIP only",           desc: "Top spenders — 10 or more orders",      count: 96,   emoji: "👑" },
];

type TriggerOption = { id: string; label: string; desc: string; when: string; emoji: string; defaultMsg: string };
const TRIGGERS: TriggerOption[] = [
  { id: "order_placed",   label: "Someone places an order",       desc: "Send a confirmation right away",          when: "Right away",    emoji: "📦", defaultMsg: "✅ Order confirmed at {{business_name}}! We'll have it ready in 35 mins." },
  { id: "abandoned_cart", label: "Someone leaves their cart",     desc: "Remind them 1 hour later",                when: "After 1 hour",  emoji: "🛒", defaultMsg: "Hi {{customer_name}} — you left something in your cart! Tap to finish your order 👇" },
  { id: "delivered",      label: "An order is delivered",        desc: "Ask for a rating 3 hours later",          when: "After 3 hours", emoji: "⭐", defaultMsg: "How was your order from {{business_name}}? Reply 1–5 to rate us ⭐" },
  { id: "welcome",        label: "A new customer messages me",   desc: "Welcome them straight away",             when: "Right away",    emoji: "👋", defaultMsg: "Welcome to {{business_name}} 👋 Reply MENU to see what we have today!" },
  { id: "offer_expiry",   label: "An offer is about to expire",  desc: "Remind them before it's gone",           when: "24 hrs before", emoji: "⏰", defaultMsg: "⏰ Don't miss out! Your offer at {{business_name}} expires tomorrow." },
  { id: "comeback",       label: "A customer hasn't ordered in a while", desc: "Win them back with a nudge", when: "Daily check",   emoji: "💚", defaultMsg: "Hi {{customer_name}}, we miss you! Come back and get 10% off your next order 🎉" },
];

type WhenOption = "now" | "later";
type DelayOption = { id: string; label: string };
const DELAYS: DelayOption[] = [
  { id: "immediate", label: "Right away" },
  { id: "1h",        label: "After 1 hour" },
  { id: "3h",        label: "After 3 hours" },
  { id: "24h",       label: "After 24 hours" },
];

const VARS = [
  { token: "{{customer_name}}", label: "Customer name" },
  { token: "{{business_name}}", label: "Business name" },
  { token: "{{order_id}}",      label: "Order number" },
];

/* ─── Step indicator ─────────────────────────────────────────── */
function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            i + 1 < current ? "bg-primary text-primary-foreground" :
            i + 1 === current ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
            "bg-muted text-muted-foreground"
          }`}>
            {i + 1 < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 rounded-full transition-colors ${i + 1 < current ? "bg-primary" : "bg-muted"}`} />}
        </div>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Step {current} of {total}</span>
    </div>
  );
}

/* ─── Option card ────────────────────────────────────────────── */
function OptionCard({
  emoji, label, desc, sub, selected, onClick,
}: {
  emoji: string; label: string; desc: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
        selected
          ? "border-primary bg-primary/5 shadow-[var(--shadow-md)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/30"
      }`}
    >
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

/* ─── Nav buttons ────────────────────────────────────────────── */
function Nav({
  onBack, onNext, nextLabel = "Continue", nextDisabled = false, backLabel = "Back",
}: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; backLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl gap-2">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Button>
      )}
      <Button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] gap-2 ml-auto"
      >
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ─── Main wizard ────────────────────────────────────────────── */
const NewCampaign = () => {
  const nav = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode>(null);
  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [when, setWhen] = useState<WhenOption>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [delay, setDelay] = useState("immediate");

  const totalSteps = mode === "campaign" ? 5 : 4;

  const selectedAudience = AUDIENCES.find(a => a.id === audienceId);
  const selectedTrigger  = TRIGGERS.find(t => t.id === triggerId);

  // Pre-fill message when trigger is selected
  const pickTrigger = (id: string) => {
    setTriggerId(id);
    const t = TRIGGERS.find(x => x.id === id);
    if (t && !message) setMessage(t.defaultMsg);
  };

  // Pre-fill a friendly default for campaigns
  const pickAudience = (id: string) => {
    setAudienceId(id);
    if (!message) setMessage(`Hi {{customer_name}}! 👋 We have something special for you at ${business.name} this week.`);
  };

  const insertVar = (token: string) => setMessage(m => m + token);

  const preview = message
    .replace(/\{\{customer_name\}\}/g, "Adaeze")
    .replace(/\{\{business_name\}\}/g, business.name)
    .replace(/\{\{order_id\}\}/g, "#4821");

  const handleLaunch = () => {
    const verb = mode === "trigger" ? "activated" : when === "now" ? "sent" : "scheduled";
    toast.success(`🎉 Your message has been ${verb}!`);
    nav("/campaigns");
  };

  /* ── Step 1: Mode ── */
  if (step === 1) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to campaigns
        </Link>
        <Steps current={1} total={totalSteps || 5} />

        <h1 className="font-display text-2xl font-bold mb-1">What do you want to do?</h1>
        <p className="text-muted-foreground text-sm mb-6">Pick one — you can always change it later.</p>

        <div className="space-y-3">
          <OptionCard
            emoji="📢"
            label="Send a message to my customers"
            desc="You write the message, choose who gets it, and decide when. Great for announcements, offers, and promotions."
            selected={mode === "campaign"}
            onClick={() => setMode("campaign")}
          />
          <OptionCard
            emoji="⚡"
            label="Set up an automatic message"
            desc="The message sends itself whenever something happens — like when a customer orders, or leaves their cart. Set it once and it runs forever."
            selected={mode === "trigger"}
            onClick={() => setMode("trigger")}
          />
        </div>

        <Nav
          onNext={() => setStep(2)}
          nextDisabled={!mode}
          nextLabel="Next"
        />
      </div>
    </AppLayout>
  );

  /* ── Step 2a (Campaign): Audience ── */
  if (step === 2 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Steps current={2} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">Who should get the message?</h1>
        <p className="text-muted-foreground text-sm mb-6">You can only message customers who agreed to hear from you.</p>

        <div className="space-y-3">
          {AUDIENCES.map(a => (
            <OptionCard
              key={a.id}
              emoji={a.emoji}
              label={a.label}
              desc={a.desc}
              sub={`${a.count.toLocaleString()} customers`}
              selected={audienceId === a.id}
              onClick={() => pickAudience(a.id)}
            />
          ))}
        </div>

        <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!audienceId} />
      </div>
    </AppLayout>
  );

  /* ── Step 2b (Trigger): Event ── */
  if (step === 2 && mode === "trigger") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Steps current={2} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">When should it send?</h1>
        <p className="text-muted-foreground text-sm mb-6">Pick the moment that should trigger your message.</p>

        <div className="space-y-3">
          {TRIGGERS.map(t => (
            <OptionCard
              key={t.id}
              emoji={t.emoji}
              label={t.label}
              desc={t.desc}
              sub={`Sends: ${t.when}`}
              selected={triggerId === t.id}
              onClick={() => pickTrigger(t.id)}
            />
          ))}
        </div>

        <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!triggerId} />
      </div>
    </AppLayout>
  );

  /* ── Step 3: Write message ── */
  if (step === 3) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4">
        <Steps current={3} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">Write your message</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Keep it short and friendly. We've filled in a starting point — just edit it to sound like you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              maxLength={1024}
              placeholder="Type your message here…"
              className="rounded-xl text-sm leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground">{message.length} / 1024 characters</span>
            </div>

            {/* Variable chips */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                Tap to personalise — we'll swap these in for each customer automatically:
              </p>
              <div className="flex flex-wrap gap-2">
                {VARS.map(v => (
                  <button
                    type="button"
                    key={v.token}
                    onClick={() => insertVar(v.token)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary font-medium transition-colors"
                  >
                    + {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preview — how it looks to a customer</p>
            <div className="rounded-2xl bg-[#E5DDD5] p-4 min-h-[200px]">
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mb-1.5">
                  <ShieldCheck className="h-3 w-3" /> {business.name} · Verified
                </div>
                <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap">{preview || "Your message will appear here…"}</p>
                <div className="text-[10px] text-gray-400 text-right mt-2">10:00 ✓✓</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Your customers will see your verified business name above every message. This builds trust.
            </p>
          </div>
        </div>

        <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={message.trim().length < 5} />
      </div>
    </AppLayout>
  );

  /* ── Step 4a (Campaign): When to send ── */
  if (step === 4 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Steps current={4} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">When do you want to send it?</h1>
        <p className="text-muted-foreground text-sm mb-6">Your message will go to <b>{selectedAudience?.count.toLocaleString()}</b> customers.</p>

        <div className="space-y-3 mb-6">
          <OptionCard
            emoji="🚀"
            label="Send it now"
            desc="Your message goes out within seconds."
            selected={when === "now"}
            onClick={() => setWhen("now")}
          />
          <OptionCard
            emoji="🗓"
            label="Schedule for later"
            desc="Pick a day and time — perfect for morning announcements or lunch promos."
            selected={when === "later"}
            onClick={() => setWhen("later")}
          />
        </div>

        {when === "later" && (
          <div className="surface-card p-5 space-y-4">
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

        <div className="mt-5">
          <label className="text-sm font-medium block mb-1.5">Give this campaign a name <span className="text-muted-foreground font-normal">(optional)</span></label>
          <Input
            value={campaignName}
            onChange={e => setCampaignName(e.target.value)}
            placeholder="e.g. Weekend promo, Lunch offer…"
            className="rounded-xl"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Only you see this — it's just to help you find it later.</p>
        </div>

        <Nav
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          nextDisabled={when === "later" && (!scheduleDate || !scheduleTime)}
        />
      </div>
    </AppLayout>
  );

  /* ── Step 4b (Trigger): Delay ── */
  if (step === 4 && mode === "trigger") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Steps current={4} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">How long after the event?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Choose when the message should arrive after <b>{selectedTrigger?.label.toLowerCase()}</b>.
        </p>

        <div className="space-y-3 mb-6">
          {DELAYS.map(d => (
            <OptionCard
              key={d.id}
              emoji={d.id === "immediate" ? "⚡" : d.id === "1h" ? "🕐" : d.id === "3h" ? "🕒" : "🕛"}
              label={d.label}
              desc={d.id === "immediate" ? "Best for order confirmations and welcomes" : d.id === "1h" ? "Best for cart recovery — gives them time but not too long" : d.id === "3h" ? "Best for post-delivery feedback" : "Best for daily win-back checks"}
              selected={delay === d.id}
              onClick={() => setDelay(d.id)}
            />
          ))}
        </div>

        <Nav onBack={() => setStep(3)} onNext={() => setStep(5)} />
      </div>
    </AppLayout>
  );

  /* ── Step 5: Review & launch ── */
  if (step === 5) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Steps current={totalSteps} total={totalSteps} />
        <h1 className="font-display text-2xl font-bold mb-1">Ready to go! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-6">Check the details below, then hit launch.</p>

        {/* Summary card */}
        <div className="surface-card p-5 mb-5 space-y-4">
          <SummaryRow icon={mode === "campaign" ? "📢" : "⚡"} label="Type" value={mode === "campaign" ? "Send to customers" : "Automatic message"} />
          {mode === "campaign" && selectedAudience && (
            <SummaryRow icon={selectedAudience.emoji} label="Who gets it" value={`${selectedAudience.label} — ${selectedAudience.count.toLocaleString()} customers`} />
          )}
          {mode === "trigger" && selectedTrigger && (
            <SummaryRow icon={selectedTrigger.emoji} label="Fires when" value={selectedTrigger.label} />
          )}
          {mode === "campaign" && (
            <SummaryRow icon={when === "now" ? "🚀" : "🗓"} label="Sends" value={when === "now" ? "Right now" : `${scheduleDate} at ${scheduleTime}`} />
          )}
          {mode === "trigger" && (
            <SummaryRow icon="⏱" label="Delay" value={DELAYS.find(d => d.id === delay)?.label ?? delay} />
          )}
          {campaignName && <SummaryRow icon="🏷" label="Name" value={campaignName} />}
        </div>

        {/* Message preview */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your message</p>
          <div className="rounded-2xl bg-[#E5DDD5] p-4">
            <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mb-1.5">
                <ShieldCheck className="h-3 w-3" /> {business.name} · Verified
              </div>
              <p className="text-[13px] text-gray-800 leading-snug whitespace-pre-wrap">{preview}</p>
              <div className="text-[10px] text-gray-400 text-right mt-2">10:00 ✓✓</div>
            </div>
          </div>
        </div>

        {/* Guardrails */}
        <div className="surface-card p-4 mb-6 space-y-2.5">
          <Guard label="Only opted-in customers will receive this" />
          <Guard label="Max 2 automated messages per customer per day" />
          <Guard label="Anyone who replies STOP is removed immediately" />
        </div>

        {/* Launch */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleLaunch}
            className="h-13 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] text-base font-bold"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {mode === "trigger" ? "Activate auto-message" : when === "now" ? "Send now" : "Schedule"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setStep(4)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Go back and edit
          </Button>
        </div>
      </div>
    </AppLayout>
  );

  return null;
};

/* ─── Small helpers ──────────────────────────────────────────── */
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
      <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
      {label}
    </div>
  );
}

export default NewCampaign;
