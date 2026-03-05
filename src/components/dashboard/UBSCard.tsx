import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, User, ChevronRight } from 'lucide-react';
import { UBSSummary } from '@/types/inventory';
import { getEquipmentTypeLabel } from '@/types/inventory';
import { getEquipmentIcon } from '@/lib/equipmentUtils';
import { useNavigate } from 'react-router-dom';

interface UBSCardProps {
  summary: UBSSummary;
  index: number;
}

const UBSCard: React.FC<UBSCardProps> = ({ summary, index }) => {
  const navigate = useNavigate();
  const { ubs, totalEquipment, equipmentByType, equipmentByState } = summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-border/50 cursor-pointer group"
      onClick={() => navigate(`/unidade/${ubs.id}`)}
    >
      <div className="gradient-primary p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{ubs.name}</h3>
              <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{ubs.address}</span>
              </div>
            </div>
          </div>
          <motion.div
            className="p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-sm text-white/80">
          <User className="w-3.5 h-3.5" />
          <span>{ubs.responsible}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Equipamentos</span>
          <span className="text-2xl font-display font-bold text-foreground">{totalEquipment}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {equipmentByType.slice(0, 4).map((item) => {
            const Icon = getEquipmentIcon(item.type);
            return (
              <div key={item.type} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-lg text-xs font-medium">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground">{item.total}</span>
                <span className="text-muted-foreground">{getEquipmentTypeLabel(item.type)}</span>
              </div>
            );
          })}
          {equipmentByType.length > 4 && (
            <div className="px-2.5 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
              +{equipmentByType.length - 4} tipos
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">{equipmentByState.operational}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">{equipmentByState.maintenance}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">{equipmentByState.decommissioned}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UBSCard;
