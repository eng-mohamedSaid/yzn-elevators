import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Calendar, Printer, Save, Edit3, Briefcase } from 'lucide-react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

import { dataService } from '../services/dataService';
import { Worker, AttendanceRecord } from '../types';
import { DetailField } from '../components/DetailField';
import { WORKER_ROLES, SALARY_TYPES, ADJUST_TYPES, getWorkLocations } from '../components/workers/workerConstants';
import { printWorkerReport, SalaryReportTotals } from '../services/reportPrint';

// ── Normalize a (possibly legacy) attendance row to the full shape ────────────
const normalizeRow = (
  r: Partial<AttendanceRecord> & { bonus?: number; deduction?: number },
  workerId: string,
  day: string,
  date: string,
): AttendanceRecord => {
  // Legacy records stored flat bonus/deduction numbers.
  let adjustType = r.adjustType;
  if (!adjustType) {
    if ((r.bonus ?? 0) > 0)          adjustType = 'إضافي';
    else if ((r.deduction ?? 0) > 0) adjustType = 'خصم';
    else                             adjustType = 'لا يوجد';
  }
  return {
    id:              r.id ?? crypto.randomUUID(),
    workerId,
    day,
    date,
    status:          r.status ?? 'present',
    location:        r.location ?? '',
    adjustType,
    bonusValue:      r.bonusValue ?? r.bonus ?? 0,
    bonusReason:     r.bonusReason ?? '',
    deductionValue:  r.deductionValue ?? r.deduction ?? 0,
    deductionReason: r.deductionReason ?? '',
  };
};

export const WorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [worker, setWorker]         = useState<Worker | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData]     = useState<Partial<Worker>>({});

  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to:   format(endOfMonth(new Date()),   'yyyy-MM-dd'),
  });

  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  useEffect(() => { getWorkLocations().then(setLocationOptions); }, []);

  const loadAttendance = useCallback(async (workerId: string) => {
    const saved = (await dataService.getAll<AttendanceRecord>('attendance')).filter(a =>
      a.workerId === workerId && a.date >= dateRange.from && a.date <= dateRange.to
    );
    const days = eachDayOfInterval({ start: parseISO(dateRange.from), end: parseISO(dateRange.to) });
    setAttendance(days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const existing = saved.find(a => a.date === dateStr);
      return normalizeRow(existing ?? {}, workerId, format(d, 'EEEE', { locale: ar }), dateStr);
    }));
  }, [dateRange]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const workerData = await dataService.getById<Worker>('workers', id);
      if (workerData) {
        setWorker(workerData);
        setFormData(workerData);
        await loadAttendance(workerData.id);
      }
    })();
  }, [id, loadAttendance]);

  const updateRow = (idx: number, patch: Partial<AttendanceRecord>) =>
    setAttendance(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleSaveAttendance = async () => {
    await dataService.bulkUpsert<AttendanceRecord>('attendance', attendance);
    alert('تم حفظ سجل الحضور بنجاح');
  };

  const handleUpdateWorker = async () => {
    if (!worker) return;
    await dataService.update<Worker>('workers', worker.id, formData);
    setWorker({ ...worker, ...formData } as Worker);
    setIsEditMode(false);
  };

  // ── Totals (salary-type aware) ──────────────────────────────────────────────
  const totals: SalaryReportTotals = useMemo(() => {
    const presentDays = attendance.filter(r => r.status === 'present').length;
    const absentDays  = attendance.filter(r => r.status === 'absent').length;
    const totalBonus = attendance
      .filter(r => r.adjustType === 'إضافي')
      .reduce((s, r) => s + (r.bonusValue || 0), 0);
    const totalDeduction = attendance
      .filter(r => r.adjustType === 'خصم')
      .reduce((s, r) => s + (r.deductionValue || 0), 0);
    const salary = worker?.baseSalary ?? 0;
    const baseComponent = worker?.salaryType === 'يومية' ? presentDays * salary : salary;
    const netSalary = baseComponent + totalBonus - totalDeduction;
    const locations = Array.from(new Set(attendance.map(r => r.location).filter(Boolean)));
    return { presentDays, absentDays, totalBonus, totalDeduction, baseComponent, netSalary, locations };
  }, [attendance, worker]);

  const handlePrint = () => {
    if (!worker) return;
    printWorkerReport({ worker, rows: attendance, range: dateRange, totals });
  };

  if (!worker) return <div>جاري التحميل...</div>;

  const locationsForSelect = Array.from(new Set([...locationOptions, ...attendance.map(a => a.location).filter(Boolean)]));

  return (
    <div className="space-y-8 pb-32">
      <button onClick={() => navigate('/workers')} className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-all">
        <ChevronRight size={20} />
        الرجوع للموظفين
      </button>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white border border-line rounded-2xl flex items-center justify-center text-accent shadow-sm">
            <Users size={32} />
          </div>
          <div>
            <span className="badge badge-success mb-1 inline-block">{worker.role}</span>
            <h1 className="text-3xl font-bold tracking-tight">{worker.name}</h1>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setIsEditMode(!isEditMode)} className="flex-1 sm:flex-none px-6 py-3 bg-white border border-line rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-bg transition-colors">
            <Edit3 size={18} /> {isEditMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
          </button>
          <button onClick={handlePrint} title="طباعة تقرير الراتب" className="bg-primary text-white p-3 rounded-xl shadow-sm border border-primary hover:opacity-90 transition-opacity">
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Personal data ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 card bg-white space-y-6 self-start">
          <h3 className="font-bold flex items-center gap-2 text-secondary text-xs uppercase tracking-widest">
            <Briefcase size={14} className="text-accent" /> البيانات الشخصية
          </h3>
          <div className="space-y-4">
            <DetailField label="نوع الموظف" value={formData.role ?? ''} isEdit={isEditMode} type="select" options={[...WORKER_ROLES]} onChange={v => setFormData({ ...formData, role: v as Worker['role'] })} />
            <DetailField label="نوع الراتب" value={formData.salaryType ?? ''} isEdit={isEditMode} type="select" options={[...SALARY_TYPES]} onChange={v => setFormData({ ...formData, salaryType: v as Worker['salaryType'] })} />
            <DetailField label="قيمة الراتب" value={formData.baseSalary ?? 0} isEdit={isEditMode} type="number" suffix="جنيه" onChange={v => setFormData({ ...formData, baseSalary: Number(v) })} />
            <DetailField label="تاريخ الالتحاق" value={formData.joinDate ?? ''} isEdit={isEditMode} type="date" onChange={v => setFormData({ ...formData, joinDate: v })} />
            <DetailField label="ملاحظات" value={formData.notes ?? ''} isEdit={isEditMode} type="textarea" onChange={v => setFormData({ ...formData, notes: v })} />
          </div>
          {isEditMode && (
            <button onClick={handleUpdateWorker} className="w-full btn-primary py-3 rounded-xl shadow-sm">حفظ التعديلات</button>
          )}
        </div>

        {/* ── Attendance + salary ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Calendar className="text-accent" />
              سجل الحضور والراتب
            </h2>
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-line shadow-sm">
              <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} className="text-xs font-bold outline-none bg-transparent" />
              <span className="text-line">|</span>
              <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} className="text-xs font-bold outline-none bg-transparent" />
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl border border-line shadow-sm">
            <table className="w-full text-right min-w-[820px] text-sm">
              <thead className="bg-[#fcfcfc] border-b border-line">
                <tr>
                  <th className="px-4 py-4 font-bold text-xs text-secondary uppercase">اليوم</th>
                  <th className="px-4 py-4 font-bold text-xs text-secondary uppercase">التاريخ</th>
                  <th className="px-4 py-4 font-bold text-xs text-secondary uppercase">الحالة</th>
                  <th className="px-4 py-4 font-bold text-xs text-secondary uppercase">مكان العمل</th>
                  <th className="px-4 py-4 font-bold text-xs text-secondary uppercase min-w-[16rem]">الإضافات والخصومات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-primary">
                {attendance.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-bg transition-colors align-top">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{row.day}</td>
                    <td className="px-4 py-3 text-[11px] text-secondary font-bold whitespace-nowrap">{row.date}</td>
                    <td className="px-2 py-2">
                      <select
                        value={row.status}
                        onChange={e => updateRow(idx, { status: e.target.value as AttendanceRecord['status'] })}
                        className={`text-[11px] font-bold px-2 py-1 rounded-full outline-none border ${row.status === 'present' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}
                      >
                        <option value="present">حاضر</option>
                        <option value="absent">غائب</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={row.location}
                        onChange={e => updateRow(idx, { location: e.target.value })}
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer min-w-[9rem]"
                      >
                        <option value="">- المكان -</option>
                        {locationsForSelect.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <AdjustCell row={row} onChange={patch => updateRow(idx, patch)} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-primary text-white font-bold">
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-xs">
                    حضور {totals.presentDays} · غياب {totals.absentDays}
                  </td>
                  <td className="px-4 py-4 text-left" colSpan={3}>
                    <div className="flex justify-end gap-4 items-center flex-wrap">
                      <span className="text-green-400 font-mono">+{totals.totalBonus.toLocaleString()}</span>
                      <span className="text-red-400 font-mono">-{totals.totalDeduction.toLocaleString()}</span>
                      <span className="text-white/50 uppercase text-[10px]">صافي الراتب:</span>
                      <span className="text-xl font-mono text-accent">{totals.netSalary.toLocaleString()} جنيه</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={handlePrint} className="bg-white border border-line text-secondary font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-bg transition-colors">
              <Printer size={18} /> طباعة تقرير الراتب (PDF)
            </button>
            <button onClick={handleSaveAttendance} className="btn-primary flex items-center gap-2 shadow-sm">
              <Save size={20} /> حفظ سجل الحضور
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Per-day additions / deductions cell ──────────────────────────────────────
const AdjustCell = ({ row, onChange }: { row: AttendanceRecord; onChange: (patch: Partial<AttendanceRecord>) => void }) => (
  <div className="space-y-2 min-w-[15rem]">
    <select
      value={row.adjustType}
      onChange={e => onChange({ adjustType: e.target.value as AttendanceRecord['adjustType'] })}
      className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer font-bold"
    >
      {ADJUST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>

    {row.adjustType === 'إضافي' && (
      <div className="flex gap-1">
        <input type="number" value={row.bonusValue || ''} placeholder="قيمة الإضافة"
          onChange={e => onChange({ bonusValue: Number(e.target.value) })}
          className="w-24 bg-green-50 text-green-700 font-bold rounded-lg p-2 text-xs outline-none border border-green-100" />
        <input value={row.bonusReason} placeholder="سبب الإضافة"
          onChange={e => onChange({ bonusReason: e.target.value })}
          className="flex-1 bg-gray-50 rounded-lg p-2 text-xs outline-none border border-transparent focus:border-primary/30" />
      </div>
    )}

    {row.adjustType === 'خصم' && (
      <div className="flex gap-1">
        <input type="number" value={row.deductionValue || ''} placeholder="قيمة الخصم"
          onChange={e => onChange({ deductionValue: Number(e.target.value) })}
          className="w-24 bg-red-50 text-red-700 font-bold rounded-lg p-2 text-xs outline-none border border-red-100" />
        <input value={row.deductionReason} placeholder="سبب الخصم"
          onChange={e => onChange({ deductionReason: e.target.value })}
          className="flex-1 bg-gray-50 rounded-lg p-2 text-xs outline-none border border-transparent focus:border-primary/30" />
      </div>
    )}
  </div>
);
