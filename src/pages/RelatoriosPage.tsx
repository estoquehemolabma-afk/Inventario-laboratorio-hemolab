import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Building2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { generateUBSReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

const RelatoriosPage: React.FC = () => {
  const { ubsList, getEquipmentByUBS } = useInventory();
  const [selectedUBS, setSelectedUBS] = useState<string>('');

  const handleGenerateReport = () => {
    if (!selectedUBS) {
      toast.error('Selecione uma UBS para gerar o relatório');
      return;
    }

    const ubs = ubsList.find((u) => u.id === selectedUBS);
    if (!ubs) return;

    const equipment = getEquipmentByUBS(selectedUBS);
    generateUBSReport(ubs, equipment);
    toast.success('Relatório PDF gerado com sucesso!');
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-display font-bold text-foreground">
          Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">
          Gere relatórios em PDF do inventário de equipamentos
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 gradient-primary rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                Relatório de Inventário por UBS
              </h2>
              <p className="text-sm text-muted-foreground">
                Gere um documento PDF com o levantamento completo de equipamentos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Selecione a Unidade de Saúde
              </label>
              <Select value={selectedUBS} onValueChange={setSelectedUBS}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma UBS" />
                </SelectTrigger>
                <SelectContent>
                  {ubsList.map((ubs) => (
                    <SelectItem key={ubs.id} value={ubs.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {ubs.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUBS && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted rounded-lg p-4"
              >
                <p className="text-sm text-muted-foreground mb-2">Prévia:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {ubsList.find((u) => u.id === selectedUBS)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getEquipmentByUBS(selectedUBS).length} equipamentos cadastrados
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <Button
              onClick={handleGenerateReport}
              disabled={!selectedUBS}
              className="w-full gradient-primary text-white border-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório PDF
            </Button>
          </div>
        </div>

        <div className="mt-6 bg-muted/50 rounded-xl p-6 border border-border/50">
          <h3 className="font-display font-semibold text-foreground mb-3">
            O que contém o relatório?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Informações completas da UBS (nome, endereço, responsável)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Resumo quantitativo por estado de conservação
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Lista de equipamentos organizada por setor/local
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Campos para assinatura de conferência
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Data e hora de geração do documento
            </li>
          </ul>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default RelatoriosPage;
