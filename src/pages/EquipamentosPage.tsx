import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Search, Trash2, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { getEquipmentIcon, getStatusBgColor, getStatusTextColor } from '@/lib/equipmentUtils';
import { equipmentTypeLabels, conservationStateLabels, ConservationState } from '@/types/inventory';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const EquipamentosPage: React.FC = () => {
  const { equipmentList, ubsList, deleteEquipment } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUBS, setFilterUBS] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEquipment = equipmentList.filter((eq) => {
    if (filterUBS !== 'all' && eq.ubsId !== filterUBS) return false;
    if (filterState !== 'all' && eq.conservationState !== filterState) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        eq.brand.toLowerCase().includes(query) ||
        eq.model.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        eq.patrimonyNumber.toLowerCase().includes(query) ||
        eq.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getUBSName = (ubsId: string) => {
    return ubsList.find((u) => u.id === ubsId)?.name || 'N/A';
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteEquipment(deleteId);
      setDeleteId(null);
      toast.success('Equipamento removido com sucesso!');
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground">
          Equipamentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Lista completa de todos os equipamentos cadastrados
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden"
      >
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar equipamento..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterUBS} onValueChange={setFilterUBS}>
            <SelectTrigger className="w-48">
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

          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Funcionando">Funcionando</SelectItem>
              <SelectItem value="Manutenção">Manutenção</SelectItem>
              <SelectItem value="Sucata">Sucata</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>UBS</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map((eq) => {
                  const Icon = getEquipmentIcon(eq.type);
                  return (
                    <TableRow key={eq.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span>{equipmentTypeLabels[eq.type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{eq.brand}</p>
                          <p className="text-sm text-muted-foreground">{eq.model}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{eq.patrimonyNumber}</TableCell>
                      <TableCell>{getUBSName(eq.ubsId)}</TableCell>
                      <TableCell>{eq.location}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBgColor(eq.conservationState)} ${getStatusTextColor(eq.conservationState)} border-0`}
                        >
                          {conservationStateLabels[eq.conservationState]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(eq.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <HardDrive className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum equipamento encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default EquipamentosPage;
