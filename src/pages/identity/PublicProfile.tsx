import { useParams, Link } from "react-router-dom";
import { identity, publicVerificationEvents, bandFor } from "@/data/identity";
import { VerifiedBadge } from "@/components/identity/VerifiedBadge";
import { TrustScoreRing } from "@/components/identity/TrustScoreRing";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Flag,
  Info,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const PublicProfile = () => {
  const { handle } = useParams();
  const businessHandle = handle || identity.handle;
  const band = bandFor(identity.trustScore);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* zero-chrome header — only the brand mark, building familiarity */}
      <div className="relative h-32 grad-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <Link to="/" className="absolute top-4 left-4 inline-flex items-center gap-2 text-white/90 text-xs font-medium hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> nativeid.io
        </Link>
        <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/90 bg-white/15 backdrop-blur px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-3 w-3" /> NativeID Verified Profile
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-14 pb-12">
        {/* Hero card — badge is the most prominent thing */}
        <div className="surface-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl grad-emerald flex items-center justify-center text-white font-display font-bold text-2xl shrink-0 shadow-[var(--shadow-md)]">
              MK
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-display text-2xl font-bold leading-tight">{identity.businessName}</h1>
              <div className="text-xs text-muted-foreground mt-0.5">
                @{businessHandle} · {identity.category}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {identity.city}, {identity.state}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <VerifiedBadge tier={identity.tier} size="xl" />
          </div>

          <div className="mt-4 rounded-xl bg-accent border border-primary/20 p-3 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[12px] text-accent-foreground leading-relaxed">
              <strong>Always check this badge before you pay.</strong> Tap below to see exactly what was verified.
            </p>
          </div>
        </div>

        {/* Trust score */}
        <div className="surface-card p-6 mt-4 flex items-center gap-5">
          <TrustScoreRing score={identity.trustScore} size={110} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Customer trust</div>
            <div className="font-display font-bold text-xl mt-0.5">{band.label}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{band.hint}</div>
          </div>
        </div>

        {/* What was verified */}
        <div className="surface-card p-6 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display font-bold text-base">What we verified</h2>
          </div>
          <ul className="space-y-3">
            {publicVerificationEvents.map((e) => (
              <li key={e.label} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{e.label}</div>
                  {e.detail && <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{e.detail}</div>}
                  <div className="text-[11px] text-muted-foreground mt-0.5">{e.at}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
            Address verified in <strong>{identity.city}, {identity.state}</strong>. Full street address is never shown publicly.
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button className="h-12 rounded-xl grad-primary text-primary-foreground border-0">
            <MessageCircle className="h-4 w-4" /> Message
          </Button>
          <Button variant="outline" className="h-12 rounded-xl">
            <Flag className="h-4 w-4" /> Report impersonator
          </Button>
        </div>

        {/* Footer trust strip */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary" />
            Verified by NativeID · Africa's identity layer
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
