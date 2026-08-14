import React, { useState } from 'react';
import { Site } from '../../types';
import { Modal } from '../Modal';
import { LoadingButton } from '../ui/LoadingButton';
import { InlineAlert } from '../ui/InlineAlert';
import { AppError } from '../../services/errors';
import { SiteFormFields, SiteFormErrors } from './SiteFormFields';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Site>;
  onChange: (patch: Partial<Site>) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** True while the create request is in flight. */
  isSubmitting?: boolean;
  /** Failure returned by the create request, shown above the buttons. */
  submitError?: AppError | null;
}

const validate = (data: Partial<Site>): SiteFormErrors => {
  const errs: SiteFormErrors = {};
  if (!data.siteName?.trim())                          errs.siteName      = 'اسم الموقع مطلوب';
  if (!data.address?.trim())                           errs.address       = 'العنوان مطلوب';
  if (!data.startDate)                                 errs.startDate     = 'تاريخ البداية مطلوب';
  if (!data.endDate)                                   errs.endDate       = 'تاريخ النهاية مطلوب';
  if (!data.price      || data.price      <= 0)        errs.price         = 'السعر الكلي مطلوب';
  if (!data.elevatorCount || data.elevatorCount <= 0)  errs.elevatorCount = 'عدد المصاعد مطلوب';
  return errs;
};

const hasErrors = (e: SiteFormErrors) => Object.keys(e).length > 0;

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen, onClose, formData, onChange, onSubmit, isSubmitting = false, submitError = null,
}) => {
  const [errors, setErrors] = useState<SiteFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit(e);
  };

  const handleChange = (patch: Partial<Site>) => {
    onChange(patch);
    if (Object.keys(errors).length > 0) {
      const key = Object.keys(patch)[0] as keyof SiteFormErrors;
      if (errors[key]) {
        setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موقع جديد" size="full" isBusy={isSubmitting}>
      <form onSubmit={handleSubmit} className="space-y-1" noValidate>
        {hasErrors(errors) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-bold">
            <span>⚠</span>
            <span>يوجد {Object.keys(errors).length} حقل مطلوب — يرجى مراجعة الحقول المُعلَّمة بـ *</span>
          </div>
        )}
        <SiteFormFields data={formData} onChange={handleChange} errors={errors} />
        <InlineAlert error={submitError} className="mt-4" />

        <div className="flex gap-3 pt-4">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="جاري الحفظ..."
            className="flex-1 btn-primary py-4 rounded-xl shadow-sm"
          >
            حفظ الموقع
          </LoadingButton>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
        </div>
      </form>
    </Modal>
  );
};
