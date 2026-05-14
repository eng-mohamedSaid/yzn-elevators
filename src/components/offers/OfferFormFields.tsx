import React from 'react';
import { Offer } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';
import { DetailField } from '../DetailField';
import {
  ELEVATOR_TYPES, MACHINE_TYPES, CONTROL_BOARDS,
  BATTERIES, VVVFS, RAILS, REMOVAL_OPTIONS, CUSTOMER_TYPES,
} from './offerConstants';

interface OfferFormFieldsProps {
  data: Partial<Offer>;
  onChange: (patch: Partial<Offer>) => void;
}

/** Shared form grid used in both Add and Edit modes */
export const OfferFormFields: React.FC<OfferFormFieldsProps> = ({ data, onChange }) => {
  const set = (patch: Partial<Offer>) => onChange({ ...data, ...patch });
  const num = (val: string) => Number(val);

  return (
    <>
      {/* ── Customer Info ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <Input label="اسم العميل"   placeholder="أدخل اسم العميل بالكامل" value={data.customerName}  onChange={v => set({ customerName: v })} />
        <Input label="رقم التليفون" type="number" placeholder="مثال: 01xxxxxxxxx" value={data.phone} onChange={v => set({ phone: v })} />
        <Input label="العنوان"      placeholder="أدخل عنوان العميل"        value={data.address}      onChange={v => set({ address: v })} />
        <Input label="رابط الموقع" placeholder="رابط Google Maps"          value={data.locationUrl}  onChange={v => set({ locationUrl: v })} />
      </div>

      {/* ── Elevator Specs ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 mt-4">
        <Input  label="التاريخ"      type="date"   value={data.date}          onChange={v => set({ date: v })} />
        <Select label="نوع العميل"   options={CUSTOMER_TYPES}  value={data.customerType}   onChange={v => set({ customerType: v as any })} />
        <Select label="نوع المصعد"   options={ELEVATOR_TYPES}  value={data.elevatorType}   onChange={v => set({ elevatorType: v })} />
        <Input  label="عدد المصاعد" type="number" value={data.elevatorCount}  onChange={v => set({ elevatorCount: num(v) })} />
        <Input  label="الوقفات"     type="number" value={data.stops}          onChange={v => set({ stops: num(v) })} />
        <Input  label="الطوابق"     type="number" value={data.floors}         onChange={v => set({ floors: num(v) })} />
        <Input  label="المداخل"     type="number" value={data.entrances}      onChange={v => set({ entrances: num(v) })} />
        <Input  label="الحمولة"     placeholder="مثال: 450 كجم" value={data.load} onChange={v => set({ load: v })} />

        {/* ── Machine & Electronics ─── */}
        <Select label="نوع الماكينة"  options={MACHINE_TYPES}  value={data.machineType}  onChange={v => set({ machineType: v })} />
        <Select label="كارت الكنترول" options={CONTROL_BOARDS} value={data.controlBoard} onChange={v => set({ controlBoard: v })} />
        <Select label="البطارية"      options={BATTERIES}      value={data.battery}      onChange={v => set({ battery: v })} />
        <Select label="VVVF"          options={VVVFS}          value={data.vvvf}         onChange={v => set({ vvvf: v })} />
        <Select label="القضبان"       options={RAILS}          value={data.rails}        onChange={v => set({ rails: v })} />

        {/* ── Payments ─── */}
        <Input label="دفعة 1" type="number" value={data.payment1} onChange={v => set({ payment1: num(v) })} />
        <Input label="دفعة 2" type="number" value={data.payment2} onChange={v => set({ payment2: num(v) })} />
        <Input label="دفعة 3" type="number" value={data.payment3} onChange={v => set({ payment3: num(v) })} />
        <Input label="دفعة 4" type="number" value={data.payment4} onChange={v => set({ payment4: num(v) })} />

        {/* ── Door & Pit ─── */}
        <Input label="نوع الباب"      placeholder="مثال: نصف اتوماتيك" value={data.doorType}  onChange={v => set({ doorType: v })} />
        <Input label="الباب الداخلي"  placeholder="مثال: اتوماتيك"       value={data.innerDoor} onChange={v => set({ innerDoor: v })} />
        <Input label="مقاس الباب"     type="number" placeholder="بالسم"  value={data.doorSize}  onChange={v => set({ doorSize: num(v) })} />
        <Input label="عرض البئر"      type="number" placeholder="بالسم"  value={data.pitWidth}  onChange={v => set({ pitWidth: num(v) })} />
        <Input label="ارتفاع الدور الأخير" type="number" placeholder="بالمتر" value={data.lastFloorHeight} onChange={v => set({ lastFloorHeight: num(v) })} />
        <Input label="حفرة البئر"     type="number" placeholder="بالسم"  value={data.pitDepth}  onChange={v => set({ pitDepth: num(v) })} />
        <Input label="طول البئر"      type="number" placeholder="بالسم"  value={data.pitLength} onChange={v => set({ pitLength: num(v) })} />
        <Input label="مكان الثقال"    placeholder="مثال: خلف"            value={data.counterweightPosition} onChange={v => set({ counterweightPosition: v })} />
        <Input label="مقاس الكابينة"  placeholder="عرض x طول"             value={data.cabinSize} onChange={v => set({ cabinSize: v })} />

        <Select label="فك المصعد القديم" options={REMOVAL_OPTIONS} value={data.oldElevatorRemoval} onChange={v => set({ oldElevatorRemoval: v as any })} />

        {/* ── Price & Representative ─── */}
        <Input label="السعر"    type="number" value={data.price}          suffix="جنيه" onChange={v => set({ price: num(v) })} />
        <Input label="المندوب"  placeholder="اسم المندوب" value={data.representative} onChange={v => set({ representative: v })} />
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
