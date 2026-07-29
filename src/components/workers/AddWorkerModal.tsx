import React, { useState } from 'react';
import { Worker } from '../../types';
import { Modal } from '../Modal';
import { WorkerFormFields, WorkerFormErrors } from './WorkerFormFields';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<Worker>;
  onChange: (patch: Partial<Worker>) => void;
  onSubmit: (e: React.FormEvent) => void;
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
  isOpen, onClose, formData, onChange, onSubmit,
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
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة موظف جديد" size="lg">
      <form onSubmit={handleSubmit} className="space-y-1" noValidate>
        {hasErrors(errors) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-bold">
            <span>⚠</span>
            <span>يوجد {Object.keys(errors).length} حقل مطلوب — يرجى مراجعة الحقول المُعلَّمة بـ *</span>
          </div>
        )}
        <WorkerFormFields data={formData} onChange={handleChange} errors={errors} />
        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 btn-primary py-4 rounded-xl shadow-sm">حفظ الموظف</button>
          <button type="button" onClick={onClose} className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl">إلغاء</button>
        </div>
      </form>
    </Modal>
  );
};
