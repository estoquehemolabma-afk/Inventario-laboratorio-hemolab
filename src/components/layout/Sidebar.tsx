import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  HardDrive, 
  FileText, 
  Settings,
  ChevronLeft,
  Menu,
  Activity,
  Headphones,
  BarChart3,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logoGota from '@/assets/logogota.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Unidades', path: '/unidades' },
  { icon: HardDrive, label: 'Equipamentos', path: '/equipamentos' },
  { icon: Headphones, label: 'Suporte', path: '/suporte' },
  { icon: BarChart3, label: 'Relatórios Suporte', path: '/relatorios-suporte' },
  { icon: FileText, label: 'Relatórios Inventário', path: '/relatorios' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 80, x: 0 }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50 gradient-sidebar border-r border-sidebar-border",
          "lg:relative lg:translate-x-0",
          !isOpen && "max-lg:-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
            <motion.div className="flex items-center gap-3" animate={{ opacity: isOpen ? 1 : 0 }}>
              {isOpen && (
                <>
                  <img src={logoGota} alt="Hemolab Logo" className="w-10 h-10 object-contain" style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }} />
                  <div>
                    <h1 className="font-display font-bold text-sidebar-foreground text-lg">
                      Inventário
                    </h1>
                    <p className="text-xs text-sidebar-foreground/60">Estoques & Solicitações</p>
                  </div>
                </>
              )}
            </motion.div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
            >
              {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {isOpen && (
            <div className="p-4 border-t border-sidebar-border space-y-3">
              <div className="bg-sidebar-accent rounded-xl p-4">
                <p className="text-xs text-sidebar-foreground/60 mb-1">Logado como</p>
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'Admin'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          )}
          {!isOpen && (
            <div className="p-4 border-t border-sidebar-border flex justify-center">
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
