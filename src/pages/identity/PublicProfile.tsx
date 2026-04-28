import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  identity,
  publicVerificationEvents,
  merchantProducts,
  merchantSocials,
  merchantBio,
  merchantHours,
  bandFor,
  type Tier,
} from "@/data/identity";
import { VerifiedBadge } from "@/components/identity/VerifiedBadge";
import { TrustScoreRing } from "@/components/identity/TrustScoreRing";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Facebook,
  Flag,
  Globe,
  Info,
  Instagram,
  MapPin,
  MessageCircle,
  Minus,
  Music2,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

type TabKey = "menu" | "profile" | "qr";

const socialIcon = (platform: string) => {
  switch (platform) {
    case "WhatsApp": return MessageCircle;
    case "Instagram": return Instagram;
    case "Facebook": return Facebook;
    case "TikTok": return Music2;
    default: return Globe;
  }
};

const PublicProfile = () => {
  const { handle } = useParams();
  const businessHandle = handle || identity.handle;
  const band = bandFor(identity.trustScore);
  const [tab, setTab] = useState<TabKey>("menu");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const adjust = (id: string, delta: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border px-4 h-12 flex items-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <div className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> NativeID Verified
        </div>
      </div>

      <div className="max-w-md mx-auto pb-12">

        {/* ── Business identity header ── */}
        <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full grad-emerald flex items-center justify-center text-white font-display font-bold text-2xl shadow-[var(--shadow-md)] mb-3">
            MK
          </div>
          <h1 className="font-display text-xl font-bold leading-tight">{identity.businessName}</h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" /> {identity.city}, {identity.state}
            <span className="mx-1">·</span>
            <span>{identity.category}</span>
          </div>
          <div className="mt-3">
            <VerifiedBadge tier={identity.tier} size="lg" />
          </div>
        </div>

        {/* ── Verification info — always visible ── */}
        <div className="mx-4 rounded-2xl border border-primary/25 bg-primary/5 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">What was verified</span>
          </div>
          <ul className="space-y-2.5">
            {publicVerificationEvents.map((e) => (
              <li key={e.label} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-snug">{e.label}</div>
                  {e.detail && (
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{e.detail}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-0.5">{e.at}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-primary/15 flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Always check this badge before you pay.</strong> If you find an account claiming to be {identity.businessName} that doesn't show this badge, tap "Report" below.
            </p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mx-4 mb-4 surface-card p-1 flex gap-1 sticky top-12 z-10">
          {([
            { key: "menu" as TabKey, label: "Menu", icon: null },
            { key: "qr" as TabKey, label: "QR Code", icon: null },
            { key: "profile" as TabKey, label: "Profile", icon: null },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all ${
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-md)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Menu tab ── */}
        {tab === "menu" && (
          <div className="px-4 space-y-0 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-base">
                🍽 Menu
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {merchantProducts.filter((p) => p.available).length} items available
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Tap + to add items, then message {identity.businessName} on WhatsApp to order.
            </p>

            <div className="surface-card divide-y divide-border overflow-hidden">
              {merchantProducts.map((p) => {
                const qty = quantities[p.id] ?? 0;
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center text-2xl shrink-0">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">{p.description}</div>
                      <div className="text-sm font-bold text-primary mt-0.5">
                        ₦{p.price.toLocaleString()}{p.unit ? <span className="text-[10px] font-normal text-muted-foreground ml-1">{p.unit}</span> : null}
                      </div>
                    </div>
                    {p.available ? (
                      <div className="flex items-center gap-2 shrink-0">
                        {qty > 0 && (
                          <button
                            type="button"
                            title="Remove one"
                            onClick={() => adjust(p.id, -1)}
                            className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="w-4 text-center text-sm font-bold tabular-nums">{qty}</span>
                        )}
                        <button
                          type="button"
                          title="Add one"
                          onClick={() => adjust(p.id, 1)}
                          className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
                        Pre-order
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── QR Code tab ── */}
        {tab === "qr" && (
          <div className="px-4 animate-fade-in">
            <div className="surface-card p-6 flex flex-col items-center gap-4 text-center">
              <div className="h-48 w-48 rounded-2xl bg-muted flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground/40" />
              </div>
              <div>
                <div className="font-display font-bold text-base">{identity.businessName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">nativeid.io/{businessHandle}</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Scan this code to instantly open {identity.businessName}'s verified NativeID profile.
              </p>
              <Button className="w-full rounded-xl grad-primary text-primary-foreground border-0">
                Download QR Code
              </Button>
            </div>
          </div>
        )}

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <div className="px-4 space-y-4 animate-fade-in">
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-base">About</h2>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{merchantBio}</p>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-display font-bold text-base">Opening hours</h2>
              </div>
              <ul className="space-y-2">
                {merchantHours.map((h) => (
                  <li key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium tabular-nums">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card p-5">
              <h2 className="font-display font-bold text-base mb-3">Verified channels</h2>
              <div className="space-y-2">
                {merchantSocials.map((s) => {
                  const Icon = socialIcon(s.platform);
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/40 transition-all"
                    >
                      <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {s.platform}
                        </div>
                        <div className="text-sm font-medium truncate flex items-center gap-1.5">
                          {s.handle}
                          {s.verified && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </a>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Verified channels are confirmed by NativeID. Anything else claiming to be {identity.businessName} is an impersonator.
              </p>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="grid grid-cols-2 gap-3 mt-6 px-4">
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
