import React, { useState } from 'react';
import { Worker } from '../../types';
import { Modal } from '../Modal';
import { LoadingButton } from '../ui/LoadingButton';
import { InlineAlert } from '../ui/InlineAlert';
import { AppError } from '../../services/errors';
import { WorkerFormFields, WorkerFormErrors } from './WorkerFormFields';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Worker>;
  onChange: (patch: Partial<Worker>) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** True while the create request is in flight. */
  isSubmitting?: boolean;
  /** Failure returned by the create request, shown above the buttons. */
  submitError?: AppError | null;
}

const validate = (data: Partial<Worker>): WorkerFormErrors => {
  const errs: WorkerFormErrors = {};
  if (!data.name?.trim())                       errs.name       = 'اسم الموظف مطلوب';
  if (!data.role)                               errs.role       = 'نوع الموظف مطلوب';
  if (!data.salaryType)                         errs.salaryType = 'نوع الراتب مطلوب';
  if (!data.baseSalary || data.baseSalary <= 0) errs.baseSalary = 'قيمة الراتب مطلوبة';
  return errs;
};

const hasErrors = (e: WorkerFormErrors) => Object.keys(e).length > 0;

export const AddWorkerModal: React.FC<AddWorkerModalProps> = ({
  isOpen, onClose, formData, onChange, onSubmit, isSubmitting = false, submitError = null,
}) => {
  const [errors, setErrors] = useState<WorkerFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit(e);
  };

  const handleChange = (patch: Partial<Worker>) => {
    onChange(patch);
    if (Object.keys(errors).length > 0) {
      const key = Object.keys(patch)[0] as keyof WorkerFormErrors;
      if (errors[key]) {
        setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موظف جديد" size="lg" isBusy={isSubmitting}>
      <form onSubmit={handleSubmit} className="space-y-1" noValidate>
        {hasErrors(errors) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-bold">
            <span>⚠</span>
            <span>يوجد {Object.keys(errors).length} حقل مطلوب — يرجى مراجعة الحقول المُعلَّمة بـ *</span>
          </div>
        )}
        <WorkerFormFields data={formData} onChange={handleChange} errors={errors} />
        <InlineAlert error={submitError} className="mt-4" />

        <div className="flex gap-3 pt-4">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="جاري الحفظ..."
            className="flex-1 btn-primary py-4 rounded-xl shadow-sm"
          >
            حفظ الموظف
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
