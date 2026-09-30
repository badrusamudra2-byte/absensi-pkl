import { cn } from '../../utils/helpers';
import { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [], 
  className = '', 
  selectClassName = '',
  id,
  placeholder = 'Pilih...',
  ...props 
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full px-4 py-2.5 border rounded-lg bg-white text-gray-900 appearance-none',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          error 
            ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500',
          selectClassName
        )}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;