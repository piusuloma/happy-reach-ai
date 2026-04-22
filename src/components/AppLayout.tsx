import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, ShieldCheck, BadgeCheck, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { business } from "@/data/mock";
import { identity } from "@/data/identity";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="h-9 w-9 rounded-xl grad-emerald flex items-center justify-center text-white font-bold text-sm">M</div>
              <div className="leading-tight">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  {business.name}
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">nativeid.io/{business.handle}</div>
              </div>
            </div>
            <div className="flex-1 max-w-md mx-auto hidden lg:block">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search campaigns, contacts, identity…" className="pl-9 bg-muted/50 border-0 h-10 rounded-xl" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-xs font-bold">EI</div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="font-normal py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">Signed in via NativeID SSO</span>
                    </div>
                    <div className="text-sm font-bold">{identity.businessName}</div>
                    <div className="text-[11px] text-muted-foreground">{identity.mobile}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/identity"><BadgeCheck className="h-4 w-4" /> My identity</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/id/${identity.handle}`} target="_blank"><ExternalLink className="h-4 w-4" /> View public profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      sessionStorage.removeItem("nativeid_session");
                      nav("/auth/login");
                    }}
                    className="text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Log out everywhere
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
