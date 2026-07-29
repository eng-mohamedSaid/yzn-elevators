import React from 'react';
import { Worker } from '../../types';
import { Input } from '../Input';
import { Select } from '../Select';
import { DetailField } from '../DetailField';
import { WORKER_ROLES, SALARY_TYPES } from './workerConstants';

export interface WorkerFormErrors {
  name?:       string;
  role?:       string;
  salaryType?: string;
  baseSalary?: string;
}

interface WorkerFormFieldsProps {
  data: Partial<Worker>;
  onChange: (patch: Partial<Worker>) => void;
  errors?: WorkerFormErrors;
}

export const WorkerFormFields: React.FC<WorkerFormFieldsProps> = ({
  data,
  onChange,
  errors = {} as WorkerFormErrors,
}) => {
  const num = (val: string) => (val === '' ? 0 : Number(val));
  const set = (patch: Partial<Worker>) => onChange({ ...data, ...patch });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <Input
          label="اسم الموظف" required
          placeholder="الاسم بالكامل"
          value={data.name}
          onChange={v => set({ name: v })}
          error={errors.name}
        />
        <Select
          label="نوع الموظف" required
          options={WORKER_ROLES}
          value={data.role}
          onChange={v => set({ role: v as Worker['role'] })}
          error={errors.role}
        />
        <Select
          label="نوع الراتب" required
          options={SALARY_TYPES}
          value={data.salaryType}
          onChange={v => set({ salaryType: v as Worker['salaryType'] })}
          error={errors.salaryType}
        />
        <Input
          label="قيمة الراتب" required money suffix="جنيه"
          value={data.baseSalary}
          onChange={v => set({ baseSalary: num(v) })}
          error={errors.baseSalary}
        />
        <Input
          label="تاريخ الالتحاق" type="date"
          value={data.joinDate}
          onChange={v => set({ joinDate: v })}
        />
      </div>

      <div className="mt-4">
        <DetailField
          label="ملاحظات"
          value={data.notes ?? ''}
          isEdit
          type="textarea"
          onChange={v => set({ notes: v })}
        />
      </div>
    </>
  );
};
