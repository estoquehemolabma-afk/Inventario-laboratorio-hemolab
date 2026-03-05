import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Building2, Activity, CheckCircle, XCircle, Monitor, Printer, Laptop } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { generateUBSReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

const RelatoriosPage: React.FC = () => {
  const { ubsList, getEquipmentByUBS, equipmentList } = useInventory();
  const [selectedUBS, setSelectedUBS] = useState<string>('');

  const stats = {
    functioningTotal: equipmentList.filter(eq => eq.conservationState === 'Funcionando').length,
    functioningPCs: equipmentList.filter(eq => eq.type === 'PC' && eq.conservationState === 'Funcionando').length,
    functioningPrinters: equipmentList.filter(eq => eq.type === 'Impressora' && eq.conservationState === 'Funcionando').length,
    functioningNotebooks: equipmentList.filter(eq => eq.type === 'Notebook' && eq.conservationState === 'Funcionando').length,
    deficitTotal: equipmentList.filter(eq => eq.conservationState === 'Inexistente').length,
    deficitPCs: equipmentList.filter(eq => eq.type === 'PC' && eq.conservationState === 'Inexistente').length,
    deficitPrinters: equipmentList.filter(eq => eq.type === 'Impressora' && eq.conservationState === 'Inexistente').length,
    deficitNotebooks: equipmentList.filter(eq => eq.type === 'Notebook' && eq.conservationState === 'Inexistente').length,
    grandTotal: equipmentList.filter(eq => eq.conservationState === 'Funcionando' || eq.conservationState === 'Inexistente').length
  };

  const handleGenerateReport = () => {
    if (!selectedUBS) { toast.error('Selecione uma unidade para gerar o relatório'); return; }
    const ubs = ubsList.find((u) => u.id === selectedUBS);
    if (!ubs) return;
    generateUBSReport(ubs, getEquipmentByUBS(selectedUBS));
    toast.success('Relatório PDF gerado com sucesso!');
  };

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere relatórios em PDF do inventário de equipamentos</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-8">
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 gradient-sidebar rounded-xl"><Activity className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">Resumo Geral Detalhado</h2>
              <p className="text-sm text-muted-foreground">Métricas detalhadas de equipamentos funcionando e déficit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-success flex items-center gap-2"><CheckCircle className="w-5 h-5" />Equipamentos Funcionando</h3>
              <div className="bg-success/5 rounded-lg p-4 space-y-3 border border-success/10">
                <div className="flex justify-between items-center pb-3 border-b border-success/10">
                  <span className="text-sm font-medium">Total Funcionando</span>
                  <span className="text-xl font-bold text-success">{stats.functioningTotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/50 p-3 rounded border border-success/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Monitor className="w-4 h-4" /><span className="text-xs">Computadores</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.functioningPCs}</span>
                  </div>
                  <div className="bg-card/50 p-3 rounded border border-success/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Printer className="w-4 h-4" /><span className="text-xs">Impressoras</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.functioningPrinters}</span>
                  </div>
                  <div className="bg-card/50 p-3 rounded border border-success/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Laptop className="w-4 h-4" /><span className="text-xs">Notebooks</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.functioningNotebooks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-destructive flex items-center gap-2"><XCircle className="w-5 h-5" />Déficit (Inexistente)</h3>
              <div className="bg-destructive/5 rounded-lg p-4 space-y-3 border border-destructive/10">
                <div className="flex justify-between items-center pb-3 border-b border-destructive/10">
                  <span className="text-sm font-medium">Total Déficit</span>
                  <span className="text-xl font-bold text-destructive">{stats.deficitTotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/50 p-3 rounded border border-destructive/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Monitor className="w-4 h-4" /><span className="text-xs">Computadores</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.deficitPCs}</span>
                  </div>
                  <div className="bg-card/50 p-3 rounded border border-destructive/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Printer className="w-4 h-4" /><span className="text-xs">Impressoras</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.deficitPrinters}</span>
                  </div>
                  <div className="bg-card/50 p-3 rounded border border-destructive/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Laptop className="w-4 h-4" /><span className="text-xs">Notebooks</span></div>
                    <span className="text-lg font-bold text-foreground">{stats.deficitNotebooks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
            <div className="text-sm text-muted-foreground">* Total Geral = funcionando + inexistentes (déficit).</div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Geral</p>
              <p className="text-3xl font-display font-bold text-primary">{stats.grandTotal}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 gradient-primary rounded-xl"><FileText className="w-6 h-6 text-white" /></div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Gerar PDF por Unidade</h2>
                <p className="text-sm text-muted-foreground">Documento PDF com o levantamento completo</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Selecione a Unidade</label>
                <Select value={selectedUBS} onValueChange={setSelectedUBS}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
                  <SelectContent>
                    {ubsList.map((ubs) => (
                      <SelectItem key={ubs.id} value={ubs.id}>
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4" />{ubs.name}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedUBS && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Prévia:</p>
                  <p className="font-medium text-foreground">{ubsList.find((u) => u.id === selectedUBS)?.name}</p>
                  <p className="text-sm text-muted-foreground">{getEquipmentByUBS(selectedUBS).length} equipamentos cadastrados</p>
                </motion.div>
              )}
              <Button onClick={handleGenerateReport} disabled={!selectedUBS} className="w-full gradient-primary text-white border-0">
                <Download className="w-4 h-4 mr-2" /> Gerar Relatório PDF
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default RelatoriosPage;
