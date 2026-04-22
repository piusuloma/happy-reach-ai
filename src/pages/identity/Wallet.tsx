import { AppLayout, PageHeader } from "@/components/AppLayout";
import { walletTransactions, identity } from "@/data/identity";
import { VerifiedBadge } from "@/components/identity/VerifiedBadge";
import {
  ArrowDownLeft,
  CheckCircle2,
  Search,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";

const Wallet = () => {
  const verifiedTotal = walletTransactions
    .filter((t) => t.amount)
    .reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <AppLayout>
      <PageHeader
        title="Customer wallet"
        subtitle="A consumer-facing view of how customers see their NativeID wallet — every verified business they've transacted with."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Wallet feed */}
        <div className="surface-card p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold">Verified transactions</h3>
            </div>
            <span className="text-[10px] font-semibold text-info bg-info/10 px-2 py-0.5 rounded-full">Phase 2</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Every transaction with a NativeID-verified business is recorded with proof of identity.
          </p>

          <div className="mt-4 divide-y divide-border">
            {walletTransactions.map((t) => (
              <div key={t.id} className="py-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  {t.type === "verification-check" ? (
                    <Search className="h-4 w-4 text-primary" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{t.business}</div>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    @{t.handle} · {t.at}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {t.amount ? (
                    <div className="font-display font-bold tabular-nums">₦{t.amount.toLocaleString()}</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Verification check</div>
                  )}
                  <div className="text-[10px] uppercase tracking-wider text-success font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="h-3 w-3" /> {t.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side */}
        <div className="space-y-4">
          <div className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Verified spend</div>
            <div className="font-display text-2xl font-bold mt-1">₦{verifiedTotal.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">across {walletTransactions.filter(t => t.amount).length} businesses</div>
          </div>

          <div className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">My identity</div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl grad-primary flex items-center justify-center text-white font-bold">
                MK
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{identity.businessName}</div>
                <div className="text-[11px] text-muted-foreground">{identity.mobile}</div>
              </div>
            </div>
            <div className="mt-3">
              <VerifiedBadge tier={identity.tier} size="sm" />
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Why this matters</div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              The wallet builds a portable trust history. The more verified transactions a customer logs, the higher their own trust signal becomes — useful for lenders, marketplaces, and escrow providers.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Wallet;
