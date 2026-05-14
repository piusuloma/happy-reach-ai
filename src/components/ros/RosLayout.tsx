import { ReactNode } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  AlertTriangle,
  Banknote,
  Users,
  BarChart3,
  Wifi,
  ChefHat,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { identity } from "@/data/identity";
import { totalVarianceNgn, formatNgn } from "@/data/ros";

const nav = [
  { to: "/ros",            label: "Today",      icon: LayoutDashboard, end: true },
  { to: "/ros/inventory",  label: "Inventory",  icon: Boxes },
  { to: "/ros/variances",  label: "Variances",  icon: AlertTriangle },
  { to: "/ros/cash",       label: "Cash",       icon: Banknote },
  { to: "/ros/staff",      label: "Staff",      icon: Users },
  { to: "/ros/reports",    label: "Reports",    icon: BarChart3 },
];

export function RosLayout({ children, title, subtitle, actions }: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { pathname } = useLocation();
  const variance = totalVarianceNgn();

  return (
    <div className="ros-scope min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <ChefHat className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Restaurant OS</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">NativeID</div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map((item) => {
            const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.to === "/ros/variances" && variance > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary-foreground/20" : "bg-destructive/15 text-destructive"
                  }`}>3</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="rounded-lg bg-muted px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
            <Wifi className="h-3 w-3 text-success" />
            Synced 2 min ago
          </div>
          <Link
            to="/automations"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground px-1"
          >
            <ChevronLeft className="h-3 w-3" /> Back to NativeID
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 md:px-6 gap-3">
          <div className="md:hidden h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <ChefHat className="h-4 w-4" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-bold truncate">{identity.businessName}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Verified · {identity.city}
            </div>
          </div>
          <div className="ml-auto text-[11px] text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden order-last fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border grid grid-cols-6 h-14">
          {nav.map((item) => {
            const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1280px] w-full mx-auto pb-20 md:pb-8">
          {(title || actions) && (
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <div>
                {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatBox({
  label, value, hint, tone = "default",
}: { label: string; value: string; hint?: string; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneCls = {
    default: "border-border",
    success: "border-success/40 bg-success/5",
    warning: "border-warning/40 bg-warning/5",
    danger:  "border-destructive/40 bg-destructive/5",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 bg-card ${toneCls}`}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export { formatNgn } from "@/data/ros";
