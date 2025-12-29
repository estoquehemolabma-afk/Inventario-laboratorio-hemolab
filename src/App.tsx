import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./contexts/InventoryContext";
import Dashboard from "./pages/Dashboard";
import UBSDetail from "./pages/UBSDetail";
import UnidadesPage from "./pages/UnidadesPage";
import EquipamentosPage from "./pages/EquipamentosPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InventoryProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ubs/:id" element={<UBSDetail />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/equipamentos" element={<EquipamentosPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/configuracoes" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
