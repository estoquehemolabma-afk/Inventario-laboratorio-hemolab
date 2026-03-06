import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Search, Trash2, Plus, Pencil, Power, PowerOff } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { getEquipmentIcon, getStatusBgColor, getStatusTextColor } from '@/lib/equipmentUtils';
import { getEquipmentTypeLabel, conservationStateLabels } from '@/types/inventory';
import { toast } from 'sonner';
import EquipmentFormDialog from '@/components/dialogs/EquipmentFormDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Equipment } from '@/types/inventory';

const EquipamentosPage: React.FC = () => {
  const { equipmentList, ubsList, deleteEquipment, toggleEquipmentActive } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUBS, setFilterUBS] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [selectedUbsForAdd, setSelectedUbsForAdd] = useState<string>('');
  const [showSelectUbs, setShowSelectUbs] = useState(false);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, filterUBS, filterState]);

  const filteredEquipment = equipmentList.filter((eq) => {
    if (filterUBS !== 'all' && eq.ubsId !== filterUBS) return false;
    if (filterState !== 'all' && eq.conservationState !== filterState) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return eq.brand.toLowerCase().includes(query) || eq.model.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) || eq.patrimonyNumber.toLowerCase().includes(query) ||
        eq.location.toLowerCase().includes(query) || eq.municipality.toLowerCase().includes(query);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getUBSName = (ubsId: string) => ubsList.find((u) => u.id === ubsId)?.name || 'N/A';

  const handleDelete = () => {
    if (deleteId) { deleteEquipment(deleteId); setDeleteId(null); toast.success('Equipamento removido com sucesso!'); }
  };

  const handleDeactivate = async () => {
    if (deactivateId && deactivationReason.trim()) {
      await toggleEquipmentActive(deactivateId, false, deactivationReason.trim());
      setDeactivateId(null);
      setDeactivationReason('');
      toast.success('Equipamento desativado!');
    }
  };

  const handleActivate = async (id: string) => {
    await toggleEquipmentActive(id, true);
    toast.success('Equipamento ativado!');
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
  };

  const handleAddClick = () => {
    if (ubsList.length === 1) {
      setSelectedUbsForAdd(ubsList[0].id);
      setShowAddEquipment(true);
    } else if (ubsList.length > 1) {
      setShowSelectUbs(true);
    } else {
      toast.error('Cadastre uma unidade antes de adicionar equipamentos.');
    }
  };

  const confirmUbsForAdd = () => {
    if (selectedUbsForAdd) {
      setShowSelectUbs(false);
      setShowAddEquipment(true);
    }
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Lista completa de todos os equipamentos cadastrados</p>
        </div>
        <Button onClick={handleAddClick} className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" /> Equipamento
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar equipamento..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={filterUBS} onValueChange={setFilterUBS}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por unidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {ubsList.map((ubs) => (<SelectItem key={ubs.id} value={ubs.id}>{ubs.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Funcionando">Funcionando</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Inexistente">Inexistente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile View: Cards */}
        <div className="grid md:hidden grid-cols-1 gap-4 p-4">
          {paginatedEquipment.length > 0 ? (
            paginatedEquipment.map((eq) => {
              const Icon = getEquipmentIcon(eq.type);
              return (
                <Card key={eq.id} className={`border-border/50 bg-card/50 ${!eq.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-primary/10 rounded"><Icon className="w-4 h-4 text-primary" /></div>
                        <span className="font-semibold text-sm">{getEquipmentTypeLabel(eq.type)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!eq.isActive && <Badge variant="outline" className="text-xs border-destructive text-destructive">Inativo</Badge>}
                        <Badge className={`${getStatusBgColor(eq.conservationState)} ${getStatusTextColor(eq.conservationState)} border-0 text-xs`}>
                          {conservationStateLabels[eq.conservationState]}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm mt-1">
                      <div className="col-span-2">
                        <span className="text-muted-foreground font-medium block">Marca/Modelo</span>
                        {eq.brand} <span className="text-xs text-muted-foreground">{eq.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">Patrimônio</span>
                        <span className="font-mono text-xs">{eq.patrimonyNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">Departamento</span>
                        <span className="text-xs truncate block">{eq.location}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium block">Município</span>
                        <span className="text-xs truncate block">{eq.municipality}</span>
                      </div>
                    </div>
                    {!eq.isActive && eq.deactivationReason && (
                      <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
                        <strong>Motivo:</strong> {eq.deactivationReason}
                      </div>
                    )}
                    <div className="flex justify-end pt-2 border-t border-border mt-2 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(eq)}><Pencil className="w-4 h-4 mr-1" />Editar</Button>
                      {eq.isActive ? (
                        <Button variant="ghost" size="sm" onClick={() => setDeactivateId(eq.id)} className="text-warning"><PowerOff className="w-4 h-4 mr-1" />Desativar</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleActivate(eq.id)} className="text-success"><Power className="w-4 h-4 mr-1" />Ativar</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(eq.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" />Excluir</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border/50">
              <HardDrive className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              Nenhum equipamento encontrado
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead><TableHead>Marca/Modelo</TableHead><TableHead>Patrimônio</TableHead>
                <TableHead>Unidade</TableHead><TableHead>Departamento</TableHead><TableHead>Município</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEquipment.length > 0 ? paginatedEquipment.map((eq) => {
                const Icon = getEquipmentIcon(eq.type);
                return (
                  <TableRow key={eq.id} className={!eq.isActive ? 'opacity-60' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded"><Icon className="w-4 h-4 text-primary" /></div>
                        <span>{getEquipmentTypeLabel(eq.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell><p className="font-medium">{eq.brand}</p><p className="text-sm text-muted-foreground">{eq.model}</p></TableCell>
                    <TableCell className="font-mono text-sm">{eq.patrimonyNumber}</TableCell>
                    <TableCell>{getUBSName(eq.ubsId)}</TableCell>
                    <TableCell>{eq.location}</TableCell>
                    <TableCell>{eq.municipality}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${getStatusBgColor(eq.conservationState)} ${getStatusTextColor(eq.conservationState)} border-0`}>
                          {conservationStateLabels[eq.conservationState]}
                        </Badge>
                        {!eq.isActive && <Badge variant="outline" className="border-destructive text-destructive text-xs">Inativo</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(eq)}>
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
                          <DropdownMenuItem onClick={() => setDeleteId(eq.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <HardDrive className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum equipamento encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredEquipment.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} até {Math.min(startIndex + ITEMS_PER_PAGE, filteredEquipment.length)} de {filteredEquipment.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
              <div className="text-sm font-medium">Página {currentPage} de {totalPages}</div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Próxima</Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Select UBS Dialog */}
      <Dialog open={showSelectUbs} onOpenChange={setShowSelectUbs}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Selecione a Unidade</DialogTitle>
            <DialogDescription>Escolha a unidade para o novo equipamento.</DialogDescription>
          </DialogHeader>
          <Select value={selectedUbsForAdd} onValueChange={setSelectedUbsForAdd}>
            <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
            <SelectContent>
              {ubsList.map((ubs) => (<SelectItem key={ubs.id} value={ubs.id}>{ubs.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectUbs(false)}>Cancelar</Button>
            <Button onClick={confirmUbsForAdd} disabled={!selectedUbsForAdd} className="gradient-primary text-white border-0">Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Equipment Dialog */}
      {(showAddEquipment || editingEquipment) && (
        <EquipmentFormDialog
          open={showAddEquipment || !!editingEquipment}
          onOpenChange={(open) => {
            if (!open) { setShowAddEquipment(false); setEditingEquipment(undefined); }
          }}
          ubsId={editingEquipment?.ubsId || selectedUbsForAdd}
          editingEquipment={editingEquipment}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Dialog with reason */}
      <Dialog open={!!deactivateId} onOpenChange={() => { setDeactivateId(null); setDeactivationReason(''); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PowerOff className="w-5 h-5 text-warning" /> Desativar Equipamento
            </DialogTitle>
            <DialogDescription>Informe o motivo da desativação. Equipamentos desativados não serão contabilizados no inventário.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Justificativa para desativação..."
            value={deactivationReason}
            onChange={(e) => setDeactivationReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeactivateId(null); setDeactivationReason(''); }}>Cancelar</Button>
            <Button onClick={handleDeactivate} disabled={!deactivationReason.trim()} className="bg-warning text-warning-foreground hover:bg-warning/90">
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default EquipamentosPage;
