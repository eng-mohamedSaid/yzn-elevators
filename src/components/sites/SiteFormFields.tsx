import React from 'react';
import { Site } from '../../types';
import { Input, InputProps } from '../Input';
import { Select, SelectProps } from '../Select';
import { SITE_STAGES, CUSTOMER_TYPES, calcTotalDays } from './siteConstants';

export interface SiteFormErrors {
  siteName?:      string;
  address?:       string;
  startDate?:     string;
  endDate?:       string;
  price?:         string;
  elevatorCount?: string;
}

interface SiteFormFieldsProps {
  data: Partial<Site>;
  onChange: (patch: Partial<Site>) => void;
  errors?: SiteFormErrors;
}

export const SiteFormFields: React.FC<SiteFormFieldsProps> = ({
  data,
  onChange,
  errors = {} as SiteFormErrors,
}) => {
  const num = (val: string) => (val === '' ? 0 : Number(val));

  /** Patch + auto-recalculate totalDays when either date changes. */
  const set = (patch: Partial<Site>) => {
    const next = { ...data, ...patch };
    if ('startDate' in patch || 'endDate' in patch) {
      next.totalDays = calcTotalDays(next.startDate ?? '', next.endDate ?? '');
    }
    onChange(next);
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Input
          label="اسم الموقع" required
          placeholder="اسم الموقع أو العميل"
          value={data.siteName}
          onChange={v => set({ siteName: v })}
          error={errors.siteName}
        />
        <Input
          label="العنوان" required
          placeholder="عنوان الموقع"
          value={data.address}
          onChange={v => set({ address: v })}
          error={errors.address}
        />
        <Input
          label="رابط الموقع على الخريطة"
          placeholder="رابط Google Maps"
          value={data.mapUrl}
          onChange={v => set({ mapUrl: v })}
          className="col-span-2"
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Input
          label="تاريخ البداية" required
          type="date"
          value={data.startDate}
          onChange={v => set({ startDate: v })}
          error={errors.startDate}
        />
        <Input
          label="تاريخ النهاية" required
          type="date"
          value={data.endDate}
          onChange={v => set({ endDate: v })}
          error={errors.endDate}
        />
        {/* Read-only auto-calculated total days */}
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-secondary flex items-center gap-1">
            إجمالي أيام العمل
            <span className="text-[10px] font-normal text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">تلقائي</span>
          </label>
          <div className="w-full bg-accent/5 border border-accent/20 rounded-lg px-2.5 py-1.5 text-[13px] font-bold min-h-[36px] flex items-center text-primary">
            {data.totalDays ? `${data.totalDays} يوم` : <span className="text-secondary font-normal">يُحسب تلقائياً</span>}
          </div>
        </div>
        <Select
          label="المرحلة الحالية للموقع"
          options={SITE_STAGES}
          value={data.currentStage}
          onChange={v => set({ currentStage: v as Site['currentStage'] })}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Input
          label="عدد المصاعد" required
          type="number" placeholder="عدد"
          value={data.elevatorCount}
          onChange={v => set({ elevatorCount: num(v) })}
          error={errors.elevatorCount}
        />
        <Input
          label="نوع المصاعد"
          placeholder="مثال: جيرليس"
          value={data.elevatorType}
          onChange={v => set({ elevatorType: v })}
        />
        <Input
          label="السعر الكلي" required money suffix="جنيه"
          value={data.price}
          onChange={v => set({ price: num(v) })}
          error={errors.price}
        />
        <Select
          label="نوع العميل"
          options={CUSTOMER_TYPES}
          value={data.customerType}
          onChange={v => set({ customerType: v as Site['customerType'] })}
        />
        <Input
          label="سعر الوقفة" money suffix="جنيه"
          value={data.stopPrice}
          onChange={v => set({ stopPrice: num(v) })}
        />
        <Input
          label="عدد الوقفات"
          type="number" placeholder="عدد"
          value={data.stopsCount}
          onChange={v => set({ stopsCount: num(v) })}
        />
        <Input
          label="نوع المرحلة"
          placeholder="يكتبه المدير"
          value={data.stageType}
          onChange={v => set({ stageType: v })}
        />
        <Input
          label="عدد المراحل"
          type="number" placeholder="عدد"
          value={data.stagesCount}
          onChange={v => set({ stagesCount: num(v) })}
        />
        <Input
          label="اضافيات"
          placeholder="تفاصيل الاضافيات"
          value={data.extras}
          onChange={v => set({ extras: v })}
          className="col-span-2"
        />
        <Input
          label="سعر الاضافيات" money suffix="جنيه"
          value={data.extrasPrice}
          onChange={v => set({ extrasPrice: num(v) })}
        />
      </div>
    </>
  );
};
