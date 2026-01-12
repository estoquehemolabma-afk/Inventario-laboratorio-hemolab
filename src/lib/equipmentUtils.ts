import { EquipmentType, ConservationState } from '@/types/inventory';
import {
  Monitor,
  Printer,
  HardDrive,
  Wifi,
  Laptop,
  ScanLine,
  Zap,
  Server,
  Battery,
  LucideIcon
} from 'lucide-react';

export const getEquipmentIcon = (type: EquipmentType): LucideIcon => {
  const icons: Record<EquipmentType, LucideIcon> = {
    PC: HardDrive,
    Impressora: Printer,
    Monitor: Monitor,
    Estabilizador: Zap,
    Scanner: ScanLine,
    Notebook: Laptop,
    Roteador: Wifi,
    Switch: Server,
    Nobreak: Battery,
  };
  return icons[type];
};

export const getStatusColor = (state: ConservationState): string => {
  const colors: Record<ConservationState, string> = {
    Funcionando: 'bg-success',
    Manutenção: 'bg-warning',
    Inexistente: 'bg-destructive',
  };
  return colors[state];
};

export const getStatusTextColor = (state: ConservationState): string => {
  const colors: Record<ConservationState, string> = {
    Funcionando: 'text-success',
    Manutenção: 'text-warning',
    Inexistente: 'text-destructive',
  };
  return colors[state];
};

export const getStatusBgColor = (state: ConservationState): string => {
  const colors: Record<ConservationState, string> = {
    Funcionando: 'bg-success/10',
    Manutenção: 'bg-warning/10',
    Inexistente: 'bg-destructive/10',
  };
  return colors[state];
};
