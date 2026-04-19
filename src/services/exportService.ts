import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export const exportService = {
  toExcel: (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  },

  toPDF: (data: any[], columns: { header: string; dataKey: string }[], title: string) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(title, 150, 10, { align: 'center' });
    
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(item => columns.map(col => item[col.dataKey])),
      styles: { font: 'helvetica', halign: 'right' },
      headStyles: { fillColor: [212, 175, 55] },
    });
    
    doc.save(`${title}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  toWord: async (item: any, title: string) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "شركة اليزن للمصاعد",
                bold: true,
                size: 40,
                color: "0f172a"
              }),
            ],
            alignment: "center" as any
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "AL YAZEN ELEVATORS",
                bold: true,
                size: 24,
                color: "ca8a04"
              }),
            ],
            alignment: "center" as any
          }),
          new Paragraph({ text: "--------------------------------------------------", alignment: "center" as any }),
          new Paragraph({
            children: [
              new TextRun({
                text: `عرض سعر رقم: ${item.offerNumber || 'N/A'}`,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({ text: `التاريخ: ${item.date || ''}` }),
          new Paragraph({ text: `اسم العميل: ${item.customerName || ''}` }),
          new Paragraph({ text: `التليفون: ${item.phone || ''}` }),
          new Paragraph({ text: `العنوان: ${item.address || ''}` }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "المواصفات الفنية:", bold: true, underline: {} }),
            ],
          }),
          new Paragraph({ text: `نوع المصعد: ${item.elevatorType || ''}` }),
          new Paragraph({ text: `عدد الوقفات: ${item.stops || ''}` }),
          new Paragraph({ text: `الحمولة: ${item.load || ''}` }),
          new Paragraph({ text: `نوع الماكينة: ${item.machineType || ''}` }),
          new Paragraph({ text: `كارت الكنترول: ${item.controlBoard || ''}` }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `السعر الإجمالي: ${item.price?.toLocaleString() || 0} جنيه مصري`,
                bold: true,
                size: 28,
                color: "16a34a"
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "ملاحظات:", bold: true }),
            ],
          }),
          new Paragraph({ text: item.note1 || '' }),
          new Paragraph({ text: item.note2 || '' }),
          new Paragraph({ text: item.note3 || '' }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}_${item.offerNumber || format(new Date(), 'yyyy-MM-dd')}.docx`);
  }
};
