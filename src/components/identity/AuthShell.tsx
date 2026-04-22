import { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  step?: { current: number; total: number };
  title: string;
  subtitle?: string;
}

export function AuthShell({ children, step, title, subtitle }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Soft brand background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-info/10 blur-3xl" />
      </div>

      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl grad-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-[15px]">NativeID</div>
            <div className="text-[10px] text-muted-foreground">Africa's identity layer</div>
          </div>
        </Link>
        {step && (
          <div className="text-xs text-muted-foreground tabular-nums">
            Step {step.current} of {step.total}
          </div>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {step && (
            <div className="flex gap-1.5 mb-6">
              {Array.from({ length: step.total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < step.current ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-muted-foreground">
        Protected by NativeID · Mobile-first identity for African businesses
      </footer>
    </div>
  );
}
