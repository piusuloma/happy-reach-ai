import { Megaphone, MessagesSquare, Inbox, Boxes, Code2, Truck, Sparkles, LayoutDashboard, Users, BadgeCheck, Wallet } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { ShieldCheck } from "lucide-react";

// Single shell — Identity sits ABOVE Automation because identity is the foundation users
// onboard into first. Wallet groups under Identity (it's a customer-side surface for the
// same user). Mental model: "Who I am" → "What I do".
const identitySection = [
  { title: "My Identity", url: "/identity", icon: BadgeCheck },
  { title: "Customer Wallet", url: "/wallet", icon: Wallet },
];
const phase1 = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
  { title: "Contacts", url: "/contacts", icon: Users },
];
const phase2 = [
  { title: "Chatbot Flows", url: "/flows", icon: MessagesSquare },
  { title: "Agent Inbox", url: "/inbox", icon: Inbox },
];
const phase3 = [
  { title: "Back in Stock", url: "/stock", icon: Boxes },
  { title: "Public API", url: "/api", icon: Code2 },
];
const phase4 = [
  { title: "Shipment Tracking", url: "/shipment", icon: Truck },
  { title: "AI Layer", url: "/ai", icon: Sparkles },
];

function Section({ label, items }: { label: string; items: typeof phase1 }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mt-2">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild className="h-10">
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 rounded-xl px-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="!bg-gradient-to-r !from-primary !to-primary-glow !text-primary-foreground shadow-[var(--shadow-md)]"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="font-medium">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grad-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-bold text-[15px]">NativeID</div>
              <div className="text-[11px] text-muted-foreground">Automation Engine</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <Section label="Identity" items={identitySection} />
        <Section label="Automation Engine" items={phase1} />
        <Section label="Conversations" items={phase2} />
        <Section label="Ecosystem" items={phase3} />
        <Section label="Future" items={phase4} />
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-accent p-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-accent-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified business
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Customers see the verified badge on every automated message you send.
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
