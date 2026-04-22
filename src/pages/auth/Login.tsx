import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

const Login = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const valid = phone.replace(/\D/g, "").length >= 10;

  return (
    <AuthShell
      step={{ current: 1, total: 2 }}
      title="Welcome back"
      subtitle="Enter your mobile number — we'll send a one-time code to your WhatsApp."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          nav(`/auth/otp?phone=${encodeURIComponent(phone)}&mode=login`);
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mobile number
          </Label>
          <div className="mt-1.5 flex items-center rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
            <span className="pl-3.5 pr-2 text-sm text-muted-foreground border-r border-border h-12 flex items-center font-medium">
              🇳🇬 +234
            </span>
            <input
              id="phone"
              inputMode="tel"
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
          <MessageCircle className="h-4 w-4" />
          Send WhatsApp OTP
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="text-center pt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/auth/signup" className="text-primary font-medium hover:underline">
              Create your NativeID
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Signed up with email before April 2026?{" "}
            <Link to="/auth/link-mobile" className="text-primary hover:underline">
              Link your number
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Login;
