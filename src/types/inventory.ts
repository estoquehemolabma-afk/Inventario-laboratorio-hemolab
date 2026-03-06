// Equipment Types - now dynamic (string-based)
export type EquipmentType = string;

export type ConservationState = 'Funcionando' | 'Manutenção' | 'Inexistente';

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  performedBy: string;
}

export interface Equipment {
  id: string;
  ubsId: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  patrimonyNumber: string;
  location: string;
  municipality: string;
  conservationState: ConservationState;
  installationDate: string;
  observations: string;
  isActive: boolean;
  deactivationReason: string | null;
  maintenanceLogs: MaintenanceLog[];
  createdAt: string;
  updatedAt: string;
}

export interface UBS {
  id: string;
  name: string;
  address: string;
  responsible: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentSummary {
  type: EquipmentType;
  total: number;
  operational: number;
  maintenance: number;
  decommissioned: number;
}

export interface UBSSummary {
  ubs: UBS;
  totalEquipment: number;
  equipmentByType: EquipmentSummary[];
  equipmentByState: {
    operational: number;
    maintenance: number;
    decommissioned: number;
  };
}

// Default equipment type labels in Portuguese
export const defaultEquipmentTypeLabels: Record<string, string> = {
  PC: 'Computador',
  Impressora: 'Impressora',
  Monitor: 'Monitor',
  Estabilizador: 'Estabilizador',
  Scanner: 'Scanner',
  Notebook: 'Notebook',
  Roteador: 'Roteador',
  Switch: 'Switch',
  Nobreak: 'Nobreak',
};

// Helper to get label for any type
export const getEquipmentTypeLabel = (type: string): string => {
  return defaultEquipmentTypeLabels[type] || type;
};

// Conservation state labels
export const conservationStateLabels: Record<ConservationState, string> = {
  Funcionando: 'Funcionando',
  Manutenção: 'Em Manutenção',
  Inexistente: 'Inexistente',
};
