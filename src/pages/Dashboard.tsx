import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  HardDrive, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import UBSCard from '@/components/dashboard/UBSCard';
import UBSFormDialog from '@/components/dialogs/UBSFormDialog';
import { useInventory } from '@/contexts/InventoryContext';

const Dashboard: React.FC = () => {
  const { getAllSummaries, ubsList, equipmentList, selectedUBS, searchQuery } = useInventory();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const summaries = getAllSummaries();
  
  // Filter summaries based on selected UBS and search query
  const filteredSummaries = summaries.filter((summary) => {
    if (selectedUBS && summary.ubs.id !== selectedUBS) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        summary.ubs.name.toLowerCase().includes(query) ||
        summary.ubs.address.toLowerCase().includes(query) ||
        summary.ubs.responsible.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate totals
  const totalEquipment = equipmentList.length;
  const operationalEquipment = equipmentList.filter(eq => eq.conservationState === 'Funcionando').length;
  const maintenanceEquipment = equipmentList.filter(eq => eq.conservationState === 'Manutenção').length;
  const decommissionedEquipment = equipmentList.filter(eq => eq.conservationState === 'Sucata').length;

  return (
    <MainLayout>
      <DashboardHeader onAddClick={() => setShowAddDialog(true)} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total de Unidades"
          value={ubsList.length}
          icon={Building2}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Equipamentos"
          value={totalEquipment}
          icon={HardDrive}
          variant="default"
          delay={0.1}
        />
        <StatCard
          title="Funcionando"
          value={operationalEquipment}
          icon={CheckCircle}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Em Manutenção"
          value={maintenanceEquipment}
          icon={AlertTriangle}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Status Legend */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-card rounded-xl border border-border/50"
      >
        <span className="text-sm font-medium text-foreground">Legenda de Status:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Funcionando</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-sm text-muted-foreground">Em Manutenção</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Sucata</span>
        </div>
      </motion.div>

      {/* UBS Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-display font-bold text-foreground mb-4">
          Unidades de Saúde
        </h2>
        
        {filteredSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSummaries.map((summary, index) => (
              <UBSCard key={summary.ubs.id} summary={summary} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border/50">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
          </div>
        )}
      </motion.div>

      <UBSFormDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </MainLayout>
  );
};

export default Dashboard;
