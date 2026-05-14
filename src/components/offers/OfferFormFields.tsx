import React from 'react';
import { Offer } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';
import { DetailField } from '../DetailField';
import {
  ELEVATOR_TYPES, MACHINE_TYPES, CONTROL_BOARDS,
  BATTERIES, VVVFS, RAILS, REMOVAL_OPTIONS, CUSTOMER_TYPES,
} from './offerConstants';

/** Explicit interface — only the fields that can fail validation */
export interface OfferFormErrors {
  customerName?: string;
  address?:      string;
  floors?:       string;
  price?:        string;
  payment1?:     string;
  payment2?:     string;
  payment3?:     string;
  payment4?:     string;
}

interface OfferFormFieldsProps {
  data: Partial<Offer>;
  onChange: (patch: Partial<Offer>) => void;
  errors?: OfferFormErrors;
}

/** Shared form grid used in both Add and Edit modes */
export const OfferFormFields: React.FC<OfferFormFieldsProps> = ({ data, onChange, errors = {} as OfferFormErrors }) => {
  const set = (patch: Partial<Offer>) => onChange({ ...data, ...patch });
  const num = (val: string) => (val === '' ? 0 : Number(val));

  return (
    <>
      {/* ── Customer Info ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <Input
          label="اسم العميل" required
          placeholder="أدخل اسم العميل بالكامل"
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
          label="العنوان" required
          placeholder="أدخل عنوان العميل"
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

      {/* ── Elevator Specs ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mt-4">
        <Input  label="التاريخ"      type="date"  value={data.date}         onChange={v => set({ date: v })} />
        <Select label="نوع العميل"   options={CUSTOMER_TYPES}  value={data.customerType}   onChange={v => set({ customerType: v as any })} />
        <Select label="نوع المصعد"   options={ELEVATOR_TYPES}  value={data.elevatorType}   onChange={v => set({ elevatorType: v })} />

        <Input  label="عدد المصاعد"  type="number" placeholder="عدد" value={data.elevatorCount} onChange={v => set({ elevatorCount: num(v) })} />
        <Input  label="الوقفات"      type="number" placeholder="عدد" value={data.stops}         onChange={v => set({ stops: num(v) })} />

        <Input
          label="الطوابق" required
          type="number" placeholder="عدد"
          value={data.floors}
          onChange={v => set({ floors: num(v) })}
          error={errors.floors}
        />
        <Input  label="المداخل"      type="number" placeholder="عدد" value={data.entrances} onChange={v => set({ entrances: num(v) })} />
        <Input  label="الحمولة"      placeholder="مثال: 450 كجم"    value={data.load}      onChange={v => set({ load: v })} />

        {/* ── Machine & Electronics ─── */}
        <Select label="نوع الماكينة"  options={MACHINE_TYPES}  value={data.machineType}  onChange={v => set({ machineType: v })} />
        <Select label="كارت الكنترول" options={CONTROL_BOARDS} value={data.controlBoard} onChange={v => set({ controlBoard: v })} />
        <Select label="البطارية"      options={BATTERIES}      value={data.battery}      onChange={v => set({ battery: v })} />
        <Select label="VVVF"          options={VVVFS}          value={data.vvvf}         onChange={v => set({ vvvf: v })} />
        <Select label="القضبان"       options={RAILS}          value={data.rails}        onChange={v => set({ rails: v })} />

        {/* ── Payments ─── */}
        <Input
          label="دفعة 1" required money
          value={data.payment1}
          onChange={v => set({ payment1: num(v) })}
          error={errors.payment1}
        />
        <Input
          label="دفعة 2" required money
          value={data.payment2}
          onChange={v => set({ payment2: num(v) })}
          error={errors.payment2}
        />
        <Input
          label="دفعة 3" required money
          value={data.payment3}
          onChange={v => set({ payment3: num(v) })}
          error={errors.payment3}
        />
        <Input
          label="دفعة 4" required money
          value={data.payment4}
          onChange={v => set({ payment4: num(v) })}
          error={errors.payment4}
        />

        {/* ── Door & Pit ─── */}
        <Input label="نوع الباب"           placeholder="مثال: نصف اتوماتيك" value={data.doorType}              onChange={v => set({ doorType: v })} />
        <Input label="الباب الداخلي"       placeholder="مثال: اتوماتيك"      value={data.innerDoor}             onChange={v => set({ innerDoor: v })} />
        <Input label="مقاس الباب"          type="number" placeholder="بالسم" value={data.doorSize}              onChange={v => set({ doorSize: num(v) })} />
        <Input label="عرض البئر"           type="number" placeholder="بالسم" value={data.pitWidth}              onChange={v => set({ pitWidth: num(v) })} />
        <Input label="ارتفاع الدور الأخير" type="number" placeholder="بالمتر" value={data.lastFloorHeight}      onChange={v => set({ lastFloorHeight: num(v) })} />
        <Input label="حفرة البئر"          type="number" placeholder="بالسم" value={data.pitDepth}              onChange={v => set({ pitDepth: num(v) })} />
        <Input label="طول البئر"           type="number" placeholder="بالسم" value={data.pitLength}             onChange={v => set({ pitLength: num(v) })} />
        <Input label="مكان الثقال"         placeholder="مثال: خلف"           value={data.counterweightPosition} onChange={v => set({ counterweightPosition: v })} />
        <Input label="مقاس الكابينة"       placeholder="عرض x طول"            value={data.cabinSize}            onChange={v => set({ cabinSize: v })} />

        <Select label="فك المصعد القديم" options={REMOVAL_OPTIONS} value={data.oldElevatorRemoval} onChange={v => set({ oldElevatorRemoval: v as any })} />

        {/* ── Price & Rep ─── */}
        <Input
          label="السعر" required money
          suffix="جنيه"
          value={data.price}
          onChange={v => set({ price: num(v) })}
          error={errors.price}
        />
        <Input label="المندوب" placeholder="اسم المندوب" value={data.representative} onChange={v => set({ representative: v })} />
      </div>

      {/* ── Notes ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mt-4">
        <DetailField label="ملاحظة 1"         value={data.note1 ?? ''}    isEdit type="textarea" onChange={v => set({ note1: v })} />
        <DetailField label="ملاحظة 2"         value={data.note2 ?? ''}    isEdit type="textarea" onChange={v => set({ note2: v })} />
        <DetailField label="ملاحظات المهندس"  value={data.engNotes1 ?? ''} isEdit type="textarea" onChange={v => set({ engNotes1: v })} />
      </div>
    </>
  );
};
