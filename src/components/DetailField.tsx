import React from 'react';

interface DetailFieldProps {
  label: string;
  value: string | number;
  isEdit: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: string[];
  suffix?: string;
  className?: string;
}

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  isEdit,
  onChange,
  type = 'text',
  options = [],
  suffix = '',
  className = '',
}) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[10px] font-bold text-secondary uppercase">{label}</label>
    {isEdit ? (
      type === 'textarea' ? (
        <textarea 
          value={value}
          placeholder="..."
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-white border border-accent/30 rounded-lg p-2 outline-none h-24 text-sm font-medium"
        />
      ) : type === 'select' ? (
        <select 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-white border border-accent/30 rounded-lg p-2 text-sm outline-none font-bold h-[42px]"
        >
          <option value="" disabled>اختر...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input 
          type={type}
          value={value}
          placeholder="..."
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-white border border-accent/30 rounded-lg p-2 outline-none text-sm font-bold h-[42px]"
          dir={type === 'text' && (label.includes('تليفون') || label.includes('رقم')) ? 'ltr' : 'rtl'}
        />
      )
    ) : (
      <div className="bg-bg/50 p-2.5 rounded-lg border border-line text-sm font-bold text-primary flex justify-between items-center min-h-[42px]">
        <span>{String(value || '---')}</span>
        {suffix && (
          <span className="text-[10px] text-accent font-bold uppercase">
            {suffix}
          </span>
        )}
      </div>
    )}
  </div>
);
