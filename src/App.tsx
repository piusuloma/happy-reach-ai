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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
