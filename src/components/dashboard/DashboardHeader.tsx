import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';

interface DashboardHeaderProps {
  onAddClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddClick }) => {
  const { ubsList, selectedUBS, setSelectedUBS, searchQuery, setSearchQuery } = useInventory();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Inventário de TI
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de equipamentos das Unidades Básicas de Saúde
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-full sm:w-64 bg-card border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedUBS || 'all'} onValueChange={(v) => setSelectedUBS(v === 'all' ? null : v)}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
              <SelectValue placeholder="Filtrar por UBS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as UBS</SelectItem>
              {ubsList.map((ubs) => (
                <SelectItem key={ubs.id} value={ubs.id}>
                  {ubs.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={onAddClick}
            className="gradient-primary hover:opacity-90 transition-opacity text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova UBS
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
