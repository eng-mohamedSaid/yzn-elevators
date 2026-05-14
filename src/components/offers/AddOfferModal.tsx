import React, { useState } from 'react';
import { Offer } from '../../types';
import { Modal } from '../Modal';
import { OfferFormFields, OfferFormErrors } from './OfferFormFields';

interface AddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Offer>;
  onChange: (patch: Partial<Offer>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (data: Partial<Offer>): OfferFormErrors => {
  const errs: OfferFormErrors = {};

  if (!data.customerName?.trim())
    errs.customerName = 'اسم العميل مطلوب';

  if (!data.address?.trim())
    errs.address = 'العنوان مطلوب';

  if (!data.floors || data.floors <= 0)
    errs.floors = 'عدد الطوابق مطلوب (أكبر من صفر)';

  if (!data.price || data.price <= 0)
    errs.price = 'السعر مطلوب';

  if (!data.payment1 || data.payment1 <= 0)
    errs.payment1 = 'دفعة 1 مطلوبة';

  if (!data.payment2 || data.payment2 <= 0)
    errs.payment2 = 'دفعة 2 مطلوبة';

  if (!data.payment3 || data.payment3 <= 0)
    errs.payment3 = 'دفعة 3 مطلوبة';

  if (!data.payment4 || data.payment4 <= 0)
    errs.payment4 = 'دفعة 4 مطلوبة';

  return errs;
};

const hasErrors = (errs: OfferFormErrors) => Object.keys(errs).length > 0;

// ─────────────────────────────────────────────────────────────────────────────
export const AddOfferModal: React.FC<AddOfferModalProps> = ({
  isOpen, onClose, formData, onChange, onSubmit,
}) => {
  const [errors, setErrors] = useState<OfferFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData);
    if (hasErrors(errs)) {
      setErrors(errs);
      // Scroll to first error
      setTimeout(() => {
        document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setErrors({});
    onSubmit(e);
  };

  // Clear individual error when user fixes the field
  const handleChange = (patch: Partial<Offer>) => {
    onChange(patch);
    if (Object.keys(errors).length > 0) {
      const key = Object.keys(patch)[0] as keyof Offer;
      if (errors[key]) {
        setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة عرض سعر جديد" size="full">
      <form onSubmit={handleSubmit} className="space-y-1" noValidate>

        {/* Global validation banner */}
        {hasErrors(errors) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-bold">
            <span>⚠</span>
            <span>يوجد {Object.keys(errors).length} حقل مطلوب — يرجى مراجعة الحقول المُعلَّمة بـ ✱</span>
          </div>
        )}

        <OfferFormFields data={formData} onChange={handleChange} errors={errors} />

        <div className="flex gap-3 pt-4">
          <button type="submit"  className="flex-1 btn-primary py-4 rounded-xl shadow-sm">إضافة العرض</button>
          <button type="button" onClick={onClose} className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl">إلغاء</button>
        </div>
      </form>
    </Modal>
  );
};
