import React from 'react';

interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  suffix = '',
  className = ''
}) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-sm font-bold text-secondary">{label}</label>
    <div className="relative">
      <input 
        type={type}
        value={value}
        placeholder={placeholder || '...'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-line rounded-xl p-2.5 sm:p-3 outline-none focus:border-accent transition-all shadow-sm text-sm font-bold min-h-[44px] sm:min-h-[46px]"
      />
      {suffix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">
          {suffix}
        </span>
      )}
    </div>
  </div>
);
