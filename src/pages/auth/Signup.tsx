import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { sendOtp, normalizePhone, type Channel } from "@/lib/auth";

const Signup = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const valid = normalizePhone(phone).length >= 10;

  // WhatsApp is the default delivery channel. The OTP screen surfaces an SMS
  // fallback after 45s if the message hasn't arrived — keep that decision
  // off this screen so the form looks like every other phone-number sign-up.
  const go = (channel: Channel) => {
    if (!valid) return;
    // Stash the marketing opt-in so the account record can carry it forward
    // when ensureAccount runs after OTP verification.
    sessionStorage.setItem(
      "nativeid_marketing_opt_in",
      marketingOptIn ? "1" : "0",
    );
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
      step={{ current: 1, total: 4 }}
      title="Create your account"
      subtitle="Enter your phone number to get started."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go("whatsapp");
        }}
        className="space-y-5"
      >
        <div>
          <Label
            htmlFor="phone"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Phone number
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

        <label
          htmlFor="marketing-opt-in"
          className="flex items-start gap-2.5 cursor-pointer select-none"
        >
          <Checkbox
            id="marketing-opt-in"
            checked={marketingOptIn}
            onCheckedChange={(c) => setMarketingOptIn(c === true)}
            className="mt-0.5"
          />
          <span className="text-[12px] text-muted-foreground leading-relaxed">
            Send me product updates and tips from NativeID. Unsubscribe any
            time.
          </span>
        </label>

        <Button
          type="submit"
          disabled={!valid}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)] text-[15px]"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          By continuing you agree to our{" "}
          <Link to="#" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="#" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          . Message rates may apply.
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;
