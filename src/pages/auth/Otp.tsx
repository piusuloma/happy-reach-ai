import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Otp = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";
  const mode = params.get("mode") || "signup";
  const next = params.get("next");

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(45);
  const [attempts, setAttempts] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const code = digits.join("");

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const submit = () => {
    if (code.length !== 6) return;
    // demo: any 6 digits work, except "000000" simulates failure
    if (code === "000000") {
      const left = 2 - attempts;
      setAttempts(attempts + 1);
      if (left <= 0) {
        toast.error("Too many attempts. Try again in 10 minutes.");
      } else {
        toast.error(`Wrong code. ${left} attempt${left === 1 ? "" : "s"} left.`);
      }
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
      return;
    }
    toast.success(mode === "signup" ? "Welcome to NativeID 🎉" : "Welcome back");
    nav(mode === "signup" ? "/auth/profile" : next || "/identity");
  };

  return (
    <AuthShell
      step={{ current: 2, total: mode === "signup" ? 3 : 2 }}
      title="Enter your code"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-medium text-foreground">+234 {phone}</span> via WhatsApp.
        </>
      as any
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-primary/20 bg-accent p-3.5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-accent-foreground">Check WhatsApp</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Demo: type any 6 digits. Use <code className="font-mono">000000</code> to test the wrong-code flow.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-xl border border-input bg-background text-center text-2xl font-bold font-display tabular-nums focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {seconds > 0 ? `Resend in ${seconds}s` : "Didn't get it?"}
          </span>
          <button
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(45);
              toast.success("New code sent to WhatsApp");
            }}
            className="flex items-center gap-1.5 text-primary font-medium disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Resend
          </button>
        </div>

        <Button
          onClick={submit}
          disabled={code.length !== 6}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          <ShieldCheck className="h-4 w-4" />
          Verify and continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Link
          to={mode === "signup" ? "/auth/signup" : "/auth/login"}
          className="block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Use a different number
        </Link>
      </div>
    </AuthShell>
  );
};

export default Otp;
