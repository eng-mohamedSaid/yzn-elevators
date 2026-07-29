import { Worker, AttendanceRecord } from '../types';

export interface SalaryReportTotals {
  presentDays:    number;
  absentDays:     number;
  totalBonus:     number;
  totalDeduction: number;
  baseComponent:  number; // monthly salary OR (presentDays × dailyRate)
  netSalary:      number;
  locations:      string[];
}

interface ReportInput {
  worker:  Worker;
  rows:    AttendanceRecord[];
  range:   { from: string; to: string };
  totals:  SalaryReportTotals;
}

const money = (n: number) => (n || 0).toLocaleString('en-US');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/**
 * Opens a styled Arabic (RTL) monthly salary report in a new window and triggers
 * the browser print dialog ("Save as PDF"). We use window.print() rather than
 * jsPDF because jsPDF's default fonts have no Arabic glyphs.
 */
export const printWorkerReport = ({ worker, rows, range, totals }: ReportInput): void => {
  const today = new Date().toISOString().slice(0, 10);

  const attendanceRows = rows.map(r => {
    const adj =
      r.adjustType === 'إضافي' ? `<span style="color:#059669">+${money(r.bonusValue)} — ${esc(r.bonusReason)}</span>`
      : r.adjustType === 'خصم' ? `<span style="color:#dc2626">-${money(r.deductionValue)} — ${esc(r.deductionReason)}</span>`
      : '—';
    return `
      <tr>
        <td>${esc(r.date)}</td>
        <td>${esc(r.day)}</td>
        <td>${r.status === 'present' ? 'حاضر' : 'غائب'}</td>
        <td>${esc(r.location) || '—'}</td>
        <td>${adj}</td>
      </tr>`;
  }).join('');

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>تقرير راتب — ${esc(worker.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1f2937; margin: 0; padding: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
  .brand { color: #b45309; font-weight: 800; font-style: italic; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
  .box .k { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .box .v { font-size: 16px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
  th, td { border: 1px solid #e5e7eb; padding: 7px 9px; text-align: right; }
  thead th { background: #f9fafb; font-size: 11px; color: #374151; }
  .totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .net { background: #111827; color: #fff; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .net .amount { font-size: 26px; font-weight: 800; color: #fbbf24; }
  .sign { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
  @media print { body { padding: 0; } @page { margin: 14mm; } }
</style>
</head>
<body>
  <h1>تقرير الراتب الشهري — <span class="brand">اليزن للمصاعد</span></h1>
  <div class="sub">الفترة من ${esc(range.from)} إلى ${esc(range.to)} · تاريخ الإصدار ${today}</div>

  <div class="grid">
    <div class="box"><div class="k">اسم الموظف</div><div class="v">${esc(worker.name)}</div></div>
    <div class="box"><div class="k">الوظيفة</div><div class="v">${esc(worker.role)}</div></div>
    <div class="box"><div class="k">نوع الراتب</div><div class="v">${esc(worker.salaryType)}</div></div>
    <div class="box"><div class="k">أيام الحضور</div><div class="v">${totals.presentDays}</div></div>
    <div class="box"><div class="k">أيام الغياب</div><div class="v">${totals.absentDays}</div></div>
    <div class="box"><div class="k">أماكن العمل</div><div class="v" style="font-size:13px">${totals.locations.map(esc).join('، ') || '—'}</div></div>
  </div>

  <table>
    <thead>
      <tr><th>التاريخ</th><th>اليوم</th><th>الحالة</th><th>مكان العمل</th><th>الإضافات / الخصومات</th></tr>
    </thead>
    <tbody>${attendanceRows}</tbody>
  </table>

  <div class="totals">
    <div class="box"><div class="k">${worker.salaryType === 'يومية' ? 'الأساسي (أيام × يومية)' : 'الراتب الأساسي'}</div><div class="v">${money(totals.baseComponent)} جنيه</div></div>
    <div class="box"><div class="k">إجمالي الإضافات</div><div class="v" style="color:#059669">+${money(totals.totalBonus)} جنيه</div></div>
    <div class="box"><div class="k">إجمالي الخصومات</div><div class="v" style="color:#dc2626">-${money(totals.totalDeduction)} جنيه</div></div>
    <div class="box"><div class="k">تاريخ الاستلام</div><div class="v">${today}</div></div>
  </div>

  <div class="net">
    <span>صافي الراتب المستحق</span>
    <span class="amount">${money(totals.netSalary)} جنيه</span>
  </div>

  <div class="sign">
    <span>توقيع المستلم: ______________</span>
    <span>توقيع المسؤول: ______________</span>
  </div>

  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة لطباعة التقرير'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
};
