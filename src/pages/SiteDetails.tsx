import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, Save, Trash2, Edit3, Map } from 'lucide-react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

import { dataService } from '../services/dataService';
import { DataError } from '../services/errors';
import { Site, SiteSchedule, Worker } from '../types';
import { DetailField } from '../components/DetailField';
import {
  SITE_STAGES,
  CUSTOMER_TYPES,
  ADJUST_TYPES,
  TECH_ROLES,
  WORKER_ROLES,
  calcTotalDays,
} from '../components/sites/siteConstants';

import { ConfirmDeleteModal } from '../components/shared/ConfirmDeleteModal';
import { LoadingState }   from '../components/ui/LoadingState';
import { ErrorState }     from '../components/ui/ErrorState';
import { InlineAlert }    from '../components/ui/InlineAlert';
import { LoadingButton }  from '../components/ui/LoadingButton';
import { useAsyncData }   from '../hooks/useAsyncData';
import { useAsyncAction } from '../hooks/useAsyncAction';

// ── Normalize a (possibly legacy) schedule row to the full shape ──────────────
const normalizeRow = (
  r: Partial<SiteSchedule>,
  siteId: string,
  day: string,
  date: string,
): SiteSchedule => ({
  id:              r.id ?? crypto.randomUUID(),
  siteId,
  day,
  date,
  stageType:       r.stageType ?? '',
  tech1Id:         r.tech1Id ?? '',
  tech2Id:         r.tech2Id ?? '',
  worker1Id:       r.worker1Id ?? '',
  worker2Id:       r.worker2Id ?? '',
  accomplished:    r.accomplished ?? '',
  notes1:          r.notes1 ?? r.notes ?? '',
  notes2:          r.notes2 ?? '',
  notes3:          r.notes3 ?? '',
  adjustType:      r.adjustType ?? 'لا يوجد',
  bonusValue:      r.bonusValue ?? 0,
  bonusReason:     r.bonusReason ?? '',
  deductionValue:  r.deductionValue ?? 0,
  deductionReason: r.deductionReason ?? '',
});

/** Build the editable day-grid: saved rows if any, otherwise one row per day. */
const buildSchedule = (siteData: Site, saved: SiteSchedule[]): SiteSchedule[] => {
  const existing = saved.filter(s => s.siteId === siteData.id);

  if (existing.length > 0) {
    return existing
      .map(r => normalizeRow(r, siteData.id, r.day, r.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  if (!siteData.startDate || !siteData.endDate) return [];
  const days = eachDayOfInterval({ start: parseISO(siteData.startDate), end: parseISO(siteData.endDate) });
  return days.map(d =>
    normalizeRow({}, siteData.id, format(d, 'EEEE', { locale: ar }), format(d, 'yyyy-MM-dd'))
  );
};

export const SiteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Load everything the page needs in one request set ───────────────────────
  const { data, isLoading, isFetching, error, reload } = useAsyncData(async () => {
    if (!id) throw new DataError('لم يتم تحديد الموقع المطلوب.');
    const [siteData, workersData, savedSchedule] = await Promise.all([
      dataService.getById<Site>('sites', id),
      dataService.getAll<Worker>('workers'),
      dataService.getAll<SiteSchedule>('schedule'),
    ]);
    if (!siteData) throw new DataError('هذا الموقع غير موجود أو تم حذفه. عد لقائمة المواقع واختر موقعاً آخر.');
    return { site: siteData, workers: workersData, schedules: buildSchedule(siteData, savedSchedule) };
  }, [id]);

  // ── Editable copies of the loaded data ──────────────────────────────────────
  const [site, setSite]             = useState<Site | null>(null);
  const [schedules, setSchedules]   = useState<SiteSchedule[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData]     = useState<Partial<Site>>({});
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [scheduleSaved, setScheduleSaved]     = useState(false);
  const [siteSaved, setSiteSaved]             = useState(false);

  useEffect(() => {
    if (!data) return;
    setSite(data.site);
    setFormData(data.site);
    setSchedules(data.schedules);
  }, [data]);

  /** Patch a single schedule row by index. */
  const updateRow = (idx: number, patch: Partial<SiteSchedule>) =>
    setSchedules(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const saveSchedule = useAsyncAction(async () => {
    await dataService.bulkUpsert<SiteSchedule>('schedule', schedules);
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 4000);
  });

  /** Patch the site form + auto-recalc totalDays when dates change. */
  const setField = (patch: Partial<Site>) => {
    const next = { ...formData, ...patch };
    if ('startDate' in patch || 'endDate' in patch) {
      next.totalDays = calcTotalDays(next.startDate ?? '', next.endDate ?? '');
    }
    setFormData(next);
  };

  const saveSite = useAsyncAction(async () => {
    if (!site) return;
    await dataService.update<Site>('sites', site.id, formData);
    setSite({ ...site, ...formData } as Site);
    setIsEditMode(false);
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 4000);
  });

  const removeSite = useAsyncAction(async () => {
    await dataService.delete('sites', id!);
    navigate('/sites');
  });

  const backLink = (
    <button onClick={() => navigate('/sites')} className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-all">
      <ChevronRight size={20} />
      الرجوع للمواقع
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {backLink}
        <LoadingState hint="يتم الآن جلب بيانات الموقع وجدول العمل" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="space-y-6">
        {backLink}
        <ErrorState error={error} onRetry={reload} isRetrying={isFetching} title="تعذّر تحميل بيانات الموقع" />
      </div>
    );
  }

  // Technician slots take مهندس/فني; worker slots take مساعد/مساعد أول.
  const workers = data?.workers ?? [];
  const techs   = workers.filter(w => TECH_ROLES.includes(w.role));
  const labors  = workers.filter(w => WORKER_ROLES.includes(w.role));

  return (
    <div className="space-y-8 pb-32">
      {backLink}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-bg border border-line rounded-2xl flex items-center justify-center text-accent shadow-sm">
            <MapPin size={32} />
          </div>
          <div>
            <span className="badge badge-success mb-1 inline-block">{site.siteNumber}</span>
            <h1 className="text-2xl font-bold tracking-tight">{site.siteName}</h1>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => { saveSite.clearError(); setIsEditMode(!isEditMode); }}
            disabled={saveSite.isPending}
            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-line rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-bg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Edit3 size={18} /> {isEditMode ? 'إلغاء التعديل' : 'تعديل البيانات'}
          </button>
          <button
            onClick={() => { removeSite.clearError(); setIsConfirmDelete(true); }}
            className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* ── Site Data ─────────────────────────────────────────────────────── */}
      <div className="card bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <DetailField label="العنوان" value={formData.address ?? ''} isEdit={isEditMode} onChange={v => setField({ address: v })} className="col-span-2" />
          <DetailField label="تاريخ البداية" value={formData.startDate ?? ''} isEdit={isEditMode} type="date" onChange={v => setField({ startDate: v })} />
          <DetailField label="تاريخ النهاية" value={formData.endDate ?? ''} isEdit={isEditMode} type="date" onChange={v => setField({ endDate: v })} />
          <DetailField label="إجمالي أيام العمل" value={`${formData.totalDays ?? 0} يوم`} isEdit={false} />
          <DetailField label="السعر الكلي" value={formData.price ?? 0} isEdit={isEditMode} type="number" suffix="جنيه" onChange={v => setField({ price: Number(v) })} />
          <DetailField label="عدد المصاعد" value={formData.elevatorCount ?? 0} isEdit={isEditMode} type="number" onChange={v => setField({ elevatorCount: Number(v) })} />
          <DetailField label="نوع المصاعد" value={formData.elevatorType ?? ''} isEdit={isEditMode} onChange={v => setField({ elevatorType: v })} />
          <DetailField label="سعر الوقفة" value={formData.stopPrice ?? 0} isEdit={isEditMode} type="number" suffix="جنيه" onChange={v => setField({ stopPrice: Number(v) })} />
          <DetailField label="عدد الوقفات" value={formData.stopsCount ?? 0} isEdit={isEditMode} type="number" onChange={v => setField({ stopsCount: Number(v) })} />
          <DetailField label="سعر المرحلة" value={formData.stagePrice ?? 0} isEdit={isEditMode} type="number" suffix="جنيه" onChange={v => setField({ stagePrice: Number(v) })} />
          <DetailField label="عدد المراحل" value={formData.stagesCount ?? 0} isEdit={isEditMode} type="number" onChange={v => setField({ stagesCount: Number(v) })} />
          <DetailField label="نوع العميل" value={formData.customerType ?? ''} isEdit={isEditMode} type="select" options={[...CUSTOMER_TYPES]} onChange={v => setField({ customerType: v as Site['customerType'] })} />
          <DetailField label="المرحلة الحالية" value={formData.currentStage ?? ''} isEdit={isEditMode} type="select" options={[...SITE_STAGES]} onChange={v => setField({ currentStage: v as Site['currentStage'] })} />
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-secondary uppercase block mb-1">الموقع على الخريطة</label>
            {site.mapUrl ? (
              <a href={site.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent font-bold text-sm bg-bg border border-line px-4 py-2 rounded-lg w-fit hover:bg-line transition-colors">
                <Map size={16} /> فتح Google Maps
              </a>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm bg-bg border border-line px-4 py-2 rounded-lg w-fit">
                <Map size={16} /> لا يوجد
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <InlineAlert error={saveSite.error} onRetry={() => saveSite.run()} isRetrying={saveSite.isPending} />
          {siteSaved && <InlineAlert variant="success" message="تم حفظ بيانات الموقع بنجاح." />}
          {isEditMode && (
            <LoadingButton
              onClick={() => saveSite.run()}
              isLoading={saveSite.isPending}
              loadingText="جاري الحفظ..."
              className="btn-primary px-8 py-3 rounded-xl shadow-sm"
            >
              حفظ البيانات
            </LoadingButton>
          )}
        </div>
      </div>

      {/* ── Daily Work Log ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="text-accent" />
            جدول العمل اليومي
          </h2>
          <LoadingButton
            onClick={() => saveSchedule.run()}
            isLoading={saveSchedule.isPending}
            loadingText="جاري الحفظ..."
            className="btn-primary px-6 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2"
          >
            <Save size={18} /> حفظ الجدول
          </LoadingButton>
        </div>

        <InlineAlert error={saveSchedule.error} onRetry={() => saveSchedule.run()} isRetrying={saveSchedule.isPending} />
        {scheduleSaved && <InlineAlert variant="success" message="تم حفظ الجدول بنجاح." />}

        <div className="overflow-x-auto bg-white rounded-xl border border-line shadow-sm">
          <table className="w-full text-right min-w-[1400px] text-sm">
            <thead className="bg-[#fcfcfc] border-b border-line">
              <tr>
                <th className="px-3 py-4 sticky right-0 bg-[#fcfcfc] z-10 w-28 border-l border-line font-bold text-xs text-secondary uppercase">التاريخ</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">اليوم</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">نوع المرحلة</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase text-center">الفني الأول</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase text-center">الفني الثاني</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase text-center">العامل الأول</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase text-center">العامل الثاني</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">ما تم إنجازه</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">ملاحظات ١</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">ملاحظات ٢</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase">ملاحظات ٣</th>
                <th className="px-3 py-4 font-bold text-xs text-secondary uppercase min-w-[16rem]">الإضافات والخصومات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-primary">
              {schedules.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-all align-top">
                  <td className="px-3 py-3 font-bold text-xs sticky right-0 bg-white z-10 border-l border-gray-100 whitespace-nowrap">{row.date}</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{row.day}</td>
                  <td className="px-2 py-2">
                    <select
                      value={row.stageType}
                      onChange={e => updateRow(idx, { stageType: e.target.value as SiteSchedule['stageType'] })}
                      className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer min-w-[7rem]"
                    >
                      <option value="">- المرحلة -</option>
                      {SITE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2"><WorkerSelect workers={techs}  value={row.tech1Id}   onChange={v => updateRow(idx, { tech1Id: v })} /></td>
                  <td className="px-2 py-2"><WorkerSelect workers={techs}  value={row.tech2Id}   onChange={v => updateRow(idx, { tech2Id: v })} /></td>
                  <td className="px-2 py-2"><WorkerSelect workers={labors} value={row.worker1Id} onChange={v => updateRow(idx, { worker1Id: v })} /></td>
                  <td className="px-2 py-2"><WorkerSelect workers={labors} value={row.worker2Id} onChange={v => updateRow(idx, { worker2Id: v })} /></td>
                  <td className="px-2 py-2">
                    <input
                      className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none min-w-[9rem]"
                      value={row.accomplished}
                      placeholder="ما تم إنجازه..."
                      onChange={e => updateRow(idx, { accomplished: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none min-w-[7rem]" value={row.notes1} placeholder="ملاحظة..." onChange={e => updateRow(idx, { notes1: e.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none min-w-[7rem]" value={row.notes2} placeholder="ملاحظة..." onChange={e => updateRow(idx, { notes2: e.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <input className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none min-w-[7rem]" value={row.notes3} placeholder="ملاحظة..." onChange={e => updateRow(idx, { notes3: e.target.value })} />
                  </td>
                  <td className="px-2 py-2">
                    <AdjustCell row={row} onChange={patch => updateRow(idx, patch)} />
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-secondary text-sm">
                    لا توجد أيام — تأكد من تحديد تاريخ البداية والنهاية للموقع.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isConfirmDelete}
        onClose={() => setIsConfirmDelete(false)}
        onConfirm={removeSite.run}
        entityLabel="هذا الموقع"
        isDeleting={removeSite.isPending}
        deleteError={removeSite.error}
      />
    </div>
  );
};

// ── Worker slot dropdown ──────────────────────────────────────────────────────
const WorkerSelect = ({ workers, value, onChange }: { workers: Worker[]; value: string; onChange: (val: string) => void }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer min-w-[7rem]"
  >
    <option value="">- لم يحدد -</option>
    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
  </select>
);

// ── Per-day additions / deductions cell ──────────────────────────────────────
const AdjustCell = ({ row, onChange }: { row: SiteSchedule; onChange: (patch: Partial<SiteSchedule>) => void }) => (
  <div className="space-y-2 min-w-[15rem]">
    <select
      value={row.adjustType}
      onChange={e => onChange({ adjustType: e.target.value as SiteSchedule['adjustType'] })}
      className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/30 rounded-lg p-2 text-xs outline-none cursor-pointer font-bold"
    >
      {ADJUST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>

    {row.adjustType === 'إضافي' && (
      <div className="flex gap-1">
        <input type="number" value={row.bonusValue || ''} placeholder="قيمة الإضافة"
          onChange={e => onChange({ bonusValue: Number(e.target.value) })}
          className="w-20 bg-green-50 text-green-700 font-bold rounded-lg p-2 text-xs outline-none border border-green-100" />
        <input value={row.bonusReason} placeholder="سبب الإضافة"
          onChange={e => onChange({ bonusReason: e.target.value })}
          className="flex-1 bg-gray-50 rounded-lg p-2 text-xs outline-none border border-transparent focus:border-primary/30" />
      </div>
    )}

    {row.adjustType === 'خصم' && (
      <div className="flex gap-1">
        <input type="number" value={row.deductionValue || ''} placeholder="قيمة الخصم"
          onChange={e => onChange({ deductionValue: Number(e.target.value) })}
          className="w-20 bg-red-50 text-red-700 font-bold rounded-lg p-2 text-xs outline-none border border-red-100" />
        <input value={row.deductionReason} placeholder="سبب الخصم"
          onChange={e => onChange({ deductionReason: e.target.value })}
          className="flex-1 bg-gray-50 rounded-lg p-2 text-xs outline-none border border-transparent focus:border-primary/30" />
      </div>
    )}
  </div>
);
