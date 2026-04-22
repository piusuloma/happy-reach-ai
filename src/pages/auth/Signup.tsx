import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";

const Signup = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const valid = phone.replace(/\D/g, "").length >= 10;

  return (
    <AuthShell
      step={{ current: 1, total: 3 }}
      title="Create your NativeID"
      subtitle="One mobile number — one identity. No email, no password."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          nav(`/auth/otp?phone=${encodeURIComponent(phone)}&mode=signup`);
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

        <ul className="space-y-2.5 pt-2">
          {[
            "OTP arrives on WhatsApp in seconds",
            "Tier 1 verified badge issued immediately",
            "Same login works across every NativeID product",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
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
          <MessageCircle className="h-4 w-4" />
          Send WhatsApp OTP
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Signup;
