import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthShell } from "@/components/identity/AuthShell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  ArrowRight,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  ensureAccount,
  formatPhone,
  issueResetToken,
  sendOtp,
  signIn,
  verifyOtp,
  type Channel,
  type OtpPurpose,
} from "@/lib/auth";

const RESEND_SECONDS = 30;

const channelMeta = {
  sms: {
    label: "SMS",
    icon: Smartphone,
    headerNote: "via SMS",
    banner: "Check your SMS messages",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    headerNote: "on WhatsApp",
    banner: "Check WhatsApp",
  },
} as const;

const Otp = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get("phone") || "";
  const mode = (params.get("mode") || "signup") as OtpPurpose;
  const next = params.get("next");
  const initialChannel = (params.get("channel") as Channel) || "sms";

  const [channel, setChannel] = useState<Channel>(initialChannel);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const meta = channelMeta[channel];
  const otherChannel: Channel = channel === "sms" ? "whatsapp" : "sms";
  const otherMeta = channelMeta[otherChannel];

  const resend = (via: Channel) => {
    const state = sendOtp(phone, via, mode);
    setChannel(via);
    setCode("");
    setSeconds(RESEND_SECONDS);
    toast.success(
      via === "sms"
        ? `New SMS sent. Demo code: ${state.code}`
        : `New WhatsApp code sent. Demo code: ${state.code}`,
    );
  };

  const openWhatsAppDeepLink = () => {
    // User-initiated click-to-chat fallback when templates aren't available.
    // In production this prefills the business number + a session token.
    const url = `https://wa.me/2348000000000?text=${encodeURIComponent(
      `Send code for ${phone}`,
    )}`;
    window.open(url, "_blank", "noopener");
    if (channel !== "whatsapp") resend("whatsapp");
  };

  const submit = (value: string) => {
    if (value.length !== 6 || submitting) return;
    setSubmitting(true);
    const result = verifyOtp(value);

    if (!result.ok) {
      if (result.reason === "expired") {
        toast.error("Code expired. Request a new one.");
        setSeconds(0);
      } else if (result.reason === "locked") {
        toast.error("Too many attempts. Try again in 10 minutes.");
      } else {
        toast.error(
          `Wrong code. ${result.attemptsLeft} attempt${
            result.attemptsLeft === 1 ? "" : "s"
          } left.`,
        );
      }
      setCode("");
      setSubmitting(false);
      return;
    }

    if (mode === "reset") {
      issueResetToken(phone);
      toast.success("Verified. Create a new password.");
      nav(`/auth/set-password?phone=${encodeURIComponent(phone)}`);
      return;
    }

    ensureAccount(phone);
    if (mode === "signup") {
      signIn();
      toast.success("Welcome to NativeID 🎉");
      nav("/auth/profile");
      return;
    }

    // login
    signIn();
    toast.success("Welcome back");
    nav(next || "/");
  };

  const ChannelIcon = meta.icon;
  const OtherIcon = otherMeta.icon;

  return (
    <AuthShell
      step={{ current: 2, total: mode === "signup" ? 3 : 2 }}
      title="Enter your code"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{formatPhone(phone)}</span>{" "}
          {meta.headerNote}.
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-primary/20 bg-accent p-3.5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <ChannelIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-accent-foreground">
              {meta.banner}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              On this device, iOS QuickType and Android Autofill will surface
              the code automatically.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) submit(v);
            }}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-xl border border-input bg-background text-2xl font-bold font-display tabular-nums first:rounded-l-xl last:rounded-r-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground tabular-nums">
            {seconds > 0 ? `Resend in ${seconds}s` : "Didn't get it?"}
          </span>
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => resend(channel)}
            className="flex items-center gap-1.5 text-primary font-medium disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Resend {meta.label}
          </button>
        </div>

        {seconds === 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              otherChannel === "whatsapp"
                ? openWhatsAppDeepLink()
                : resend(otherChannel)
            }
            className={
              otherChannel === "whatsapp"
                ? "w-full h-11 rounded-xl border-[#25D366]/40 text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#128C7E]"
                : "w-full h-11 rounded-xl"
            }
          >
            <OtherIcon className="h-4 w-4" />
            Send code via {otherMeta.label} instead
          </Button>
        )}

        <Button
          onClick={() => submit(code)}
          disabled={code.length !== 6 || submitting}
          className="w-full h-12 rounded-xl grad-primary text-primary-foreground border-0 shadow-[var(--shadow-glow)]"
        >
          <ShieldCheck className="h-4 w-4" />
          Verify and continue
          <ArrowRight className="h-4 w-4" />
        </Button>

        {channel === "sms" && seconds > 0 && (
          <button
            type="button"
            onClick={openWhatsAppDeepLink}
            className="block w-full text-center text-xs text-[#128C7E] font-medium hover:underline"
          >
            Get code on WhatsApp instead →
          </button>
        )}

        <Link
          to={
            mode === "signup"
              ? "/auth/signup"
              : mode === "reset"
                ? "/auth/login"
                : "/auth/login"
          }
          className="block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Use a different number
        </Link>
      </div>
    </AuthShell>
  );
};

export default Otp;
