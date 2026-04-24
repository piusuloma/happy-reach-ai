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
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatPhone,
  hasPassword,
  sendOtp,
  signIn,
  verifyPassword,
  type Channel,
} from "@/lib/auth";

const Password = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!phone || !hasPassword(phone)) {
    // No password on file — send through OTP instead of stranding the user here.
    return (
      <AuthShell title="Welcome back" subtitle="Redirecting to one-time code…">
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
    if (next >= 4) {
      toast.error("Too many attempts. Use a one-time code to continue.");
      const state = sendOtp(phone, "sms", "login");
      toast.success(`SMS sent. Demo code: ${state.code}`);
      nav(
        `/auth/otp?phone=${encodeURIComponent(phone)}&mode=login&channel=sms`,
      );
      return;
    }
    toast.error(`Wrong password. ${4 - next} attempt${4 - next === 1 ? "" : "s"} left.`);
  };

  const otpLogin = (channel: Channel) => {
    const state = sendOtp(phone, channel, "login");
    toast.success(
      channel === "sms"
        ? `SMS sent. Demo code: ${state.code}`
        : `WhatsApp message sent. Demo code: ${state.code}`,
    );
    nav(
      `/auth/otp?phone=${encodeURIComponent(phone)}&mode=login&channel=${channel}`,
    );
  };

  const forgotPassword = () => {
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
          onClick={forgotPassword}
          className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            or use a one-time code
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => otpLogin("sms")}
            className="h-11 rounded-xl"
          >
            <Smartphone className="h-4 w-4" />
            SMS
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => otpLogin("whatsapp")}
            className="h-11 rounded-xl border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#128C7E]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </form>
    </AuthShell>
  );
};

export default Password;
