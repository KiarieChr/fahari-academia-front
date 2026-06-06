import React from 'react';

/**
 * Shared form styling constants and components.
 *
 * Usage:
 *   import { Input, Select, TextArea, FormField, inputClass, labelClass } from '@/components/ui/FormField';
 *
 *   <FormField label="Name" required>
 *       <Input value={v} onChange={...} placeholder="Enter name" />
 *   </FormField>
 *
 *   // Or use classes directly:
 *   <input className={inputClass} ... />
 */

/* ─── Shared class strings ─── */

export const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-gray-50/60 hover:bg-white focus:bg-white shadow-inner shadow-gray-100/50';

export const labelClass =
    'text-[13px] font-semibold text-gray-600 block mb-2';

export const selectClass = inputClass + ' appearance-none';

/* ─── Input ─── */

export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${inputClass} ${className}`} {...props} />
));
Input.displayName = 'Input';

/* ─── Select ─── */

export const Select = React.forwardRef(({ className = '', children, ...props }, ref) => (
    <select ref={ref} className={`${selectClass} ${className}`} {...props}>
        {children}
    </select>
));
Select.displayName = 'Select';

/* ─── TextArea ─── */

export const TextArea = React.forwardRef(({ className = '', rows = 3, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={`${inputClass} resize-none ${className}`} {...props} />
));
TextArea.displayName = 'TextArea';

/* ─── FormField (label + input wrapper) ─── */

const FormField = ({ label, required, hint, error, className = '', children }) => (
    <div className={className}>
        {label && (
            <label className={labelClass}>
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
        )}
        {children}
        {hint && !error && (
            <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
        )}
        {error && (
            <p className="text-xs text-red-500 mt-1.5">{error}</p>
        )}
    </div>
);

export { FormField };
export default FormField;
