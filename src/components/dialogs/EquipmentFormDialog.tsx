import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/contexts/InventoryContext';
import { Equipment, EquipmentType, ConservationState, equipmentTypeLabels, conservationStateLabels } from '@/types/inventory';
import { HardDrive } from 'lucide-react';
import { toast } from 'sonner';

const equipmentFormSchema = z.object({
  type: z.enum(['PC', 'Impressora', 'Monitor', 'Estabilizador', 'Scanner', 'Notebook', 'Roteador', 'Switch', 'Nobreak'] as const),
  brand: z.string().min(1, 'Marca é obrigatória').max(50),
  model: z.string().min(1, 'Modelo é obrigatório').max(50),
  serialNumber: z.string().min(1, 'Número de série é obrigatório').max(50),
  patrimonyNumber: z.string().min(1, 'Patrimônio é obrigatório').max(50),
  location: z.string().min(1, 'Local é obrigatório').max(100),
  conservationState: z.enum(['Funcionando', 'Manutenção', 'Sucata'] as const),
  installationDate: z.string().min(1, 'Data de instalação é obrigatória'),
  observations: z.string().max(500).optional(),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubsId: string;
  editingEquipment?: Equipment;
}

const equipmentTypes: EquipmentType[] = ['PC', 'Impressora', 'Monitor', 'Estabilizador', 'Scanner', 'Notebook', 'Roteador', 'Switch', 'Nobreak'];
const conservationStates: ConservationState[] = ['Funcionando', 'Manutenção', 'Sucata'];

const commonLocations = [
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

const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({
  open,
  onOpenChange,
  ubsId,
  editingEquipment,
}) => {
  const { addEquipment, updateEquipment } = useInventory();

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      type: editingEquipment?.type || 'PC',
      brand: editingEquipment?.brand || '',
      model: editingEquipment?.model || '',
      serialNumber: editingEquipment?.serialNumber || '',
      patrimonyNumber: editingEquipment?.patrimonyNumber || '',
      location: editingEquipment?.location || '',
      conservationState: editingEquipment?.conservationState || 'Funcionando',
      installationDate: editingEquipment?.installationDate || new Date().toISOString().split('T')[0],
      observations: editingEquipment?.observations || '',
    },
  });

  const onSubmit = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateEquipment(editingEquipment.id, data);
      toast.success('Equipamento atualizado com sucesso!');
    } else {
      addEquipment({
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        patrimonyNumber: data.patrimonyNumber,
        location: data.location,
        conservationState: data.conservationState,
        installationDate: data.installationDate,
        ubsId,
        observations: data.observations || '',
      });
      toast.success('Equipamento cadastrado com sucesso!');
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
          </DialogTitle>
          <DialogDescription>
            {editingEquipment
              ? 'Atualize as informações do equipamento.'
              : 'Preencha os dados para cadastrar um novo equipamento.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Equipamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {equipmentTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conservationState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Conservação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conservationStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {conservationStateLabels[state]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dell, HP, Lenovo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: OptiPlex 3080" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SN123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patrimonyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patrimônio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PAT-2024-00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local / Setor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Instalação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Última formatação em 15/11/2024, aguardando peça..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white border-0">
                {editingEquipment ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
