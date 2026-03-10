import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "./contexts/InventoryContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AdminLoginPage from "./pages/AdminLoginPage";
import NotFound from "./pages/NotFound";
import UsuariosPage from "./pages/UsuariosPage";

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
              {/* Admin login */}
              <Route path="/admin-login" element={<AdminLoginPage />} />

              {/* Protected inventory routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/unidade/:id" element={<ProtectedRoute><UBSDetail /></ProtectedRoute>} />
              <Route path="/unidades" element={<ProtectedRoute><UnidadesPage /></ProtectedRoute>} />
              <Route path="/equipamentos" element={<ProtectedRoute><EquipamentosPage /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
              <Route path="/relatorios-suporte" element={<ProtectedRoute><RelatoriosSuportePage /></ProtectedRoute>} />
              <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />

              {/* Support - public auth */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/solicitar-suporte" element={<SolicitarSuportePage />} />
              <Route path="/acompanhar-suporte/:trackingCode" element={<AcompanharSuportePage />} />
              <Route path="/acompanhar-suporte" element={<AcompanharSuportePage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
