import { AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { identity } from "@/data/identity";
import { cn } from "@/lib/utils";

export function MigrationBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !identity.emailLegacy) return null;

  const days = identity.daysSinceMigrationPrompt ?? 0;
  const daysLeft = Math.max(0, 30 - days);
  const urgent = daysLeft <= 7;

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 flex items-center gap-3 mb-4",
        urgent
          ? "border-warning/30 bg-warning/5 text-warning-foreground"
          : "border-primary/20 bg-accent text-accent-foreground",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          urgent ? "bg-warning/20 text-warning" : "bg-primary/15 text-primary",
        )}
      >
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">
          {urgent ? `Add your mobile number — ${daysLeft} days until read-only mode` : "Secure your account with your mobile number"}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          You signed up with {identity.emailLegacy}. Mobile-first sign-in is faster and works on any device.
        </p>
      </div>
      <Button asChild size="sm" className="rounded-xl grad-primary text-primary-foreground border-0">
        <Link to="/auth/link-mobile">Link my number<ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
