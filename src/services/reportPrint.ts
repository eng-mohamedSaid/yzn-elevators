import { Worker, AttendanceRecord, Site, SiteSchedule } from '../types';
import { DataError } from './errors';

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

  openPrintWindow(html);
};

// ─────────────────────────────────────────────────────────────────────────────
// Site report — full site data + every day of the work schedule
// ─────────────────────────────────────────────────────────────────────────────

interface SiteReportInput {
  site:      Site;
  rows:      SiteSchedule[];
  /** Used to turn the tech/worker ids on each row into names. */
  workers:   Worker[];
}

/**
 * Opens the complete site file (بيانات الموقع + جدول العمل اليومي بالكامل) in a
 * new window and triggers print → "Save as PDF", ready to send to the client.
 * Landscape, because the daily log has 11 columns.
 */
export const printSiteReport = ({ site, rows, workers }: SiteReportInput): void => {
  const today = new Date().toISOString().slice(0, 10);
  const nameOf = (id: string) => workers.find(w => w.id === id)?.name ?? '';

  const totalBonus     = rows.filter(r => r.adjustType === 'إضافي').reduce((s, r) => s + (r.bonusValue || 0), 0);
  const totalDeduction = rows.filter(r => r.adjustType === 'خصم').reduce((s, r) => s + (r.deductionValue || 0), 0);
  const workedDays     = rows.filter(r => r.stageType || r.accomplished?.trim()).length;

  const scheduleRows = rows.map(r => {
    const adj =
      r.adjustType === 'إضافي' ? `<span style="color:#059669">+${money(r.bonusValue)} — ${esc(r.bonusReason)}</span>`
      : r.adjustType === 'خصم' ? `<span style="color:#dc2626">-${money(r.deductionValue)} — ${esc(r.deductionReason)}</span>`
      : '—';
    const notes = [r.notes1, r.notes2, r.notes3].filter(n => n?.trim()).map(esc).join(' · ') || '—';
    const crew  = [r.tech1Id, r.tech2Id, r.worker1Id, r.worker2Id].map(nameOf).filter(Boolean);
    return `
      <tr>
        <td>${esc(r.date)}</td>
        <td>${esc(r.day)}</td>
        <td>${esc(r.stageType) || '—'}</td>
        <td>${crew.length ? crew.map(esc).join('، ') : '—'}</td>
        <td>${esc(r.accomplished) || '—'}</td>
        <td>${notes}</td>
        <td>${adj}</td>
      </tr>`;
  }).join('');

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>ملف الموقع — ${esc(site.siteName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1f2937; margin: 0; padding: 28px; }
  h1 { font-size: 21px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
  .sub { color: #6b7280; font-size: 13px; }
  .brand { color: #b45309; font-weight: 800; font-style: italic; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 12px; }
  .box .k { font-size: 10px; color: #6b7280; margin-bottom: 3px; }
  .box .v { font-size: 14px; font-weight: 700; word-break: break-word; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: right; vertical-align: top; }
  thead th { background: #f9fafb; font-size: 10px; color: #374151; }
  tbody tr:nth-child(even) { background: #fcfcfd; }
  .totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 18px; }
  .sign { margin-top: 36px; display: flex; justify-content: space-between; font-size: 13px; color: #374151; }
  @media print {
    body { padding: 0; }
    @page { size: A4 landscape; margin: 10mm; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>ملف موقع العمل — <span class="brand">اليزن للمصاعد</span></h1>
  <div class="sub">${esc(site.siteNumber)} · ${esc(site.siteName)} · تاريخ الإصدار ${today}</div>

  <h2>بيانات الموقع</h2>
  <div class="grid">
    <div class="box"><div class="k">رقم الموقع</div><div class="v">${esc(site.siteNumber) || '—'}</div></div>
    <div class="box"><div class="k">اسم الموقع</div><div class="v">${esc(site.siteName) || '—'}</div></div>
    <div class="box" style="grid-column: span 2"><div class="k">العنوان</div><div class="v">${esc(site.address) || '—'}</div></div>
    <div class="box"><div class="k">تاريخ البداية</div><div class="v">${esc(site.startDate) || '—'}</div></div>
    <div class="box"><div class="k">تاريخ النهاية</div><div class="v">${esc(site.endDate) || '—'}</div></div>
    <div class="box"><div class="k">إجمالي أيام العمل</div><div class="v">${site.totalDays ?? 0} يوم</div></div>
    <div class="box"><div class="k">المرحلة الحالية</div><div class="v">${esc(site.currentStage) || '—'}</div></div>
    <div class="box"><div class="k">عدد المصاعد</div><div class="v">${site.elevatorCount ?? 0}</div></div>
    <div class="box"><div class="k">نوع المصاعد</div><div class="v">${esc(site.elevatorType) || '—'}</div></div>
    <div class="box"><div class="k">سعر الوقفة</div><div class="v">${money(site.stopPrice)} جنيه</div></div>
    <div class="box"><div class="k">عدد الوقفات</div><div class="v">${site.stopsCount ?? 0}</div></div>
    <div class="box"><div class="k">نوع المرحلة</div><div class="v">${esc(site.stageType) || '—'}</div></div>
    <div class="box"><div class="k">عدد المراحل</div><div class="v">${site.stagesCount ?? 0}</div></div>
    <div class="box"><div class="k">اضافيات</div><div class="v">${esc(site.extras) || '—'}</div></div>
    <div class="box"><div class="k">سعر الاضافيات</div><div class="v">${money(site.extrasPrice)} جنيه</div></div>
    <div class="box"><div class="k">نوع العميل</div><div class="v">${esc(site.customerType) || '—'}</div></div>
    <div class="box" style="grid-column: span 3"><div class="k">الموقع على الخريطة</div><div class="v" style="font-size:11px">${esc(site.mapUrl) || '—'}</div></div>
  </div>

  <h2>جدول العمل اليومي (${rows.length} يوم)</h2>
  <table>
    <thead>
      <tr>
        <th style="width:80px">التاريخ</th>
        <th style="width:70px">اليوم</th>
        <th style="width:110px">نوع المرحلة</th>
        <th style="width:180px">فريق العمل</th>
        <th>ما تم إنجازه</th>
        <th>الملاحظات</th>
        <th style="width:170px">الإضافات / الخصومات</th>
      </tr>
    </thead>
    <tbody>${scheduleRows || '<tr><td colspan="7" style="text-align:center;padding:16px">لا توجد أيام مسجّلة</td></tr>'}</tbody>
  </table>

  <div class="totals">
    <div class="box"><div class="k">السعر الكلي للموقع</div><div class="v">${money(site.price)} جنيه</div></div>
    <div class="box"><div class="k">أيام تم تسجيل عمل بها</div><div class="v">${workedDays} من ${rows.length}</div></div>
    <div class="box"><div class="k">إجمالي الإضافات</div><div class="v" style="color:#059669">+${money(totalBonus)} جنيه</div></div>
    <div class="box"><div class="k">إجمالي الخصومات</div><div class="v" style="color:#dc2626">-${money(totalDeduction)} جنيه</div></div>
  </div>

  <div class="sign">
    <span>توقيع المسؤول: ______________</span>
    <span>توقيع العميل: ______________</span>
  </div>

  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

  openPrintWindow(html);
};

/**
 * Write a report document into a new window and let it print itself.
 * Throws (rather than alerting) so the calling button can show the failure
 * inline, since a blocked popup is the usual reason nothing happens.
 */
const openPrintWindow = (html: string): void => {
  const win = window.open('', '_blank', 'width=1100,height=1000');
  if (!win) {
    throw new DataError('تعذّر فتح نافذة الطباعة. برجاء السماح بالنوافذ المنبثقة (Pop-ups) لهذا الموقع ثم المحاولة مرة أخرى.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
};
