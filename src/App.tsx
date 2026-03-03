import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Episodes from "./pages/Episodes";
import EpisodeDetail from "./pages/EpisodeDetail";
import UploadOASIS from "./pages/UploadOASIS";

import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import Admin from "./pages/Admin";
import ChatHistory from "./pages/ChatHistory";
import CareTools from "./pages/CareTools";
import PatientProgressionTool from "./pages/PatientProgressionTool";
import DischargeAssistantTool from "./pages/DischargeAssistantTool";
import ReadmissionsPredictorTool from "./pages/ReadmissionsPredictorTool";
import Tasks from "./pages/Tasks";
import Notes from "./pages/Notes";
import Interventions from "./pages/Interventions";
import Worklist from "./pages/Worklist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout>{({ onOpenChat }) => <Dashboard onOpenChat={onOpenChat} />}</AppLayout>} />
          <Route path="/patients" element={<AppLayout><Patients /></AppLayout>} />
          <Route path="/patients/:id" element={<AppLayout><PatientProfile /></AppLayout>} />
          <Route path="/patient-profile/:id" element={<AppLayout><PatientProfile /></AppLayout>} />
          <Route path="/episodes" element={<AppLayout><Episodes /></AppLayout>} />
          <Route path="/episodes/:id" element={<AppLayout><EpisodeDetail /></AppLayout>} />
          <Route path="/upload" element={<AppLayout><UploadOASIS /></AppLayout>} />
          
          <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
          <Route path="/chat-history" element={<AppLayout><ChatHistory /></AppLayout>} />
          <Route path="/insights" element={<AppLayout><Insights /></AppLayout>} />
          <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
          <Route path="/care-tools" element={<AppLayout><CareTools /></AppLayout>} />
          <Route path="/tools/patient-progression" element={<AppLayout><PatientProgressionTool /></AppLayout>} />
          <Route path="/tools/discharge-assistant" element={<AppLayout><DischargeAssistantTool /></AppLayout>} />
          <Route path="/tools/readmissions-predictor" element={<AppLayout><ReadmissionsPredictorTool /></AppLayout>} />
          <Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
          <Route path="/notes" element={<AppLayout><Notes /></AppLayout>} />
          <Route path="/interventions" element={<AppLayout><Interventions /></AppLayout>} />
          <Route path="/alerts" element={<AppLayout><Worklist /></AppLayout>} />
          <Route path="/worklist" element={<AppLayout><Worklist /></AppLayout>} />
          <Route path="/old" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
