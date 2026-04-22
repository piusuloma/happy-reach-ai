import { useState } from "react";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { identity, ssoApps } from "@/data/identity";
import { VerifiedBadge } from "@/components/identity/VerifiedBadge";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const SsoDemo = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const nav = useNavigate();
  const app = ssoApps.find((a) => a.id === selected);

  if (!selected || !app) {
    return (
      <AuthShell title="Continue with NativeID" subtitle="Pick a third-party app to see how one-tap identity works.">
        <div className="space-y-3">
          {ssoApps.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className="w-full flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className={`h-11 w-11 rounded-xl grad-${a.color} flex items-center justify-center text-white font-bold shrink-0`}>
                {a.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.purpose}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          <Link to="/identity" className="text-primary hover:underline">← Back to your identity</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={`Continue to ${app.name}?`} subtitle="They're asking NativeID to confirm your identity. You stay in control of what's shared.">
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl grad-${app.color} flex items-center justify-center text-white font-bold shrink-0`}>
            {app.name.slice(0, 1)}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="h-11 w-11 rounded-xl grad-primary flex items-center justify-center text-white font-bold shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{app.name} will receive</div>
          <ul className="space-y-2.5">
            {[
              "Your business name and category",
              "Your verification tier and badge",
              "Whether your address is verified (city/state only)",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            They will <strong>not</strong> receive your mobile number, full address, or CAC document.
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-accent p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grad-primary flex items-center justify-center text-white font-bold shrink-0">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{identity.businessName}</div>
            <div className="text-[11px] text-muted-foreground">{identity.mobile}</div>
          </div>
          <VerifiedBadge tier={identity.tier} size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl h-11" onClick={() => setSelected(null)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl h-11 grad-primary text-primary-foreground border-0"
            onClick={() => {
              toast.success(`Signed in to ${app.name}`);
              nav("/identity");
            }}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AuthShell>
  );
};

export default SsoDemo;
