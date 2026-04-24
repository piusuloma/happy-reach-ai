import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  consumeResetToken,
  formatPhone,
  resetTokenValidFor,
  scorePassword,
  setPassword,
  signIn,
} from "@/lib/auth";

const strengthColors = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-primary",
  "bg-success",
];

type Mode = "signup" | "reset";

const SetPasswordPage = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";
  const mode = ((params.get("mode") as Mode) || "reset") as Mode;

  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Both flows require a fresh OTP verification — if someone deep-links here
    // without that state, bounce them back to the appropriate start.
    if (!phone || !resetTokenValidFor(phone)) {
      toast.error("Your session expired. Verify your number again.");
      nav(mode === "signup" ? "/auth/signup" : "/auth/login", { replace: true });
    }
  }, [phone, mode, nav]);

  const strength = scorePassword(pw);
  const canSubmit = pw.length >= 8 && strength.score >= 2 && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    if (!consumeResetToken(phone)) {
      toast.error("Session expired. Verify your number again.");
      nav(mode === "signup" ? "/auth/signup" : "/auth/login", { replace: true });
      return;
    }
    setPassword(phone, pw);

    if (mode === "signup") {
      // User is already signed in from the OTP step. Continue to profile.
      toast.success("Password saved. One more step.");
      nav("/auth/profile");
      return;
    }

    // reset: password is set — sign the user in and send them to the dashboard.
    signIn();
    toast.success("Password updated. You're signed in.");
    nav("/", { replace: true });
  };

  const title =
    mode === "signup" ? "Create a password" : "Set a new password";
  const subtitle =
    mode === "signup" ? (
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        For{" "}
        <span className="font-medium text-foreground">
          {formatPhone(phone)}
        </span>
        . You'll use this to sign in alongside SMS or WhatsApp codes.
      </span>
    ) : (
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        For{" "}
        <span className="font-medium text-foreground">
          {formatPhone(phone)}
        </span>
        . Pick something you'll remember.
      </span>
    );

  return (
    <AuthShell
      step={mode === "signup" ? { current: 3, total: 4 } : undefined}
      title={title}
      subtitle={subtitle}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <input
          type="hidden"
          name="username"
          autoComplete="username"
          value={phone}
          readOnly
        />

        <div>
          <Label
            htmlFor="new-password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {mode === "signup" ? "Password" : "New password"}
          </Label>
          <div className="mt-1.5 relative">
            <input
              id="new-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full h-12 pl-3.5 pr-11 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring text-base"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.score
                    ? strengthColors[strength.score]
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Strength</span>
            <span
              className={
                strength.score >= 3
                  ? "text-success font-medium"
                  : strength.score === 2
                    ? "text-warning font-medium"
                    : "text-destructive font-medium"
              }
            >
              {pw ? strength.label : "Enter a password"}
            </span>
          </div>
          <ul className="space-y-1 pt-1">
            {strength.checks.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-2 text-[11px] text-muted-foreground"
              >
                {c.passed ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={c.passed ? "text-foreground" : ""}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          {mode === "signup" ? "Save and continue" : "Save password"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          Passwords are stored hashed. You can still sign in any time with a
          one-time code on SMS or WhatsApp.
        </p>
      </form>
    </AuthShell>
  );
};

export default SetPasswordPage;
