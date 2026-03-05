import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInventory } from '@/contexts/InventoryContext';
import UBSFormDialog from '@/components/dialogs/UBSFormDialog';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const UnidadesPage: React.FC = () => {
  const { ubsList, deleteUBS, getEquipmentByUBS } = useInventory();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredUBS = ubsList.filter((ubs) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ubs.name.toLowerCase().includes(query) || ubs.address.toLowerCase().includes(query) || ubs.responsible.toLowerCase().includes(query);
  });

  const handleDelete = () => {
    if (deleteId) { deleteUBS(deleteId); setDeleteId(null); toast.success('Unidade removida com sucesso!'); }
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Unidades</h1>
            <p className="text-muted-foreground mt-1">Gerencie as unidades cadastradas no sistema</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> Nova Unidade
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar unidade..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Endereço</TableHead><TableHead>Responsável</TableHead>
              <TableHead>Equipamentos</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUBS.length > 0 ? filteredUBS.map((ubs) => (
              <TableRow key={ubs.id}>
                <TableCell className="font-medium">{ubs.name}</TableCell>
                <TableCell>{ubs.address}</TableCell>
                <TableCell>{ubs.responsible}</TableCell>
                <TableCell>{getEquipmentByUBS(ubs.id).length}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(ubs.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <UBSFormDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta unidade? Todos os equipamentos associados também serão removidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default UnidadesPage;
