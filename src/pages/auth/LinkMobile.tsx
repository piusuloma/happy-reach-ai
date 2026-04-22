import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";

const LinkMobile = () => {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const valid = phone.replace(/\D/g, "").length >= 10;

  return (
    <AuthShell
      step={{ current: 1, total: 2 }}
      title="Link your mobile number"
      subtitle="You signed up with email. Add your number to keep full access and use NativeID on any device."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          nav(`/auth/otp?phone=${encodeURIComponent(phone)}&mode=link&next=/identity`);
        }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-primary/20 bg-accent p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Nothing changes — your data stays put
          </div>
          <ul className="text-[11px] text-muted-foreground mt-2 space-y-1 leading-relaxed">
            <li>• Profile, orders, and badges remain intact</li>
            <li>• Email becomes your backup recovery method</li>
            <li>• Mobile OTP becomes your primary login</li>
          </ul>
        </div>

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
          Send OTP to WhatsApp
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  );
};

export default LinkMobile;
