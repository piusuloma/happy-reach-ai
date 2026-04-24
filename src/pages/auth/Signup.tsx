import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { sendOtp, normalizePhone, type Channel } from "@/lib/auth";

const Signup = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const valid = normalizePhone(phone).length >= 10;

  const go = (channel: Channel) => {
    if (!valid) return;
    const state = sendOtp(phone, channel, "signup");
    toast.success(
      channel === "sms"
        ? `SMS sent. Demo code: ${state.code}`
        : `WhatsApp message sent. Demo code: ${state.code}`,
    );
    nav(
      `/auth/otp?phone=${encodeURIComponent(phone)}&mode=signup&channel=${channel}`,
    );
  };

  return (
    <AuthShell
      step={{ current: 1, total: 3 }}
      title="Create your NativeID"
      subtitle="One mobile number — one identity. We'll verify it with a one-time code."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go("sms");
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

        <ul className="space-y-2.5 pt-1">
          {[
            "Code arrives via SMS in seconds",
            "Didn't get it? Switch to WhatsApp with one tap",
            "Tier 1 verified badge issued immediately",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {t}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={!valid}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] text-[15px]"
        >
          <Smartphone className="h-4 w-4" />
          Send code via SMS
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={!valid}
          onClick={() => go("whatsapp")}
          className="w-full h-12 rounded-xl border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#128C7E] text-[15px]"
        >
          <MessageCircle className="h-4 w-4" />
          Continue with WhatsApp
        </Button>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed pt-1">
          By continuing you agree to our Terms and Privacy Policy. Message rates
          may apply.
        </p>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;
