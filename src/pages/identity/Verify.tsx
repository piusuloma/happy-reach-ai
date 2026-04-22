import { useState } from "react";
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
  CheckCircle2,
  FileImage,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Verify = () => {
  const [active, setActive] = useState<2 | 3>(identity.tier === 1 ? 2 : 3);
  const [cac, setCac] = useState(identity.cacNumber || "");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const t2Done = identity.tierStatus[2] === "verified";
  const t3Done = identity.tierStatus[3] === "verified";

  return (
    <AppLayout>
      <PageHeader
        title="Upgrade your verification"
        subtitle="Each step takes minutes. We only ask for what's strictly required."
        actions={
          <Button variant="ghost" asChild className="rounded-xl">
            <Link to="/identity"><ArrowLeft className="h-4 w-4" /> Back to Identity</Link>
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
                  isActive ? "border-primary bg-accent shadow-[var(--shadow-md)]" : "border-border bg-card hover:border-primary/30",
                  (locked || t.tier === 1) && "opacity-60 cursor-default",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tier {t.tier}</div>
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : null}
                </div>
                <div className="font-display font-bold text-base mt-0.5">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.timeToComplete}</div>
              </button>
            );
          })}
        </div>

        {/* Active tier form */}
        <div className="surface-card p-6">
          {active === 2 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl grad-primary flex items-center justify-center text-primary-foreground">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Tier 2 · Formally Verified</h2>
                  <p className="text-xs text-muted-foreground">CAC check · automated · usually under 2 minutes</p>
                </div>
              </div>

              <Unlocks items={tierMatrix[1].unlocks} />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("CAC check passed — Tier 2 badge issued");
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    CAC registration number
                  </Label>
                  <Input
                    value={cac}
                    onChange={(e) => setCac(e.target.value)}
                    placeholder="RC-1234567"
                    className="h-12 rounded-xl mt-1.5 font-mono"
                    disabled={t2Done}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Find this on your CAC certificate. We check it against the official registry in real time.
                  </p>
                </div>

                {t2Done ? (
                  <div className="rounded-xl bg-accent border border-primary/30 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">Tier 2 verified</div>
                      <div className="text-xs text-muted-foreground">CAC {cac} confirmed · escrow up to ₦500,000</div>
                    </div>
                  </div>
                ) : (
                  <Button type="submit" className="rounded-xl grad-primary text-primary-foreground border-0 h-11">
                    <Sparkles className="h-4 w-4" /> Run CAC check
                  </Button>
                )}
              </form>
            </>
          )}

          {active === 3 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl grad-violet flex items-center justify-center text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Tier 3 · Address Verified</h2>
                  <p className="text-xs text-muted-foreground">Manual review · within 24 hours</p>
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
                  toast.success("Submitted for review · we'll WhatsApp you within 24 hours");
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
                      {file ? <FileImage className="h-5 w-5 text-primary" /> : <Upload className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {file ? file.name : "Tap to upload a photo or scan"}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        EKEDC · IKEDC · Water · LAWMA · Bank statement
                      </div>
                    </div>
                    <input id="bill" type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="rounded-xl bg-muted/50 border border-border p-3.5">
                  <div className="text-[11px] font-semibold text-foreground mb-1.5">Privacy guarantee</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Your bill is stored encrypted and deleted within 30 days of the review. Only the verification result is retained.
                  </p>
                </div>

                {t3Done ? (
                  <div className="rounded-xl bg-accent border border-primary/30 p-4">
                    <div className="text-sm font-semibold">Tier 3 verified</div>
                  </div>
                ) : (
                  <Button type="submit" className="rounded-xl grad-violet text-white border-0 h-11">
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

function Unlocks({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl bg-accent border border-primary/20 p-4">
      <div className="text-xs font-semibold text-accent-foreground mb-2">This unlocks</div>
      <ul className="space-y-1.5">
        {items.map((u) => (
          <li key={u} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Verify;
