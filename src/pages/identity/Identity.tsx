import React from "react";
import { AppLayout, PageHeader } from "@/components/AppLayout";
import { MigrationBanner } from "@/components/identity/MigrationBanner";
import { VerifiedBadge } from "@/components/identity/VerifiedBadge";
import { TrustScoreRing } from "@/components/identity/TrustScoreRing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  identity,
  tierMatrix,
  bandFor,
  impersonationAlerts,
  type TierStatus,
} from "@/data/identity";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  MousePointerClick,
  Pencil,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

const Identity = () => {
  const profileUrl = `nativeid.io/${identity.handle}`;
  const band = bandFor(identity.trustScore);

  return (
    <AppLayout>
      <MigrationBanner />

      <PageHeader
        title="Your NativeID"
        subtitle="Customers verify you in 30 seconds. Higher tiers unlock stronger trust signals."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/auth/profile">
                <Pencil className="h-4 w-4" /> Edit profile
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to={`/id/${identity.handle}`} target="_blank">
                <Eye className="h-4 w-4" /> View public profile
              </Link>
            </Button>
            <Button className="rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]" asChild>
              <Link to="/identity/verify">
                <Sparkles className="h-4 w-4" /> Upgrade verification
              </Link>
            </Button>
          </>
        }
      />

      {/* Identity hero */}
      <div className="surface-card overflow-hidden mb-6">
        <div className="grad-primary px-6 py-5 text-primary-foreground flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold font-display text-xl shrink-0">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-display text-xl font-bold truncate">{identity.businessName}</div>
              <VerifiedBadge tier={identity.tier} size="sm" className="!bg-white/20 !text-white !shadow-none" />
            </div>
            <div className="text-xs text-white/80 mt-0.5 flex items-center gap-3">
              <span>{identity.category}</span>
              <span>·</span>
              <span>{identity.city}, {identity.state}</span>
              <span>·</span>
              <span>Since {identity.registeredOn}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Trust score */}
          <div className="flex items-center gap-5">
            <TrustScoreRing score={identity.trustScore} />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Customer label</div>
              <div className="font-display font-bold text-xl mt-0.5">{band.label}</div>
              <div className="text-xs text-muted-foreground mt-1 max-w-[180px]">{band.hint}</div>
              <Link to="/identity/verify" className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
                How to improve <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Profile link */}
          <div className="rounded-2xl border border-border p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your shareable link</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-muted rounded-lg px-3 py-2 truncate">{profileUrl}</code>
              <Button
                variant="outline"
                className="rounded-lg shrink-0 gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(`https://${profileUrl}`);
                  toast.success("Link copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" className="rounded-lg shrink-0 gap-1.5 text-xs">
                <QrCode className="h-3.5 w-3.5" /> QR Code
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Put this in your Instagram bio, on flyers, or print as a QR code on your storefront.
            </p>
          </div>

          {/* Anti-impersonation snapshot */}
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Impersonators blocked</div>
              <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="font-display text-2xl font-bold mt-2">{identity.impersonatorsBlocked}</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Fake accounts using your name, reported and removed on the NativeID platform.
            </p>
          </div>
        </div>
      </div>

      {/* Profile analytics */}
      <div className="surface-card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ProfileStat icon={Eye} iconColor="bg-sky-500" label="Total Views" value={32} accentColor="bg-sky-500" />
          <ProfileStat icon={MousePointerClick} iconColor="bg-emerald-500" label="Total Clicks" value={0} accentColor="bg-emerald-500" />
          <ProfileStat icon={UserPlus} iconColor="bg-violet-500" label="Contact Saves" value={0} accentColor="bg-violet-500" />
        </div>
      </div>

      {/* Tier journey */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold">Verification journey</h3>
            <p className="text-xs text-muted-foreground">Each tier unlocks more — only complete what you need.</p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl" asChild>
            <Link to="/identity/verify">All requirements <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tierMatrix.map((t) => (
            <TierCard key={t.tier} tier={t} status={identity.tierStatus[t.tier]} />
          ))}
        </div>
      </div>

      {/* Anti-impersonation — full width */}
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-bold">Anti-impersonation monitoring</h3>
          </div>
          <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Active · Tier 2+</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          We monitor and remove accounts impersonating your business on the NativeID platform. {identity.impersonatorsBlocked} removed so far.
        </p>
        <div className="divide-y divide-border">
          {impersonationAlerts.map((a) => (
            <div key={a.id} className="py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold uppercase">
                {a.platform.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{a.handle}</div>
                <div className="text-[11px] text-muted-foreground">NativeID · detected {a.detectedAt}</div>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                  a.status.includes("Taken") ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}
              >
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pro tip */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-foreground">Pro Tip</div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Share your QR code on business cards, flyers, and social media to increase your profile views and grow your customer connections.
          </p>
        </div>
      </div>

    </AppLayout>
  );
};

function ProfileStat({
  icon: Icon,
  iconColor,
  label,
  value,
  accentColor,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: number;
  accentColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className={`h-11 w-11 rounded-xl ${iconColor} flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="font-display text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`h-0.5 w-5 rounded-full ${accentColor}`} />
        All time
      </div>
    </div>
  );
}

function TierCard({ tier, status }: { tier: typeof tierMatrix[number]; status: TierStatus }) {
  const isVerified = status === "verified";
  const isReview = status === "in_review";
  const gradMap: Record<string, string> = {
    sky: "grad-sky",
    primary: "grad-primary",
    violet: "grad-violet",
  };
  return (
    <Link
      to="/identity/verify"
      className={`rounded-2xl border p-4 transition-all block hover:shadow-md ${
        isVerified ? "border-primary/30 bg-accent hover:border-primary/50" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${gradMap[tier.color]}`}>
          {isVerified ? <BadgeCheck className="h-5 w-5" /> : tier.tier === 3 ? <Building2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        {isVerified && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> VERIFIED
          </span>
        )}
        {isReview && (
          <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-1 rounded-full inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> IN REVIEW
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tier {tier.tier}</div>
        <div className="font-display font-bold text-lg leading-tight">{tier.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{tier.timeToComplete}</div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {tier.unlocks.slice(0, 2).map((u) => (
          <li key={u} className="flex items-start gap-1.5 text-[12px] text-foreground/80">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span>{u}</span>
          </li>
        ))}
      </ul>
      {!isVerified && !isReview && (
        <div className="mt-4 w-full rounded-xl grad-primary text-primary-foreground text-xs font-semibold h-8 flex items-center justify-center gap-1.5">
          Start tier {tier.tier} <ArrowRight className="h-3.5 w-3.5" />
        </div>
      )}
    </Link>
  );
}

export default Identity;
