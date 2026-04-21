import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { business } from "@/data/mock";

export function AppLayout({ children }: { children: ReactNode }) {
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
                <Input placeholder="Search campaigns, contacts, flows…" className="pl-9 bg-muted/50 border-0 h-10 rounded-xl" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-xs font-bold">EI</div>
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
