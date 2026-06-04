import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useInventory } from '@/contexts/InventoryContext';
import { Equipment, ConservationState, conservationStateLabels } from '@/types/inventory';
import { HardDrive, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cidadesMA, gruposEquipamento } from '@/data/cidadesMA';

const conservationStates: ConservationState[] = ['Funcionando', 'Manutenção', 'Inexistente'];

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubsId: string;
  editingEquipment?: Equipment;
}

const equipmentFormSchema = z.object({
  ubsId: z.string().min(1, 'Unidade é obrigatória'),
  type: z.string().min(1, 'Grupo é obrigatório'),
  brand: z.string().min(1, 'Marca é obrigatória').max(50),
  model: z.string().min(1, 'Modelo é obrigatório').max(50),
  serialNumber: z.string().min(1, 'Número de série é obrigatório').max(50),
  patrimonyNumber: z.string().min(1, 'Patrimônio é obrigatório').max(50),
  location: z.string().min(1, 'Departamento é obrigatório').max(100),
  municipality: z.string().min(1, 'Município é obrigatório').max(100),
  conservationState: z.enum(['Funcionando', 'Manutenção', 'Inexistente'] as const),
  installationDate: z.string().min(1, 'Data de instalação é obrigatória'),
  observations: z.string().max(500).optional(),
  value: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({ open, onOpenChange, ubsId, editingEquipment }) => {
  const { addEquipment, updateEquipment, ubsList } = useInventory();
  const [cityOpen, setCityOpen] = useState(false);
  const [showJustification, setShowJustification] = useState(false);
  const [justification, setJustification] = useState('');
  const [pendingData, setPendingData] = useState<EquipmentFormData | null>(null);

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      ubsId: editingEquipment?.ubsId || ubsId || '',
      type: editingEquipment?.type || '',
      brand: editingEquipment?.brand || '',
      model: editingEquipment?.model || '',
      serialNumber: editingEquipment?.serialNumber || '',
      patrimonyNumber: editingEquipment?.patrimonyNumber || '',
      location: editingEquipment?.location || '',
      municipality: editingEquipment?.municipality || '',
      conservationState: editingEquipment?.conservationState || 'Funcionando',
      installationDate: editingEquipment?.installationDate || new Date().toISOString().split('T')[0],
      observations: editingEquipment?.observations || '',
      value: editingEquipment?.value?.toString() || '0',
    },
  });

  const onSubmit = async (data: EquipmentFormData) => {
    const parsedValue = parseFloat(data.value?.replace(',', '.') || '0') || 0;

    // Check if status changed during edit
    if (editingEquipment && data.conservationState !== editingEquipment.conservationState) {
      setPendingData(data);
      setShowJustification(true);
      return;
    }

    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, { ...data, value: parsedValue });
        toast.success('Equipamento atualizado com sucesso!');
      } else {
        await addEquipment({
          type: data.type, brand: data.brand, model: data.model,
          serialNumber: data.serialNumber, patrimonyNumber: data.patrimonyNumber,
          location: data.location, municipality: data.municipality,
          conservationState: data.conservationState,
          installationDate: data.installationDate, ubsId: data.ubsId, observations: data.observations || '',
          value: parsedValue,
        });
        toast.success('Equipamento cadastrado com sucesso!');
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar equipamento.');
    }
  };

  const handleJustificationConfirm = async () => {
    if (!pendingData || !justification.trim()) {
      toast.error('A justificativa é obrigatória.');
      return;
    }
    const parsedValue = parseFloat(pendingData.value?.replace(',', '.') || '0') || 0;
    try {
      await updateEquipment(editingEquipment!.id, { ...pendingData, value: parsedValue }, justification.trim());
      toast.success('Equipamento atualizado com sucesso!');
      setShowJustification(false);
      setJustification('');
      setPendingData(null);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar equipamento.');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <div className="p-2 rounded-lg gradient-primary"><HardDrive className="w-5 h-5 text-white" /></div>
              {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
            </DialogTitle>
            <DialogDescription>
              {editingEquipment ? 'Atualize as informações do equipamento.' : 'Preencha os dados para cadastrar um novo equipamento.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o grupo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {gruposEquipamento.map((grupo) => (
                          <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="conservationState" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Conservação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {conservationStates.map((state) => (
                          <SelectItem key={state} value={state}>{conservationStateLabels[state]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: Dell, HP, Lenovo" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="model" render={({ field }) => (
                  <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: OptiPlex 3080" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="serialNumber" render={({ field }) => (
                  <FormItem><FormLabel>Número de Série</FormLabel><FormControl><Input placeholder="Ex: SN123456789" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="patrimonyNumber" render={({ field }) => (
                  <FormItem><FormLabel>Patrimônio</FormLabel><FormControl><Input placeholder="Ex: PAT-2024-00001" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl><Input placeholder="Ex: Recepção, Almoxarifado, Sala 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="municipality" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Município</FormLabel>
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            className={cn("w-full justify-between font-normal h-10", !field.value && "text-muted-foreground")}
                          >
                            {field.value || "Pesquisar município..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Digite para buscar..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                            <CommandGroup>
                              {cidadesMA.map((cidade) => (
                                <CommandItem
                                  key={cidade}
                                  value={cidade}
                                  onSelect={() => { field.onChange(cidade); setCityOpen(false); }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", field.value === cidade ? "opacity-100" : "opacity-0")} />
                                  {cidade}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="installationDate" render={({ field }) => (
                  <FormItem><FormLabel>Data de Instalação</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="text" placeholder="0,00" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="observations" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl><Textarea placeholder="Observações adicionais..." className="resize-none" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="gradient-primary text-white border-0">
                  {editingEquipment ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Status Change Justification Dialog */}
      <Dialog open={showJustification} onOpenChange={(o) => { if (!o) { setShowJustification(false); setJustification(''); setPendingData(null); } }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Justificativa de Mudança de Status</DialogTitle>
            <DialogDescription>
              O status será alterado de <strong>{editingEquipment && conservationStateLabels[editingEquipment.conservationState]}</strong> para <strong>{pendingData && conservationStateLabels[pendingData.conservationState]}</strong>. Informe a justificativa.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva o motivo da mudança de status..."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowJustification(false); setJustification(''); setPendingData(null); }}>Cancelar</Button>
            <Button onClick={handleJustificationConfirm} disabled={!justification.trim()} className="gradient-primary text-white border-0">Confirmar Alteração</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentFormDialog;
