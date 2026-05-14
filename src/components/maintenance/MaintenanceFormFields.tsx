import React from 'react';
import { MaintenanceContract } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';
import { DetailField } from '../DetailField';
import {
  MAINTENANCE_ELEVATOR_TYPES,
  CONTRACT_DURATION_LABELS,
  calcEndDate,
} from './maintenanceConstants';

export interface MaintenanceFormErrors {
  customerName?:         string;
  address?:             string;
  floors?:              string;
  elevatorCount?:       string;
  maintenanceStartDate?: string;
  contractDuration?:    string;
  price?:               string;
}

interface MaintenanceFormFieldsProps {
  data: Partial<MaintenanceContract>;
  onChange: (patch: Partial<MaintenanceContract>) => void;
  errors?: MaintenanceFormErrors;
}

export const MaintenanceFormFields: React.FC<MaintenanceFormFieldsProps> = ({
  data,
  onChange,
  errors = {} as MaintenanceFormErrors,
}) => {
  const num = (val: string) => (val === '' ? 0 : Number(val));

  /** Patch + auto-recalculate endDate when relevant fields change */
  const set = (patch: Partial<MaintenanceContract>) => {
    const next = { ...data, ...patch };
    if ('maintenanceStartDate' in patch || 'contractDuration' in patch) {
      next.endDate = calcEndDate(
        next.maintenanceStartDate ?? '',
        next.contractDuration ?? ''
      );
    }
    onChange(next);
  };

  return (
    <>
      {/* ── Customer Info ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <Input
          label="اسم العميل" required
          placeholder="اسم العميل بالكامل"
          value={data.customerName}
          onChange={v => set({ customerName: v })}
          error={errors.customerName}
        />
        <Input
          label="رقم التليفون"
          type="number"
          placeholder="مثال: 01xxxxxxxxx"
          value={data.phone}
          onChange={v => set({ phone: v })}
        />
        <Input
          label="الرقم القومي"
          placeholder="14 رقم"
          value={data.nationalId}
          onChange={v => set({ nationalId: v })}
        />
        <Input label="التاريخ" type="date" value={data.date} onChange={v => set({ date: v })} />
        <Input
          label="العنوان" required
          placeholder="عنوان العقار"
          value={data.address}
          onChange={v => set({ address: v })}
          error={errors.address}
        />
        <Input
          label="رابط الموقع"
          placeholder="رابط Google Maps"
          value={data.locationUrl}
          onChange={v => set({ locationUrl: v })}
        />
      </div>

      {/* ── Elevator Specs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mt-4">
        <Select
          label="نوع المصعد"
          options={MAINTENANCE_ELEVATOR_TYPES}
          value={data.elevatorType}
          onChange={v => set({ elevatorType: v })}
        />
        <Input
          label="عدد المصاعد" required
          type="number" placeholder="عدد"
          value={data.elevatorCount}
          onChange={v => set({ elevatorCount: num(v) })}
          error={errors.elevatorCount}
        />
        <Input
          label="عدد الأدوار" required
          type="number" placeholder="عدد"
          value={data.floors}
          onChange={v => set({ floors: num(v) })}
          error={errors.floors}
        />
      </div>

      {/* ── Contract Duration (auto endDate) ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mt-4">
        <Input
          label="تاريخ بدء الصيانة" required
          type="date"
          value={data.maintenanceStartDate}
          onChange={v => set({ maintenanceStartDate: v })}
          error={errors.maintenanceStartDate}
        />
        <Select
          label="مدة العقد" required
          options={CONTRACT_DURATION_LABELS}
          value={data.contractDuration}
          onChange={v => set({ contractDuration: v })}
          error={errors.contractDuration}
        />
        {/* Read-only auto-calculated field */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-secondary flex items-center gap-1">
            تاريخ الانتهاء
            <span className="text-[10px] font-normal text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">تلقائي</span>
          </label>
          <div className="w-full bg-accent/5 border border-accent/20 rounded-xl p-2.5 sm:p-3 text-sm font-bold min-h-[44px] sm:min-h-[46px] flex items-center text-primary">
            {data.endDate || <span className="text-secondary font-normal">يُحسب تلقائياً</span>}
          </div>
        </div>
      </div>

      {/* ── Price & Notes ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mt-4">
        <Input
          label="السعر" required money
          suffix="جنيه"
          value={data.price}
          onChange={v => set({ price: num(v) })}
          error={errors.price}
        />
        <div className="sm:col-span-1" /> {/* spacer */}
        <DetailField
          label="ملاحظات"
          value={data.notes ?? ''}
          isEdit
          type="textarea"
          onChange={v => set({ notes: v })}
          className="sm:col-span-2"
        />
      </div>
    </>
  );
};
