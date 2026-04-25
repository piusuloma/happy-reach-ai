import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatPhone,
  hasPassword,
  sendOtp,
  signIn,
  verifyPassword,
} from "@/lib/auth";

const MAX_ATTEMPTS = 5;

const Password = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!phone || !hasPassword(phone)) {
    return (
      <AuthShell title="Welcome back" subtitle="Redirecting…">
        <Link
          to="/auth/login"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to login
        </Link>
      </AuthShell>
    );
  }

  const submit = () => {
    if (!password) return;
    if (verifyPassword(phone, password)) {
      signIn();
      toast.success("Welcome back");
      nav("/");
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setPassword("");
    if (next >= MAX_ATTEMPTS) {
      toast.error(
        "Too many attempts. Reset your password to continue.",
      );
      startReset();
      return;
    }
    toast.error(
      `Wrong password. ${MAX_ATTEMPTS - next} attempt${
        MAX_ATTEMPTS - next === 1 ? "" : "s"
      } left.`,
    );
  };

  const startReset = () => {
    const state = sendOtp(phone, "sms", "reset");
    toast.success(`Reset code sent via SMS. Demo code: ${state.code}`);
    nav(
      `/auth/otp?phone=${encodeURIComponent(phone)}&mode=reset&channel=sms`,
    );
  };

  return (
    <AuthShell
      step={{ current: 2, total: 2 }}
      title="Enter your password"
      subtitle={
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">
            {formatPhone(phone)}
          </span>
          <Link
            to="/auth/login"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            edit
          </Link>
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
        {/* Hidden phone field lets password managers save the credential under the phone identity. */}
        <input
          type="hidden"
          name="username"
          autoComplete="username"
          value={phone}
          readOnly
        />

        <div>
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Password
          </Label>
          <div className="mt-1.5 relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <Button
          type="submit"
          disabled={!password}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Button>

        <button
          type="button"
          onClick={startReset}
          className="block w-full text-center text-sm text-primary font-medium hover:underline"
        >
          Forgot password?
        </button>
      </form>
    </AuthShell>
  );
};

export default Password;
