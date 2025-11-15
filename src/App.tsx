import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Issues from "./pages/Issues";
import IssueDetail from "./pages/IssueDetail";
import Organizations from "./pages/Organizations";
import Trending from "./pages/Trending";
import Submit from "./pages/Submit";
import Auth from "./pages/Auth";
import MapView from "./pages/MapView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
