import { UBS, Equipment, EquipmentType, ConservationState } from '@/types/inventory';

export const mockUBS: UBS[] = [
  {
    id: 'ubs-1',
    name: 'UBS Centro',
    address: 'Rua Principal, 100 - Centro',
    responsible: 'Dr. Maria Silva',
    phone: '(11) 3456-7890',
    email: 'ubs.centro@saude.gov.br',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
  },
  {
    id: 'ubs-2',
    name: 'UBS Vila Nova',
    address: 'Av. das Flores, 250 - Vila Nova',
    responsible: 'Dr. João Santos',
    phone: '(11) 3456-7891',
    email: 'ubs.vilanova@saude.gov.br',
    createdAt: '2024-02-10',
    updatedAt: '2024-12-18',
  },
  {
    id: 'ubs-3',
    name: 'UBS Jardim Esperança',
    address: 'Rua da Paz, 50 - Jardim Esperança',
    responsible: 'Dra. Ana Costa',
    phone: '(11) 3456-7892',
    email: 'ubs.jardim@saude.gov.br',
    createdAt: '2024-03-05',
    updatedAt: '2024-12-15',
  },
  {
    id: 'ubs-4',
    name: 'UBS Parque Industrial',
    address: 'Rua dos Trabalhadores, 300 - Parque Industrial',
    responsible: 'Dr. Carlos Oliveira',
    phone: '(11) 3456-7893',
    email: 'ubs.parque@saude.gov.br',
    createdAt: '2024-04-12',
    updatedAt: '2024-12-22',
  },
];

const generateEquipment = (
  ubsId: string,
  type: EquipmentType,
  location: string,
  state: ConservationState,
  index: number
): Equipment => ({
  id: `equip-${ubsId}-${type.toLowerCase()}-${index}`,
  ubsId,
  type,
  brand: ['Dell', 'HP', 'Lenovo', 'Samsung', 'LG', 'Epson', 'Brother'][Math.floor(Math.random() * 7)],
  model: `${type}-Model-${Math.floor(Math.random() * 1000)}`,
  serialNumber: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  patrimonyNumber: `PAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
  location,
  conservationState: state,
  installationDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  observations: state === 'Manutenção' ? 'Aguardando peça de reposição' : '',
  maintenanceLogs: state !== 'Funcionando' ? [
    {
      id: `log-${index}-1`,
      date: '2024-11-15',
      description: 'Formatação do sistema operacional',
      performedBy: 'Técnico João',
    },
  ] : [],
  createdAt: '2024-01-01',
  updatedAt: '2024-12-20',
});

const locations = [
  'Recepção',
  'Triagem',
  'Consultório 1',
  'Consultório 2',
  'Consultório 3',
  'Farmácia',
  'Sala de Vacinas',
  'Administração',
  'Sala de Enfermagem',
];

export const mockEquipment: Equipment[] = [
  // UBS Centro - 12 equipment
  generateEquipment('ubs-1', 'PC', 'Recepção', 'Funcionando', 1),
  generateEquipment('ubs-1', 'PC', 'Triagem', 'Funcionando', 2),
  generateEquipment('ubs-1', 'PC', 'Consultório 1', 'Funcionando', 3),
  generateEquipment('ubs-1', 'PC', 'Consultório 2', 'Manutenção', 4),
  generateEquipment('ubs-1', 'PC', 'Farmácia', 'Funcionando', 5),
  generateEquipment('ubs-1', 'Impressora', 'Recepção', 'Funcionando', 6),
  generateEquipment('ubs-1', 'Impressora', 'Farmácia', 'Funcionando', 7),
  generateEquipment('ubs-1', 'Monitor', 'Recepção', 'Funcionando', 8),
  generateEquipment('ubs-1', 'Monitor', 'Triagem', 'Funcionando', 9),
  generateEquipment('ubs-1', 'Estabilizador', 'Recepção', 'Sucata', 10),
  generateEquipment('ubs-1', 'Scanner', 'Administração', 'Funcionando', 11),
  generateEquipment('ubs-1', 'Nobreak', 'Recepção', 'Funcionando', 12),

  // UBS Vila Nova - 8 equipment
  generateEquipment('ubs-2', 'PC', 'Recepção', 'Funcionando', 1),
  generateEquipment('ubs-2', 'PC', 'Consultório 1', 'Funcionando', 2),
  generateEquipment('ubs-2', 'PC', 'Consultório 2', 'Funcionando', 3),
  generateEquipment('ubs-2', 'Impressora', 'Recepção', 'Manutenção', 4),
  generateEquipment('ubs-2', 'Monitor', 'Recepção', 'Funcionando', 5),
  generateEquipment('ubs-2', 'Monitor', 'Consultório 1', 'Funcionando', 6),
  generateEquipment('ubs-2', 'Notebook', 'Administração', 'Funcionando', 7),
  generateEquipment('ubs-2', 'Roteador', 'Recepção', 'Funcionando', 8),

  // UBS Jardim Esperança - 10 equipment
  generateEquipment('ubs-3', 'PC', 'Recepção', 'Funcionando', 1),
  generateEquipment('ubs-3', 'PC', 'Triagem', 'Sucata', 2),
  generateEquipment('ubs-3', 'PC', 'Consultório 1', 'Funcionando', 3),
  generateEquipment('ubs-3', 'Impressora', 'Recepção', 'Funcionando', 4),
  generateEquipment('ubs-3', 'Impressora', 'Farmácia', 'Funcionando', 5),
  generateEquipment('ubs-3', 'Monitor', 'Recepção', 'Manutenção', 6),
  generateEquipment('ubs-3', 'Estabilizador', 'Recepção', 'Funcionando', 7),
  generateEquipment('ubs-3', 'Switch', 'Administração', 'Funcionando', 8),
  generateEquipment('ubs-3', 'Nobreak', 'Recepção', 'Funcionando', 9),
  generateEquipment('ubs-3', 'Scanner', 'Administração', 'Funcionando', 10),

  // UBS Parque Industrial - 6 equipment
  generateEquipment('ubs-4', 'PC', 'Recepção', 'Funcionando', 1),
  generateEquipment('ubs-4', 'PC', 'Consultório 1', 'Funcionando', 2),
  generateEquipment('ubs-4', 'Impressora', 'Recepção', 'Funcionando', 3),
  generateEquipment('ubs-4', 'Monitor', 'Recepção', 'Funcionando', 4),
  generateEquipment('ubs-4', 'Notebook', 'Administração', 'Manutenção', 5),
  generateEquipment('ubs-4', 'Roteador', 'Recepção', 'Funcionando', 6),
];
