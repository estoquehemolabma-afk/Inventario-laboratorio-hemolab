// Equipment Types
export type EquipmentType = 'PC' | 'Impressora' | 'Monitor' | 'Estabilizador' | 'Scanner' | 'Notebook' | 'Roteador' | 'Switch' | 'Nobreak';

export type ConservationState = 'Funcionando' | 'Manutenção' | 'Sucata';

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
  conservationState: ConservationState;
  installationDate: string;
  observations: string;
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

// Equipment type labels in Portuguese
export const equipmentTypeLabels: Record<EquipmentType, string> = {
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

// Conservation state labels
export const conservationStateLabels: Record<ConservationState, string> = {
  Funcionando: 'Funcionando',
  Manutenção: 'Em Manutenção',
  Sucata: 'Sucata',
};
