import React from 'react';
import { MapPin } from 'lucide-react';
import { Offer } from '../../types';
import { DetailField } from '../DetailField';
import {
  ELEVATOR_TYPES, MACHINE_TYPES, CONTROL_BOARDS,
  BATTERIES, VVVFS, RAILS, REMOVAL_OPTIONS, CUSTOMER_TYPES,
} from './offerConstants';

interface OfferDetailViewProps {
  offer: Offer;
  formData: Partial<Offer>;
  isEditMode: boolean;
  onChange: (patch: Partial<Offer>) => void;
}

/** Read-only or editable detail grid rendered inside the detail modal */
export const OfferDetailView: React.FC<OfferDetailViewProps> = ({
  offer,
  formData,
  isEditMode,
  onChange,
}) => {
  const set  = (patch: Partial<Offer>) => onChange({ ...formData, ...patch });
  const num  = (v: string) => Number(v);
  const edit = isEditMode;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-1">

      {/* ── Identity ───────────────────────────────────── */}
      <DetailField label="رقم العرض"  value={offer.offerNumber}          isEdit={false} />
      <DetailField label="اسم العميل" value={formData.customerName ?? ''} isEdit={edit} onChange={v => set({ customerName: v })} />
      <DetailField label="التليفون"   value={formData.phone ?? ''}        isEdit={edit} onChange={v => set({ phone: v })} />
      <DetailField label="العنوان"    value={formData.address ?? ''}      isEdit={edit} onChange={v => set({ address: v })} />

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
        ) : offer.locationUrl ? (
          <a
            href={offer.locationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-accent/5 text-accent p-2 rounded-lg text-sm font-bold border border-accent/10"
          >
            <MapPin size={14} /> فتح الخريطة
          </a>
        ) : (
          <span className="flex items-center gap-2 bg-gray-50 text-secondary p-2 rounded-lg text-sm font-medium border border-line">
            لا يوجد
          </span>
        )}
      </div>

      {/* ── Date & Classification ─── */}
      <DetailField label="التاريخ"    value={formData.date ?? ''}         isEdit={edit} type="date"   onChange={v => set({ date: v })} />
      <DetailField label="نوع العميل" value={formData.customerType ?? ''} isEdit={edit} type="select" options={CUSTOMER_TYPES} onChange={v => set({ customerType: v as any })} />
      <DetailField label="نوع المصعد" value={formData.elevatorType ?? ''} isEdit={edit} type="select" options={ELEVATOR_TYPES} onChange={v => set({ elevatorType: v })} />

      {/* ── Elevator Specs ─── */}
      <DetailField label="عدد المصاعد" value={formData.elevatorCount ?? 0} isEdit={edit} type="number" onChange={v => set({ elevatorCount: num(v) })} />
      <DetailField label="الوقفات"     value={formData.stops ?? 0}         isEdit={edit} type="number" onChange={v => set({ stops: num(v) })} />
      <DetailField label="الطوابق"     value={formData.floors ?? 0}        isEdit={edit} type="number" onChange={v => set({ floors: num(v) })} />
      <DetailField label="المداخل"     value={formData.entrances ?? 0}     isEdit={edit} type="number" onChange={v => set({ entrances: num(v) })} />
      <DetailField label="الحمولة"     value={formData.load ?? ''}         isEdit={edit} onChange={v => set({ load: v })} />

      {/* ── Machine & Electronics ─── */}
      <DetailField label="الماكينة"    value={formData.machineType ?? ''}  isEdit={edit} type="select" options={MACHINE_TYPES}  onChange={v => set({ machineType: v })} />
      <DetailField label="الكنترول"    value={formData.controlBoard ?? ''} isEdit={edit} type="select" options={CONTROL_BOARDS} onChange={v => set({ controlBoard: v })} />
      <DetailField label="البطارية"    value={formData.battery ?? ''}      isEdit={edit} type="select" options={BATTERIES}      onChange={v => set({ battery: v })} />
      <DetailField label="VVVF"        value={formData.vvvf ?? ''}         isEdit={edit} type="select" options={VVVFS}          onChange={v => set({ vvvf: v })} />
      <DetailField label="القضبان"     value={formData.rails ?? ''}        isEdit={edit} type="select" options={RAILS}          onChange={v => set({ rails: v })} />

      {/* ── Payments ─── */}
      <DetailField label="دفعة 1" value={formData.payment1 ?? 0} isEdit={edit} type="number" onChange={v => set({ payment1: num(v) })} />
      <DetailField label="دفعة 2" value={formData.payment2 ?? 0} isEdit={edit} type="number" onChange={v => set({ payment2: num(v) })} />
      <DetailField label="دفعة 3" value={formData.payment3 ?? 0} isEdit={edit} type="number" onChange={v => set({ payment3: num(v) })} />
      <DetailField label="دفعة 4" value={formData.payment4 ?? 0} isEdit={edit} type="number" onChange={v => set({ payment4: num(v) })} />

      {/* ── Door & Pit ─── */}
      <DetailField label="نوع الباب"          value={formData.doorType ?? ''}              isEdit={edit} onChange={v => set({ doorType: v })} />
      <DetailField label="الباب الداخلي"      value={formData.innerDoor ?? ''}             isEdit={edit} onChange={v => set({ innerDoor: v })} />
      <DetailField label="مقاس الباب"         value={formData.doorSize ?? 0}               isEdit={edit} type="number" onChange={v => set({ doorSize: num(v) })} />
      <DetailField label="عرض البئر"          value={formData.pitWidth ?? 0}               isEdit={edit} type="number" onChange={v => set({ pitWidth: num(v) })} />
      <DetailField label="ارتفاع الدور الأخير" value={formData.lastFloorHeight ?? 0}       isEdit={edit} type="number" onChange={v => set({ lastFloorHeight: num(v) })} />
      <DetailField label="حفرة البئر"         value={formData.pitDepth ?? 0}               isEdit={edit} type="number" onChange={v => set({ pitDepth: num(v) })} />
      <DetailField label="طول البئر"          value={formData.pitLength ?? 0}              isEdit={edit} type="number" onChange={v => set({ pitLength: num(v) })} />
      <DetailField label="مكان الثقال"        value={formData.counterweightPosition ?? ''} isEdit={edit} onChange={v => set({ counterweightPosition: v })} />
      <DetailField label="مقاس الكابينة"      value={formData.cabinSize ?? ''}             isEdit={edit} onChange={v => set({ cabinSize: v })} />
      <DetailField label="فك المصعد القديم"   value={formData.oldElevatorRemoval ?? ''}   isEdit={edit} type="select" options={REMOVAL_OPTIONS} onChange={v => set({ oldElevatorRemoval: v as any })} />

      {/* ── Price & Rep ─── */}
      <DetailField label="السعر"    value={formData.price ?? 0}           isEdit={edit} type="number" suffix="جنيه" onChange={v => set({ price: num(v) })} className="sm:col-span-2" />
      <DetailField label="المندوب"  value={formData.representative ?? ''} isEdit={edit} onChange={v => set({ representative: v })} className="sm:col-span-2" />

      {/* ── Notes ─── */}
      <DetailField label="ملاحظة 1"        value={formData.note1 ?? ''}    isEdit={edit} type="textarea" onChange={v => set({ note1: v })}    className="sm:col-span-2" />
      <DetailField label="ملاحظة 2"        value={formData.note2 ?? ''}    isEdit={edit} type="textarea" onChange={v => set({ note2: v })}    className="sm:col-span-2" />
      <DetailField label="ملاحظات المهندس" value={formData.engNotes1 ?? ''} isEdit={edit} type="textarea" onChange={v => set({ engNotes1: v })} className="sm:col-span-2" />
    </div>
  );
};
