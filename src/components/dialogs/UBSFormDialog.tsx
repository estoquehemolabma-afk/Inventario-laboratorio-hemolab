import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/contexts/InventoryContext';
import { UBS } from '@/types/inventory';
import { Building2, MapPin, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const ubsFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').max(200),
  responsible: z.string().min(3, 'Nome do responsável deve ter pelo menos 3 caracteres').max(100),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type UBSFormData = z.infer<typeof ubsFormSchema>;

interface UBSFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUBS?: UBS;
}

const UBSFormDialog: React.FC<UBSFormDialogProps> = ({ open, onOpenChange, editingUBS }) => {
  const { addUBS, updateUBS } = useInventory();
  
  const form = useForm<UBSFormData>({
    resolver: zodResolver(ubsFormSchema),
    defaultValues: {
      name: editingUBS?.name || '', address: editingUBS?.address || '',
      responsible: editingUBS?.responsible || '', phone: editingUBS?.phone || '', email: editingUBS?.email || '',
    },
  });

  const onSubmit = (data: UBSFormData) => {
    if (editingUBS) {
      updateUBS(editingUBS.id, data);
      toast.success('Unidade atualizada com sucesso!');
    } else {
      addUBS({ name: data.name, address: data.address, responsible: data.responsible, phone: data.phone, email: data.email });
      toast.success('Unidade cadastrada com sucesso!');
    }
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="p-2 rounded-lg gradient-primary"><Building2 className="w-5 h-5 text-white" /></div>
            {editingUBS ? 'Editar Unidade' : 'Nova Unidade'}
          </DialogTitle>
          <DialogDescription>
            {editingUBS ? 'Atualize as informações da unidade.' : 'Preencha os dados para cadastrar uma nova unidade.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />Nome da Unidade</FormLabel>
                <FormControl><Input placeholder="Ex: Unidade Centro" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Endereço</FormLabel>
                <FormControl><Input placeholder="Ex: Rua Principal, 100 - Centro" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="responsible" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />Responsável</FormLabel>
                <FormControl><Input placeholder="Ex: João Silva" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Telefone</FormLabel>
                  <FormControl><Input placeholder="(00) 0000-0000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />Email</FormLabel>
                  <FormControl><Input placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="gradient-primary text-white border-0">
                {editingUBS ? 'Salvar Alterações' : 'Cadastrar Unidade'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UBSFormDialog;
