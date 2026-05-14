import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
  placeholder = 'اختر...',
  error,
  required,
}) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm font-bold text-secondary flex items-center gap-1">
      {label}
      {required && <span className="text-red-500 text-xs">*</span>}
    </label>
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className={`peer w-full bg-white border ${error ? 'border-red-400 focus:border-red-500' : 'border-line focus:border-accent'} rounded-xl p-2.5 sm:p-3 outline-none transition-all shadow-sm text-sm font-bold appearance-none cursor-pointer pr-10 min-h-[44px] sm:min-h-[46px]`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary peer-focus:rotate-180 transition-transform duration-200">
        <ChevronDown size={18} />
      </div>
    </div>
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);
