import React, { useState } from 'react';
import { MaintenanceContract } from '../../types';
import { Modal } from '../Modal';
import { MaintenanceFormFields, MaintenanceFormErrors } from './MaintenanceFormFields';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: Partial<MaintenanceContract>;
  onChange: (patch: Partial<MaintenanceContract>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const validate = (data: Partial<MaintenanceContract>): MaintenanceFormErrors => {
  const errs: MaintenanceFormErrors = {};
  if (!data.customerName?.trim())         errs.customerName         = 'اسم العميل مطلوب';
  if (!data.address?.trim())              errs.address              = 'العنوان مطلوب';
  if (!data.maintenanceStartDate)         errs.maintenanceStartDate = 'تاريخ البدء مطلوب';
  if (!data.contractDuration)             errs.contractDuration     = 'مدة العقد مطلوبة';
  if (!data.floors     || data.floors     <= 0) errs.floors         = 'عدد الأدوار مطلوب';
  if (!data.elevatorCount || data.elevatorCount <= 0) errs.elevatorCount = 'عدد المصاعد مطلوب';
  if (!data.price      || data.price      <= 0) errs.price          = 'السعر مطلوب';
  return errs;
};

const hasErrors = (e: MaintenanceFormErrors) => Object.keys(e).length > 0;

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen, onClose, formData, onChange, onSubmit,
}) => {
  const [errors, setErrors] = useState<MaintenanceFormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData);
    if (hasErrors(errs)) { setErrors(errs); return; }
    setErrors({});
    onSubmit(e);
  };

  const handleChange = (patch: Partial<MaintenanceContract>) => {
    onChange(patch);
    if (Object.keys(errors).length > 0) {
      const key = Object.keys(patch)[0] as keyof MaintenanceFormErrors;
      if (errors[key]) {
        setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة عقد صيانة جديد" size="full">
      <form onSubmit={handleSubmit} className="space-y-1" noValidate>
        {hasErrors(errors) && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-bold">
            <span>⚠</span>
            <span>يوجد {Object.keys(errors).length} حقل مطلوب — يرجى مراجعة الحقول المُعلَّمة بـ ✱</span>
          </div>
        )}
        <MaintenanceFormFields data={formData} onChange={handleChange} errors={errors} />
        <div className="flex gap-3 pt-4">
          <button type="submit"  className="flex-1 btn-primary py-4 rounded-xl shadow-sm">حفظ العقد</button>
          <button type="button" onClick={onClose} className="flex-1 bg-bg border border-line text-secondary font-bold py-4 rounded-xl">إلغاء</button>
        </div>
      </form>
    </Modal>
  );
};
