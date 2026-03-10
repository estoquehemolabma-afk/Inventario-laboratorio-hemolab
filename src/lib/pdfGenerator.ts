import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UBS, Equipment, getEquipmentTypeLabel, conservationStateLabels } from '@/types/inventory';

export const generateUBSReport = (ubs: UBS, equipment: Equipment[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Green
  doc.setFillColor(34, 72, 53);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVENTÁRIO DE EQUIPAMENTOS', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Levantamento - ' + new Date().getFullYear(), pageWidth / 2, 28, { align: 'center' });

  // Unit Info
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 48, pageWidth - 28, 35, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Unidade:', 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(ubs.name, 50, 58);
  doc.setFont('helvetica', 'bold');
  doc.text('Endereço:', 20, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(ubs.address, 45, 66);
  doc.setFont('helvetica', 'bold');
  doc.text('Responsável:', 20, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(ubs.responsible, 52, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('Data:', 120, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), 135, 74);

  // Summary
  const operational = equipment.filter(e => e.conservationState === 'Funcionando').length;
  const maintenance = equipment.filter(e => e.conservationState === 'Manutenção').length;
  const decommissioned = equipment.filter(e => e.conservationState === 'Inexistente').length;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO:', 14, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${equipment.length}  |  Funcionando: ${operational}  |  Manutenção: ${maintenance}  |  Inexistente: ${decommissioned}`, 35, 95);

  // Group by location
  const equipmentByLocation = equipment.reduce((acc, eq) => {
    if (!acc[eq.location]) acc[eq.location] = [];
    acc[eq.location].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  let currentY = 105;

  Object.entries(equipmentByLocation).forEach(([location, items]) => {
    if (currentY > 250) { doc.addPage(); currentY = 20; }

    doc.setFillColor(34, 139, 34);
    doc.rect(14, currentY - 5, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(location.toUpperCase(), 18, currentY);
    currentY += 8;

    const tableData = items.map(eq => [
      getEquipmentTypeLabel(eq.type), eq.brand, eq.model, eq.serialNumber, eq.patrimonyNumber, conservationStateLabels[eq.conservationState],
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Tipo', 'Marca', 'Modelo', 'Nº Série', 'Patrimônio', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 25 }, 2: { cellWidth: 30 }, 3: { cellWidth: 35 }, 4: { cellWidth: 35 }, 5: { cellWidth: 25 } },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Signature
  if (currentY > 220) { doc.addPage(); currentY = 40; }
  currentY = Math.max(currentY, 240);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.line(20, currentY, 90, currentY);
  doc.text('Responsável pela Conferência', 25, currentY + 5);
  doc.line(120, currentY, 190, currentY);
  doc.text('Responsável pela Unidade', 130, currentY + 5);
  doc.text(`Data: ____/____/________`, pageWidth / 2, currentY + 15, { align: 'center' });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`Inventario_${ubs.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`);
};
