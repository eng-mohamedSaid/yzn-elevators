import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  value, 
  onChange,
  className = '',
  placeholder = 'اختر...'
}) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm font-bold text-secondary">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full bg-white border border-line rounded-xl p-2.5 sm:p-3 outline-none focus:border-accent transition-all shadow-sm text-sm font-bold appearance-none cursor-pointer pr-10 min-h-[44px] sm:min-h-[46px]"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary peer-focus:rotate-180 transition-transform duration-200">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);
