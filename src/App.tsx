import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuditWizard from "./pages/AuditWizard";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import SolarLead from "./pages/SolarLead";
import SiteVisit from "./pages/SiteVisit";
import SolarReport from "./pages/SolarReport";
import SolarPotential from "./pages/SolarPotential";
import Plan from "./pages/Plan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lead" element={<SolarLead />} />
          <Route path="/site-visit/:leadId" element={<SiteVisit />} />
          <Route path="/solar-report/:leadId" element={<SolarReport />} />
          <Route path="/solar/:id" element={<SolarPotential />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/audit" element={<AuditWizard />} />
          <Route path="/results/:id" element={<Results />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
