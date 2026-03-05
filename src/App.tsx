import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./contexts/InventoryContext";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import UBSDetail from "./pages/UBSDetail";
import UnidadesPage from "./pages/UnidadesPage";
import EquipamentosPage from "./pages/EquipamentosPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import RelatoriosSuportePage from "./pages/RelatoriosSuportePage";
import SuportePage from "./pages/SuportePage";
import SolicitarSuportePage from "./pages/SolicitarSuportePage";
import AcompanharSuportePage from "./pages/AcompanharSuportePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <InventoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/unidade/:id" element={<UBSDetail />} />
              <Route path="/unidades" element={<UnidadesPage />} />
              <Route path="/equipamentos" element={<EquipamentosPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/relatorios-suporte" element={<RelatoriosSuportePage />} />
              <Route path="/suporte" element={<SuportePage />} />
              <Route path="/solicitar-suporte" element={<SolicitarSuportePage />} />
              <Route path="/acompanhar-suporte/:trackingCode" element={<AcompanharSuportePage />} />
              <Route path="/acompanhar-suporte" element={<AcompanharSuportePage />} />
              <Route path="/configuracoes" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
