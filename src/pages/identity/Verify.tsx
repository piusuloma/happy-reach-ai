import { useEffect, useRef, useState } from "react";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { identity, tierMatrix } from "@/data/identity";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  FileImage,
  Fingerprint,
  Loader2,
  Lock,
  RefreshCw,
  Scale,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --------- Tier 2: The "Magic Screen" -----------------------------------
// One screen captures three inputs (RC, NIN, 3-second selfie). The backend
// runs five checks in parallel: CAC fetch, NIN fetch, liveness (selfie↔NIN),
// authority (NIN name ∈ CAC directors), legal (business name ↔ CAC record).

type Stage = "collect" | "processing" | "success" | "failed";

type CheckState = "pending" | "running" | "passed" | "failed";
type CheckId = "cac" | "nin" | "liveness" | "authority" | "legal";
type Check = {
  id: CheckId;
  label: string;
  detail: string;
  icon: typeof Building2;
  state: CheckState;
  // demo pacing in ms for each stage of the reveal
  runMs: number;
};

const initialChecks: Check[] = [
  {
    id: "cac",
    label: "CAC record",
    detail: "Fetching Director list",
    icon: Building2,
    state: "pending",
    runMs: 2800,
  },
  {
    id: "nin",
    label: "NIN identity",
    detail: "Pulling registered photo + name",
    icon: Fingerprint,
    state: "pending",
    runMs: 2400,
  },
  {
    id: "liveness",
    label: "Liveness & face match",
    detail: "Comparing selfie to NIN photo",
    icon: ScanFace,
    state: "pending",
    runMs: 3200,
  },
  {
    id: "authority",
    label: "Authority check",
    detail: "Is your name on the Director list?",
    icon: BadgeCheck,
    state: "pending",
    runMs: 2600,
  },
  {
    id: "legal",
    label: "Legal name match",
    detail: "Business name vs. CAC record",
    icon: Scale,
    state: "pending",
    runMs: 2200,
  },
];

// Mocked registry responses — what a real CAC + NIMC lookup might return.
const mockCac = {
  rc: "RC-1924881",
  legalName: "MAMA'S KITCHEN NIGERIA LIMITED",
  directors: ["ADEBAYO ADELEKE", "CHIOMA OKAFOR"],
  status: "Active",
};
const mockNin = {
  nin: "91234567890",
  name: "ADEBAYO ADELEKE",
};
const mockMatchScore = 97.3;

const Verify = () => {
  const [active, setActive] = useState<2 | 3>(identity.tier === 1 ? 2 : 3);
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const t2Done = identity.tierStatus[2] === "verified";
  const t3Done = identity.tierStatus[3] === "verified";

  return (
    <AppLayout>
      <PageHeader
        title="Upgrade your verification"
        subtitle="Scam-proof identity in three data points — no forms to fill out twice."
        actions={
          <Button variant="ghost" asChild className="rounded-xl">
            <Link to="/identity">
              <ArrowLeft className="h-4 w-4" /> Back to Identity
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Tier switcher */}
        <div className="space-y-3">
          {tierMatrix.map((t) => {
            const done = identity.tierStatus[t.tier] === "verified";
            const isActive = active === t.tier;
            const locked = t.tier === 3 && !t2Done;
            return (
              <button
                key={t.tier}
                onClick={() => !locked && t.tier !== 1 && setActive(t.tier as 2 | 3)}
                disabled={locked || t.tier === 1}
                className={cn(
                  "w-full text-left rounded-2xl border p-4 transition-all",
                  isActive
                    ? "border-primary bg-accent shadow-[var(--shadow-md)]"
                    : "border-border bg-card hover:border-primary/30",
                  (locked || t.tier === 1) && "opacity-60 cursor-default",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Tier {t.tier}
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : null}
                </div>
                <div className="font-display font-bold text-base mt-0.5">
                  {t.title}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {t.timeToComplete}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active tier form */}
        <div className="surface-card p-6">
          {active === 2 && <Tier2Flow />}

          {active === 3 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl grad-violet flex items-center justify-center text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Tier 3 · Address Verified
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Manual review · within 24 hours
                  </p>
                </div>
              </div>

              <Unlocks items={tierMatrix[2].unlocks} />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!address || !file) {
                    toast.error("Add your address and upload a utility bill");
                    return;
                  }
                  toast.success(
                    "Submitted for review · we'll WhatsApp you within 24 hours",
                  );
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Physical business address
                  </Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12 Adeola Odeku Street, Victoria Island, Lagos"
                    className="h-12 rounded-xl mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Utility bill (under 3 months old)
                  </Label>
                  <label
                    htmlFor="bill"
                    className={cn(
                      "mt-1.5 flex items-center gap-3 rounded-xl border-2 border-dashed border-border p-5 cursor-pointer hover:border-primary/40 hover:bg-accent/50 transition-all",
                      file && "border-primary/40 bg-accent",
                    )}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {file ? (
                        <FileImage className="h-5 w-5 text-primary" />
                      ) : (
                        <Upload className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {file ? file.name : "Tap to upload a photo or scan"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        EKEDC · IKEDC · Water · LAWMA · Bank statement
                      </div>
                    </div>
                    <input
                      id="bill"
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="rounded-xl bg-muted/50 border border-border p-3.5">
                  <div className="text-[11px] font-semibold text-foreground mb-1.5">
                    Privacy guarantee
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your bill is stored encrypted and deleted within 30 days of
                    the review. Only the verification result is retained.
                  </p>
                </div>

                {t3Done ? (
                  <div className="rounded-xl bg-accent border border-primary/30 p-4">
                    <div className="text-sm font-semibold">Tier 3 verified</div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="rounded-xl grad-violet text-white border-0 h-11"
                  >
                    <ShieldCheck className="h-4 w-4" /> Submit for review
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

// --------- Tier 2 sub-components ---------------------------------------

function Tier2Flow() {
  const [stage, setStage] = useState<Stage>("collect");
  const [rc, setRc] = useState(identity.cacNumber || "");
  const [nin, setNin] = useState("");
  const [selfieReady, setSelfieReady] = useState(false);
  const [checks, setChecks] = useState<Check[]>(initialChecks);

  const rcValid = /^RC[-\s]?\d{4,}$|^BN[-\s]?\d{4,}$/i.test(rc.trim());
  const ninValid = nin.replace(/\D/g, "").length === 11;
  const canSubmit = rcValid && ninValid && selfieReady;

  const start = () => {
    if (!canSubmit) return;
    setStage("processing");
    // Reset check states and step through them in sequence.
    setChecks(initialChecks.map((c) => ({ ...c, state: "pending" })));
  };

  // Drive the processing animation.
  useEffect(() => {
    if (stage !== "processing") return;
    let cancelled = false;

    (async () => {
      for (let i = 0; i < initialChecks.length; i++) {
        if (cancelled) return;
        setChecks((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, state: "running" } : c)),
        );
        await new Promise((r) => setTimeout(r, initialChecks[i].runMs));
        if (cancelled) return;
        setChecks((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, state: "passed" } : c)),
        );
      }
      if (!cancelled) setStage("success");
    })();

    return () => {
      cancelled = true;
    };
  }, [stage]);

  const reset = () => {
    setStage("collect");
    setChecks(initialChecks);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-2xl grad-primary flex items-center justify-center text-primary-foreground">
          <BadgeCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">
            Tier 2 · CAC & NIN Verified
          </h2>
          <p className="text-xs text-muted-foreground">
            One screen. Three inputs. Five background checks run in parallel.
          </p>
        </div>
      </div>

      {stage === "collect" && (
        <CollectStep
          rc={rc}
          setRc={setRc}
          rcValid={rcValid}
          nin={nin}
          setNin={setNin}
          ninValid={ninValid}
          selfieReady={selfieReady}
          setSelfieReady={setSelfieReady}
          canSubmit={canSubmit}
          onSubmit={start}
        />
      )}

      {stage === "processing" && <ProcessingStep checks={checks} />}

      {stage === "success" && <SuccessStep checks={checks} onReset={reset} />}
    </>
  );
}

function CollectStep(props: {
  rc: string;
  setRc: (v: string) => void;
  rcValid: boolean;
  nin: string;
  setNin: (v: string) => void;
  ninValid: boolean;
  selfieReady: boolean;
  setSelfieReady: (v: boolean) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const {
    rc,
    setRc,
    rcValid,
    nin,
    setNin,
    ninValid,
    selfieReady,
    setSelfieReady,
    canSubmit,
    onSubmit,
  } = props;

  return (
    <>
      <Unlocks items={tierMatrix[1].unlocks} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mt-5 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              RC / BN number
            </Label>
            <Input
              value={rc}
              onChange={(e) => setRc(e.target.value)}
              placeholder="RC-1234567"
              className="h-12 rounded-xl mt-1.5 font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              From your CAC certificate.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              NIN (or BVN)
            </Label>
            <Input
              value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="11 digits"
              inputMode="numeric"
              className="h-12 rounded-xl mt-1.5 font-mono tracking-wider"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Used for the liveness match. Never shared with buyers.
            </p>
          </div>
        </div>

        <SelfieCapture ready={selfieReady} onReady={setSelfieReady} />

        <div className="rounded-xl bg-muted/50 border border-border p-3.5">
          <div className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Why three data points?
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            RC proves the company exists. NIN proves you are you. The selfie
            proves you are the Director on record. A scammer needs all three —
            they can't fake a face.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          <Sparkles className="h-4 w-4" />
          Run verification
          <ArrowRight className="h-4 w-4" />
        </Button>

        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <ValidityHint ok={rcValid} label="RC / BN format" />
          <ValidityHint ok={ninValid} label="NIN is 11 digits" />
          <ValidityHint ok={selfieReady} label="3-second selfie captured" />
        </ul>
      </form>
    </>
  );
}

function ValidityHint({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2
        className={cn(
          "h-3 w-3",
          ok ? "text-primary" : "text-muted-foreground/40",
        )}
      />
      <span className={ok ? "text-foreground" : ""}>{label}</span>
    </li>
  );
}

function SelfieCapture({
  ready,
  onReady,
}: {
  ready: boolean;
  onReady: (v: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<
    "idle" | "requesting" | "recording" | "done" | "error"
  >(ready ? "done" : "idle");
  const [countdown, setCountdown] = useState(3);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("recording");
      setCountdown(3);
      const tick = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(tick);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      setTimeout(() => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStatus("done");
        onReady(true);
      }, 3100);
    } catch {
      // Camera denied or unavailable — allow the demo to proceed so reviewers
      // can still walk through the flow. In production this would block.
      toast.error(
        "Camera unavailable. Using demo capture so you can continue.",
      );
      setStatus("recording");
      setCountdown(3);
      const tick = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(tick);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      setTimeout(() => {
        setStatus("done");
        onReady(true);
      }, 3100);
    }
  };

  const retake = () => {
    onReady(false);
    setStatus("idle");
  };

  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        3-second video selfie
      </Label>
      <div
        className={cn(
          "mt-1.5 relative aspect-[4/3] w-full max-w-sm rounded-2xl overflow-hidden border-2",
          status === "done"
            ? "border-primary/40 bg-accent"
            : "border-dashed border-border bg-muted/30",
        )}
      >
        {status === "recording" && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="h-24 w-24 rounded-full border-4 border-white/80 flex items-center justify-center text-white font-display font-bold text-4xl tabular-nums shadow-xl">
                {countdown || <CheckCircle2 className="h-10 w-10" />}
              </div>
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground animate-pulse-soft" />
              REC
            </div>
          </>
        )}

        {status === "idle" && (
          <button
            type="button"
            onClick={start}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-accent/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-semibold">Tap to record</div>
            <div className="text-[11px] text-muted-foreground max-w-[240px] text-center">
              We'll match your face to the photo on your NIN. Good light, no
              glasses.
            </div>
          </button>
        )}

        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <div className="text-xs text-muted-foreground">
              Requesting camera access…
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-14 w-14 rounded-2xl grad-primary text-primary-foreground flex items-center justify-center">
              <Video className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold">Selfie captured</div>
            <button
              type="button"
              onClick={retake}
              className="inline-flex items-center gap-1 text-[11px] text-primary font-medium hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Retake
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProcessingStep({ checks }: { checks: Check[] }) {
  const totalMs = initialChecks.reduce((a, c) => a + c.runMs, 0);
  const elapsed = checks.reduce(
    (a, c) => a + (c.state === "passed" ? c.runMs : 0),
    0,
  );
  const percent = Math.min(100, Math.round((elapsed / totalMs) * 100));
  const runningIdx = checks.findIndex((c) => c.state === "running");

  return (
    <div className="mt-2 space-y-5">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-info/5 p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">
              {runningIdx >= 0
                ? checks[runningIdx].detail
                : "Finalising results"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Running {checks.filter((c) => c.state !== "pending").length} of{" "}
              {checks.length} checks in parallel
            </div>
          </div>
          <div className="text-sm font-display font-bold tabular-nums">
            {percent}%
          </div>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {checks.map((c) => (
          <CheckRow key={c.id} check={c} />
        ))}
      </ul>

      <p className="text-[11px] text-center text-muted-foreground">
        Real APIs: CAC Connect, NIMC (NIN), Smile Identity (liveness). This
        usually completes in under 30 seconds.
      </p>
    </div>
  );
}

function CheckRow({ check }: { check: Check }) {
  const Icon = check.icon;
  const stateStyles = {
    pending: "border-border bg-card opacity-60",
    running: "border-primary/40 bg-primary/5",
    passed: "border-success/40 bg-success/5",
    failed: "border-destructive/40 bg-destructive/5",
  } as const;

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3.5 transition-all",
        stateStyles[check.state],
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          check.state === "passed"
            ? "bg-success/20 text-success"
            : check.state === "failed"
              ? "bg-destructive/20 text-destructive"
              : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{check.label}</div>
        <div className="text-[11px] text-muted-foreground">{check.detail}</div>
      </div>
      <div className="shrink-0">
        {check.state === "pending" && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Queued
          </span>
        )}
        {check.state === "running" && (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        )}
        {check.state === "passed" && (
          <CheckCircle2 className="h-5 w-5 text-success" />
        )}
      </div>
    </li>
  );
}

function SuccessStep({
  checks,
  onReset,
}: {
  checks: Check[];
  onReset: () => void;
}) {
  useEffect(() => {
    toast.success("Identity matched to Director records. Business Verified.");
  }, []);

  const matches = [
    {
      label: "Liveness match",
      value: `${mockMatchScore}% confidence`,
      detail: "Your selfie matched the NIN photo on file.",
      icon: ScanFace,
    },
    {
      label: "Authority check",
      value: mockNin.name,
      detail: `Listed as Director on ${mockCac.rc}.`,
      icon: BadgeCheck,
    },
    {
      label: "Legal name",
      value: mockCac.legalName,
      detail: `"${identity.businessName}" matches the CAC record.`,
      icon: Scale,
    },
  ];

  return (
    <div className="mt-2 space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-success/10 to-info/10 p-6 border border-primary/20">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl grad-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-glow)] shrink-0">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">
              Tier 2 issued
            </div>
            <h3 className="font-display text-2xl font-bold mt-0.5">
              Business Verified
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg">
              Identity matched to Director records. Your Verified badge is now
              live on your public profile and every product you ship.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {matches.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-3.5"
            >
              <div className="h-9 w-9 rounded-xl bg-success/20 text-success flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-success font-semibold">
                  {m.label}
                </div>
                <div className="text-sm font-semibold mt-0.5">{m.value}</div>
                <div className="text-[11px] text-muted-foreground">
                  {m.detail}
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-muted/50 border border-border p-3.5">
        <div className="text-[11px] font-semibold text-foreground mb-1.5">
          What happens next
        </div>
        <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
          <li>• Full Verified badge is live across your public profile.</li>
          <li>• Anti-impersonation monitoring is now scanning IG, FB, TikTok.</li>
          <li>
            • Tier 3 (Address Verified) unlocked — add a utility bill when
            you're ready.
          </li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          className="h-11 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Run again
        </Button>
        <Button
          asChild
          className="flex-1 h-11 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          <Link to="/identity">
            Finish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Hidden but useful for demoing: list the raw check states */}
      <details className="text-[11px] text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          View raw match log
        </summary>
        <ul className="mt-2 space-y-1 font-mono">
          {checks.map((c) => (
            <li key={c.id}>
              ✓ {c.id}: {c.state}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Unlocks({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl bg-accent border border-primary/20 p-4">
      <div className="text-xs font-semibold text-accent-foreground mb-2">
        This unlocks
      </div>
      <ul className="space-y-1.5">
        {items.map((u) => (
          <li
            key={u}
            className="flex items-start gap-2 text-sm text-foreground/80"
          >
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Verify;
