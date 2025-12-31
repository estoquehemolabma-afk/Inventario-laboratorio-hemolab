export type SupportStatus = 'recebido' | 'em_andamento' | 'resolvido' | 'cancelado';
export type SupportType = 'hardware' | 'software' | 'rede' | 'impressora' | 'outros';
export type SupportPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface SupportRequest {
  id: string;
  tracking_code: string;
  ubs_name: string;
  requester_name: string;
  requester_email?: string;
  requester_phone?: string;
  request_type: SupportType;
  priority: SupportPriority;
  status: SupportStatus;
  location: string;
  description: string;
  equipment_info?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const supportStatusLabels: Record<SupportStatus, string> = {
  recebido: 'Recebido',
  em_andamento: 'Em Andamento',
  resolvido: 'Resolvido',
  cancelado: 'Cancelado',
};

export const supportTypeLabels: Record<SupportType, string> = {
  hardware: 'Hardware',
  software: 'Software',
  rede: 'Rede',
  impressora: 'Impressora',
  outros: 'Outros',
};

export const supportPriorityLabels: Record<SupportPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const supportStatusColors: Record<SupportStatus, string> = {
  recebido: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  em_andamento: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolvido: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const supportPriorityColors: Record<SupportPriority, string> = {
  baixa: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  media: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  alta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgente: 'bg-red-500/20 text-red-400 border-red-500/30',
};
