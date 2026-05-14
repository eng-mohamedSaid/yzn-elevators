import React from 'react';
import { MapPin } from 'lucide-react';
import { MaintenanceContract } from '../../types';
import { DetailField } from '../DetailField';
import { MAINTENANCE_ELEVATOR_TYPES, CONTRACT_DURATION_LABELS, calcEndDate } from './maintenanceConstants';

interface MaintenanceDetailViewProps {
  contract: MaintenanceContract;
  formData: Partial<MaintenanceContract>;
  isEditMode: boolean;
  onChange: (patch: Partial<MaintenanceContract>) => void;
}

export const MaintenanceDetailView: React.FC<MaintenanceDetailViewProps> = ({
  contract, formData, isEditMode, onChange,
}) => {
  const num  = (v: string) => Number(v);
  const edit = isEditMode;

  const set = (patch: Partial<MaintenanceContract>) => {
    const next = { ...formData, ...patch };
    if ('maintenanceStartDate' in patch || 'contractDuration' in patch) {
      next.endDate = calcEndDate(next.maintenanceStartDate ?? '', next.contractDuration ?? '');
    }
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-1">

      {/* ── Identity ─── */}
      <DetailField label="رقم العقد"   value={contract.maintenanceNumber}      isEdit={false} />
      <DetailField label="اسم العميل"  value={formData.customerName ?? ''}     isEdit={edit} onChange={v => set({ customerName: v })} />
      <DetailField label="الرقم القومي" value={formData.nationalId ?? ''}      isEdit={edit} onChange={v => set({ nationalId: v })} />
      <DetailField label="رقم التليفون" value={formData.phone ?? ''}           isEdit={edit} onChange={v => set({ phone: v })} />
      <DetailField label="العنوان"     value={formData.address ?? ''}          isEdit={edit} onChange={v => set({ address: v })} className="sm:col-span-2" />
      <DetailField label="التاريخ"     value={formData.date ?? ''}             isEdit={edit} type="date" onChange={v => set({ date: v })} />

      {/* ── Location ─── */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-secondary uppercase">الموقع</label>
        {edit ? (
          <input
            className="w-full bg-white border border-accent/30 rounded-lg p-2 text-sm outline-none"
            value={formData.locationUrl ?? ''}
            placeholder="رابط Google Maps..."
            onChange={e => set({ locationUrl: e.target.value })}
          />
        ) : contract.locationUrl ? (
          <a href={contract.locationUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-accent/5 text-accent p-2 rounded-lg text-sm font-bold border border-accent/10">
            <MapPin size={14} /> فتح الخريطة
          </a>
        ) : (
          <span className="flex items-center gap-2 bg-gray-50 text-secondary p-2 rounded-lg text-sm font-medium border border-line">
            لا يوجد
          </span>
        )}
      </div>

      {/* ── Elevator ─── */}
      <DetailField label="نوع المصعد"  value={formData.elevatorType ?? ''}    isEdit={edit} type="select" options={MAINTENANCE_ELEVATOR_TYPES} onChange={v => set({ elevatorType: v })} />
      <DetailField label="عدد المصاعد" value={formData.elevatorCount ?? 0}    isEdit={edit} type="number" onChange={v => set({ elevatorCount: num(v) })} />
      <DetailField label="عدد الأدوار" value={formData.floors ?? 0}           isEdit={edit} type="number" onChange={v => set({ floors: num(v) })} />

      {/* ── Contract Duration ─── */}
      <DetailField label="تاريخ بدء الصيانة" value={formData.maintenanceStartDate ?? ''} isEdit={edit} type="date" onChange={v => set({ maintenanceStartDate: v })} />
      <DetailField label="مدة العقد"         value={formData.contractDuration ?? ''}    isEdit={edit} type="select" options={CONTRACT_DURATION_LABELS} onChange={v => set({ contractDuration: v })} />

      {/* Auto-calculated end date */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1">
          تاريخ الانتهاء
          <span className="text-[9px] font-normal text-accent bg-accent/10 px-1 py-0.5 rounded-full">تلقائي</span>
        </label>
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-2.5 text-sm font-bold text-primary min-h-[42px] flex items-center">
          {formData.endDate || '---'}
        </div>
      </div>

      {/* ── Price ─── */}
      <DetailField label="السعر" value={formData.price ?? 0} isEdit={edit} type="number" suffix="جنيه" onChange={v => set({ price: num(v) })} className="sm:col-span-2" />

      {/* ── Notes ─── */}
      <DetailField label="ملاحظات" value={formData.notes ?? ''} isEdit={edit} type="textarea" onChange={v => set({ notes: v })} className="sm:col-span-4" />
    </div>
  );
};
