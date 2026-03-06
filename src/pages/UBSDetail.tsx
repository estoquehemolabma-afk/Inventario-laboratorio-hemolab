import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, User, Phone, Mail, Trash2, Plus, FileText, Download, Pencil, Power, PowerOff, MoreHorizontal } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useInventory } from '@/contexts/InventoryContext';
import { getEquipmentIcon, getStatusBgColor, getStatusTextColor } from '@/lib/equipmentUtils';
import { getEquipmentTypeLabel, conservationStateLabels } from '@/types/inventory';
import EquipmentFormDialog from '@/components/dialogs/EquipmentFormDialog';
import { generateUBSReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Equipment } from '@/types/inventory';

const UBSDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUBSSummary, getEquipmentByUBS, deleteEquipment, deleteUBS, toggleEquipmentActive } = useInventory();
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);
  const [showDeleteUBS, setShowDeleteUBS] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  const summary = id ? getUBSSummary(id) : null;
  const equipment = id ? getEquipmentByUBS(id) : [];

  if (!summary) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Unidade não encontrada</h2>
          <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  const { ubs } = summary;
  const equipmentByLocation = equipment.reduce((acc, eq) => {
    if (!acc[eq.location]) acc[eq.location] = [];
    acc[eq.location].push(eq);
    return acc;
  }, {} as Record<string, typeof equipment>);

  const handleGenerateReport = () => { generateUBSReport(ubs, equipment); toast.success('Relatório PDF gerado com sucesso!'); };
  const handleDeleteEquipment = () => { if (deleteEquipmentId) { deleteEquipment(deleteEquipmentId); setDeleteEquipmentId(null); toast.success('Equipamento removido!'); } };
  const handleDeleteUBS = () => { if (id) { deleteUBS(id); navigate('/'); toast.success('Unidade removida!'); } };

  const handleDeactivate = async () => {
    if (deactivateId && deactivationReason.trim()) {
      await toggleEquipmentActive(deactivateId, false, deactivationReason.trim());
      setDeactivateId(null);
      setDeactivationReason('');
      toast.success('Equipamento desativado!');
    }
  };

  const handleActivate = async (eqId: string) => {
    await toggleEquipmentActive(eqId, true);
    toast.success('Equipamento ativado!');
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </button>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border/50">
          <div className="gradient-primary p-6 text-white relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Building2 className="w-8 h-8" /></div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold">{ubs.name}</h1>
                  <div className="flex items-center gap-2 text-white/80 mt-1"><MapPin className="w-4 h-4" /><span>{ubs.address}</span></div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleGenerateReport} className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Download className="w-4 h-4 mr-2" /> Gerar PDF
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteUBS(true)} className="bg-destructive/80 hover:bg-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-6 relative z-10">
              <div className="flex items-center gap-2 text-white/90"><User className="w-4 h-4" /><span>{ubs.responsible}</span></div>
              {ubs.phone && <div className="flex items-center gap-2 text-white/90"><Phone className="w-4 h-4" /><span>{ubs.phone}</span></div>}
              {ubs.email && <div className="flex items-center gap-2 text-white/90"><Mail className="w-4 h-4" /><span>{ubs.email}</span></div>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <div className="text-center"><p className="text-3xl font-display font-bold text-foreground">{summary.totalEquipment}</p><p className="text-sm text-muted-foreground">Total Ativos</p></div>
            <div className="text-center"><p className="text-3xl font-display font-bold text-success">{summary.equipmentByState.operational}</p><p className="text-sm text-muted-foreground">Funcionando</p></div>
            <div className="text-center"><p className="text-3xl font-display font-bold text-warning">{summary.equipmentByState.maintenance}</p><p className="text-sm text-muted-foreground">Manutenção</p></div>
            <div className="text-center"><p className="text-3xl font-display font-bold text-destructive">{summary.equipmentByState.decommissioned}</p><p className="text-sm text-muted-foreground">Inexistente</p></div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Equipamentos por Departamento</h2>
          <Button onClick={() => setShowAddEquipment(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> Equipamento
          </Button>
        </div>

        {Object.keys(equipmentByLocation).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(equipmentByLocation).map(([location, items], idx) => (
              <motion.div key={location} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
                <div className="bg-muted px-5 py-3 border-b border-border">
                  <h3 className="font-display font-semibold text-foreground">{location}</h3>
                </div>
                <div className="divide-y divide-border">
                  {items.map((eq) => {
                    const Icon = getEquipmentIcon(eq.type);
                    return (
                      <div key={eq.id} className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${!eq.isActive ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg"><Icon className="w-5 h-5 text-primary" /></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{getEquipmentTypeLabel(eq.type)}</span>
                              <Badge className={`${getStatusBgColor(eq.conservationState)} ${getStatusTextColor(eq.conservationState)} border-0`}>
                                {conservationStateLabels[eq.conservationState]}
                              </Badge>
                              {!eq.isActive && <Badge variant="outline" className="border-destructive text-destructive text-xs">Inativo</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{eq.brand} {eq.model} • Pat: {eq.patrimonyNumber}</p>
                            {!eq.isActive && eq.deactivationReason && (
                              <p className="text-xs text-destructive mt-1">Motivo: {eq.deactivationReason}</p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingEquipment(eq)}>
                              <Pencil className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            {eq.isActive ? (
                              <DropdownMenuItem onClick={() => setDeactivateId(eq.id)} className="text-warning">
                                <PowerOff className="w-4 h-4 mr-2" /> Desativar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(eq.id)} className="text-success">
                                <Power className="w-4 h-4 mr-2" /> Ativar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeleteEquipmentId(eq.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border/50">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Nenhum equipamento cadastrado nesta unidade</p>
            <Button onClick={() => setShowAddEquipment(true)} className="gradient-primary text-white border-0">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Equipamento
            </Button>
          </div>
        )}
      </motion.div>

      {id && (showAddEquipment || editingEquipment) && (
        <EquipmentFormDialog
          open={showAddEquipment || !!editingEquipment}
          onOpenChange={(open) => { if (!open) { setShowAddEquipment(false); setEditingEquipment(undefined); } }}
          ubsId={editingEquipment?.ubsId || id}
          editingEquipment={editingEquipment}
        />
      )}

      <AlertDialog open={!!deleteEquipmentId} onOpenChange={() => setDeleteEquipmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este equipamento?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEquipment} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteUBS} onOpenChange={setShowDeleteUBS}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir Unidade</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir "{ubs.name}"? Todos os equipamentos serão removidos.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUBS} className="bg-destructive hover:bg-destructive/90">Excluir Unidade</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Dialog */}
      <Dialog open={!!deactivateId} onOpenChange={() => { setDeactivateId(null); setDeactivationReason(''); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PowerOff className="w-5 h-5 text-warning" /> Desativar Equipamento</DialogTitle>
            <DialogDescription>Informe o motivo da desativação. Equipamentos desativados não serão contabilizados no inventário.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Justificativa para desativação..." value={deactivationReason} onChange={(e) => setDeactivationReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeactivateId(null); setDeactivationReason(''); }}>Cancelar</Button>
            <Button onClick={handleDeactivate} disabled={!deactivationReason.trim()} className="bg-warning text-warning-foreground hover:bg-warning/90">Desativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UBSDetail;
