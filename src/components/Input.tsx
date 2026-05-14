import React from 'react';

interface InputProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
  className?: string;
  /** Render as a currency-formatted text input (comma-separated, e.g. 3,000) */
  money?: boolean;
  /** Validation error message shown below the input */
  error?: string;
  /** Show a required asterisk next to the label */
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  suffix = '',
  className = '',
  money = false,
  error,
  required,
}) => {
  const isNumeric = type === 'number' || money;

  /**
   * For number/money inputs: show empty string when value is 0 / falsy
   * so the browser does not render a leading zero (e.g. "050").
   * For money: also format with commas so the user sees "3,000".
   */
  const displayValue = (() => {
    if (!isNumeric) return value ?? '';
    const n = Number(value);
    if (!value && value !== 0) return '';   // undefined / null
    if (n === 0) return '';                 // show placeholder, not "0"
    if (money) return n.toLocaleString('en-US'); // "3,000"
    return value;
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (money) {
      // Strip commas + any non-digit character before passing upward
      const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '');
      onChange(raw === '' ? '0' : raw);
    } else {
      onChange(e.target.value);
    }
  };

  const borderClass = error
    ? 'border-red-400 focus:border-red-500'
    : 'border-line focus:border-accent';

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-bold text-secondary flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>

      <div className="relative">
        <input
          type={money ? 'text' : type}
          inputMode={money ? 'numeric' : undefined}
          value={displayValue as string}
          placeholder={placeholder || (isNumeric ? '0' : '...')}
          onChange={handleChange}
    
          className={`w-full bg-white border ${borderClass} rounded-xl p-2.5 sm:p-3 outline-none transition-all shadow-sm text-sm font-bold min-h-[44px] sm:min-h-[46px] ${suffix ? 'pl-14' : ''}`}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-accent pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
};
