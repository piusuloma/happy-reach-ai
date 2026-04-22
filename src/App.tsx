import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Campaigns from "./pages/Campaigns";
import NewCampaign from "./pages/NewCampaign";
import Contacts from "./pages/Contacts";
import Flows from "./pages/Flows";
import Inbox from "./pages/Inbox";
import Stock from "./pages/Stock";
import Api from "./pages/Api";
import Shipment from "./pages/Shipment";
import Ai from "./pages/Ai";
import Identity from "./pages/identity/Identity";
import Verify from "./pages/identity/Verify";
import Wallet from "./pages/identity/Wallet";
import PublicProfile from "./pages/identity/PublicProfile";
import SsoDemo from "./pages/identity/SsoDemo";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Otp from "./pages/auth/Otp";
import Profile from "./pages/auth/Profile";
import LinkMobile from "./pages/auth/LinkMobile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth — no sidebar, focused single-task shell */}
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/otp" element={<Otp />} />
          <Route path="/auth/profile" element={<Profile />} />
          <Route path="/auth/link-mobile" element={<LinkMobile />} />

          {/* Public customer verification — zero chrome */}
          <Route path="/id/:handle" element={<PublicProfile />} />

          {/* SSO consent — auth shell */}
          <Route path="/sso/demo" element={<SsoDemo />} />

          {/* Merchant app (SSO unifies Identity + Automation) */}
          <Route path="/" element={<Index />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/identity/verify" element={<Verify />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/api" element={<Api />} />
          <Route path="/shipment" element={<Shipment />} />
          <Route path="/ai" element={<Ai />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
