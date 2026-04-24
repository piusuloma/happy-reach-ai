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

const SetPasswordPage = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";

  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Guard: reset flow requires a fresh OTP verification. If someone deep-links
    // here without that, bounce them back to login.
    if (!phone || !resetTokenValidFor(phone)) {
      toast.error("Your session expired. Verify your number again.");
      nav("/auth/login", { replace: true });
    }
  }, [phone, nav]);

  const strength = scorePassword(pw);
  const canSubmit = pw.length >= 8 && strength.score >= 2 && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    if (!consumeResetToken(phone)) {
      toast.error("Session expired. Verify your number again.");
      nav("/auth/login", { replace: true });
      return;
    }
    setPassword(phone, pw);
    signIn();
    toast.success("Password saved. You're signed in.");
    nav("/", { replace: true });
  };

  return (
    <AuthShell
      title="Create a password"
      subtitle={
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          For{" "}
          <span className="font-medium text-foreground">
            {formatPhone(phone)}
          </span>
          . Use this next time for faster sign-in.
        </span>
      }
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
            New password
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
          Save password
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
