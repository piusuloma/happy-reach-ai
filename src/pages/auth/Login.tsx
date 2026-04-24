import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { hasPassword, normalizePhone, sendOtp } from "@/lib/auth";

const Login = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const valid = normalizePhone(phone).length >= 10;

  /**
   * Account-existence-neutral: we always advance forward. If a password is on
   * file, surface the password screen. If not (rare — account was never
   * completed), silently route through the reset flow to set one up. OTP is
   * never offered as an alternative login — it is reserved for password reset.
   */
  const submit = () => {
    if (!valid) return;
    if (hasPassword(phone)) {
      nav(`/auth/password?phone=${encodeURIComponent(phone)}`);
      return;
    }
    const state = sendOtp(phone, "sms", "reset");
    toast.success(`Verification code sent via SMS. Demo code: ${state.code}`);
    nav(
      `/auth/otp?phone=${encodeURIComponent(phone)}&mode=reset&channel=sms`,
    );
  };

  return (
    <AuthShell
      step={{ current: 1, total: 2 }}
      title="Welcome back"
      subtitle="Enter your mobile number to continue."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <div>
          <Label
            htmlFor="phone"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Mobile number
          </Label>
          <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
            <span className="pl-3.5 pr-2 text-sm text-muted-foreground border-r border-border h-12 flex items-center font-medium">
              🇳🇬 +234
            </span>
            <input
              id="phone"
              inputMode="tel"
              autoComplete="tel-national"
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="803 421 0099"
              className="flex-1 h-12 px-3 bg-transparent outline-none text-base"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!valid}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="text-center pt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            New here?{" "}
            <Link
              to="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              Create your NativeID
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Signed up with email before April 2026?{" "}
            <Link
              to="/auth/link-mobile"
              className="text-primary hover:underline"
            >
              Link your number
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;
