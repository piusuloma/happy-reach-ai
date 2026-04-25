import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { business, segments } from "@/data/mock";
import { identity } from "@/data/identity";
import {
  categoryFromLabel,
  templateFor,
  type MessageTemplate,
} from "@/data/templates";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/* ─── Fixed data ──────────────────────────────────────────────── */

// Keep audience ordering stable: most-used first.
const AUDIENCE_ORDER = ["s1", "s3", "s2", "s6", "s5", "s4"];
const AUDIENCES = AUDIENCE_ORDER.map(id => segments.find(s => s.id === id)!).filter(Boolean);

// Each trigger declares its industry-recommended delay so we can ship
// triggered automations without asking the merchant to pick a timing.
const TRIGGERS = [
  { id: "order_placed",   emoji: "📦", label: "Someone places an order",              desc: "Send a confirmation right away",       when: "Right away",    recommendedDelay: "immediate" },
  { id: "abandoned_cart", emoji: "🛒", label: "Someone leaves their cart",            desc: "Remind them 1 hour later",             when: "After 1 hour",  recommendedDelay: "1h" },
  { id: "delivered",      emoji: "⭐", label: "An order is delivered",                desc: "Ask for a rating 3 hours later",       when: "After 3 hours", recommendedDelay: "3h" },
  { id: "welcome",        emoji: "👋", label: "A new customer messages me",           desc: "Welcome them straight away",           when: "Right away",    recommendedDelay: "immediate" },
  { id: "offer_expiry",   emoji: "⏰", label: "An offer is about to expire",          desc: "Remind them before it's gone",         when: "24 hrs before", recommendedDelay: "24h" },
  { id: "comeback",       emoji: "💚", label: "A customer hasn't ordered in a while", desc: "Win them back with a nudge",           when: "Daily check",   recommendedDelay: "24h" },
];

const TRIGGER_DELAY_LABELS: Record<string, string> = {
  immediate: "Right away",
  "1h": "After 1 hour",
  "3h": "After 3 hours",
  "24h": "After 24 hours",
};

/**
 * Recommended follow-up delays — fixed per mode, not user-editable.
 *
 * Templates can override with their own `followUp.delay`. Otherwise we ship
 * the proven defaults: 2 days for broadcasts (close enough to stay relevant,
 * far enough not to feel spammy), 3 hours for triggers (event-driven loops
 * are tighter than merchant broadcasts).
 */
const DEFAULT_FOLLOWUP_DELAY: Record<"campaign" | "trigger", string> = {
  campaign: "2",
  trigger: "3h",
};

const FOLLOWUP_LABELS: Record<string, string> = {
  "1h": "1 hour later",
  "3h": "3 hours later",
  "1": "1 day later",
  "2": "2 days later",
  "3": "3 days later",
  "5": "5 days later",
  "7": "7 days later",
  "10": "10 days later",
  "14": "14 days later",
};

const followUpLabel = (delay: string) =>
  FOLLOWUP_LABELS[delay] ?? `${delay} later`;

const VARS = [
  { token: "{{customer_name}}", label: "Customer name" },
  { token: "{{business_name}}", label: "Business name" },
  { token: "{{menu_link}}",     label: "Menu link" },
  { token: "{{order_id}}",      label: "Order number" },
];

/* ─── Types ──────────────────────────────────────────────────── */
type Mode    = "campaign" | "trigger" | null;
type WhenOpt = "now" | "later";

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
// Broadcasts walk through 5 steps (mode → audience → message → follow-up →
// when → review = 6 internal steps numbered 1..6). Triggered automations skip
// the follow-up and delay steps — the system picks the recommended timing —
// so the user only sees 4 visible steps. Internal step numbers stay the same
// for routing simplicity; mapInternalToVisible bridges the two.
const TOTAL_STEPS_BY_MODE = { campaign: 6, trigger: 4 } as const;

const VISIBLE_STEP_BY_INTERNAL: Record<"campaign" | "trigger", Record<number, number>> = {
  campaign: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 },
  trigger:  { 1: 1, 2: 2, 3: 3, 6: 4 },
};

const NewAutomation = () => {
  const nav = useNavigate();

  const [step,         setStep]         = useState(1);
  const [mode,         setMode]         = useState<Mode>(null);
  const [audienceId,   setAudienceId]   = useState<string | null>(null);
  const [triggerId,    setTriggerId]    = useState<string | null>(null);
  const [message,      setMessage]      = useState("");
  const [followUpMsg,  setFollowUpMsg]  = useState("");
  const [followUpDelay, setFollowUpDelay] = useState<string>(
    DEFAULT_FOLLOWUP_DELAY.campaign,
  );
  const [when,         setWhen]         = useState<WhenOpt>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [automationName, setAutomationName] = useState("");
  // Note: triggered automations don't expose a delay picker — the system uses
  // each trigger's industry-recommended delay (TRIGGERS[].recommendedDelay).

  // Visible step + total are mode-aware. Trigger mode collapses follow-up and
  // delay so the StepBar shows 4 steps, not 6.
  const visibleTotal = mode ? TOTAL_STEPS_BY_MODE[mode] : 6;
  const visibleStep = mode
    ? VISIBLE_STEP_BY_INTERNAL[mode][step] ?? step
    : step;

  const selectedAudience = segments.find(a => a.id === audienceId);
  const selectedTrigger  = TRIGGERS.find(t => t.id === triggerId);

  const merchantCategory = useMemo(
    () => categoryFromLabel(identity.category),
    [],
  );

  // Picking a mode resets the follow-up delay to that mode's default so the
  // read-only badge on the follow-up step always matches the current mode.
  const pickMode = (m: Mode) => {
    setMode(m);
    if (m) setFollowUpDelay(DEFAULT_FOLLOWUP_DELAY[m]);
  };

  // Loading a template overwrites both messages + the follow-up delay so the
  // merchant sees fresh, relevant copy whenever they change context. They can
  // still edit the textarea after.
  const loadTemplate = (t: MessageTemplate | null) => {
    if (!t) return;
    setMessage(t.initial);
    setFollowUpMsg(t.followUp.message);
    setFollowUpDelay(t.followUp.delay);
  };

  const pickAudience = (id: string) => {
    setAudienceId(id);
    loadTemplate(templateFor(merchantCategory, "campaign", id));
  };

  const pickTrigger = (id: string) => {
    setTriggerId(id);
    loadTemplate(templateFor(merchantCategory, "trigger", id));
  };

  const resolve = (txt: string) => txt
    .replace(/\{\{customer_name\}\}/g, "Adaeze")
    .replace(/\{\{business_name\}\}/g, business.name)
    .replace(/\{\{menu_link\}\}/g, `nativeid.io/${business.handle}`)
    .replace(/\{\{order_id\}\}/g, "#4821");

  const handleLaunch = () => {
    const verb = mode === "trigger" ? "activated" : when === "now" ? "sent" : "scheduled";
    toast.success(`🎉 Your automation has been ${verb}!`);
    nav("/automations");
  };

  const followUpDelayLabel = followUpLabel(followUpDelay);

  /* ════════════════════════════════════════════
     STEP 1 — What do you want to do?
  ════════════════════════════════════════════ */
  if (step === 1) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <Link to="/automations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to automations
        </Link>
        <StepBar current={visibleStep} total={visibleTotal} />
        <h1 className="font-display text-2xl font-bold mb-1">What do you want to do?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Every automation sends a first message plus one follow-up — no more, no less.
        </p>
        <div className="space-y-3">
          <OptionCard emoji="📢" label="Broadcast to customers"
            desc="You write the message, choose who gets it, and decide when. Great for announcements, offers, and weekly updates."
            selected={mode === "campaign"} onClick={() => pickMode("campaign")} />
          <OptionCard emoji="⚡" label="Automatic message on an event"
            desc="The message sends itself whenever something happens — like when a customer orders or leaves their cart. Set it once, it runs forever."
            selected={mode === "trigger"} onClick={() => pickMode("trigger")} />
        </div>
        <Nav onNext={() => setStep(2)} nextDisabled={!mode} nextLabel="Next" />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 2a (Broadcast) — Who gets it?
  ════════════════════════════════════════════ */
  if (step === 2 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={visibleStep} total={visibleTotal} />
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
        <StepBar current={visibleStep} total={visibleTotal} />
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
     STEP 3 — Write your first message
  ════════════════════════════════════════════ */
  if (step === 3) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-4">
        <StepBar current={visibleStep} total={visibleTotal} />
        <h1 className="font-display text-2xl font-bold mb-1">Write your first message</h1>
        <p className="text-muted-foreground text-sm mb-6">
          We've pre-filled a starter based on your{" "}
          {mode === "campaign" ? "audience" : "trigger"}. Edit it to sound like you,
          or replace it entirely.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div>
            <Textarea value={message} onChange={e => { setMessage(e.target.value); }}
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

        <Nav
          onBack={() => setStep(2)}
          onNext={() => setStep(mode === "trigger" ? 6 : 4)}
          nextDisabled={message.trim().length < 5}
          nextLabel={mode === "trigger" ? "Review" : "Continue"}
        />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 4 — Your follow-up (always exactly one)
  ════════════════════════════════════════════ */
  if (step === 4) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={visibleStep} total={visibleTotal} />
        <h1 className="font-display text-2xl font-bold mb-1">Your one follow-up</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Every automation sends exactly one follow-up to customers who don't respond to the first message.
          We send it at the recommended time — you only need to choose what it says.
        </p>

        <div className="space-y-4 mb-4">
          {/* First message — read-only summary */}
          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground font-medium mb-1">
                First message · sends {mode === "trigger" ? "on event" : when === "now" ? "right away" : "at scheduled time"}
              </div>
              <p className="text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">{resolve(message)}</p>
            </div>
          </div>

          {/* Follow-up card */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-semibold">Follow-up</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Only if no reply</span>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-semibold">Sends {followUpDelayLabel}</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                ✓ recommended
              </span>
            </div>

            <Textarea value={followUpMsg} onChange={e => setFollowUpMsg(e.target.value)}
              rows={4} maxLength={1024} placeholder="Write your follow-up here…"
              className="rounded-xl text-sm leading-relaxed resize-none" />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Only sent to customers who didn't respond to the first message. After this, the conversation closes.
            </p>
          </div>
        </div>

        <Nav
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          nextDisabled={followUpMsg.trim().length < 5}
        />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 5a (Broadcast) — When to send
  ════════════════════════════════════════════ */
  if (step === 5 && mode === "campaign") return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={visibleStep} total={visibleTotal} />
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
          <Input value={automationName} onChange={e => setAutomationName(e.target.value)}
            placeholder="e.g. Weekend promo, Lunch offer…" className="rounded-xl" />
          <p className="text-[11px] text-muted-foreground mt-1">Only you see this — just to help you find it later.</p>
        </div>

        <Nav onBack={() => setStep(4)} onNext={() => setStep(6)}
          nextDisabled={when === "later" && (!scheduleDate || !scheduleTime)} />
      </div>
    </AppLayout>
  );

  /* ════════════════════════════════════════════
     STEP 6 — Review & launch
  ════════════════════════════════════════════ */
  if (step === 6) return (
    <AppLayout>
      <div className="max-w-xl mx-auto py-4">
        <StepBar current={visibleStep} total={visibleTotal} />
        <h1 className="font-display text-2xl font-bold mb-1">Ready to go! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-6">Check everything below, then hit launch.</p>

        <div className="surface-card p-5 mb-5 space-y-4">
          <SummaryRow icon={mode === "campaign" ? "📢" : "⚡"} label="Type"
            value={mode === "campaign" ? "Broadcast to customers" : "Automatic on event"} />
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
          {mode === "trigger" && selectedTrigger && (
            <SummaryRow icon="⏱" label="Sends"
              value={`${TRIGGER_DELAY_LABELS[selectedTrigger.recommendedDelay] ?? selectedTrigger.recommendedDelay} · industry-recommended`} />
          )}
          {mode === "campaign" && (
            <SummaryRow icon="💬" label="Follow-up"
              value={`${followUpDelayLabel} — only if no response`} />
          )}
          {automationName && <SummaryRow icon="🏷" label="Name" value={automationName} />}
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
            {mode === "campaign" && (
              <div>
                <div className="text-[9px] text-center text-gray-500 my-1">
                  {followUpDelayLabel} · if no response
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm p-3 max-w-[90%] shadow-sm ml-2">
                  <p className="text-[12px] text-gray-800 leading-snug whitespace-pre-wrap">{resolve(followUpMsg)}</p>
                  <div className="text-[10px] text-gray-400 text-right mt-1">✓✓</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guardrails */}
        <div className="surface-card p-4 mb-6 space-y-2.5">
          <Guard label="Only opted-in customers will receive this" />
          {mode === "campaign" && (
            <Guard label="Exactly one follow-up — no endless chase sequences" />
          )}
          {mode === "trigger" && (
            <Guard label="Sends at the industry-recommended time — no spam" />
          )}
          <Guard label="Anyone who replies STOP is removed immediately" />
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={handleLaunch}
            className="h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] text-base font-bold gap-2">
            <Sparkles className="h-5 w-5" />
            {mode === "trigger" ? "Activate automation" : when === "now" ? "Send now" : "Schedule"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setStep(mode === "trigger" ? 3 : 5)} className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Go back and edit
          </Button>
        </div>
      </div>
    </AppLayout>
  );

  return null;
};

export default NewAutomation;
