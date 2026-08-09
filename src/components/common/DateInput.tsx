import React from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'lucide-react';
import 'flatpickr/dist/themes/airbnb.css'; // Use clean base

const DateInput = ({
    value,
    onChange,
    label,
    placeholder = "Select date",
    className = "",
    minDate,
    maxDate,
    disabled = false,
    required = false,
    name,
    style,
    ...props
}) => {
    // Enforced style classes to avoid double-borders and icon overlaps
    const baseInputClass = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-100 font-medium shadow-sm disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed text-sm";
    
    // Clean up class names, merging parent classes but enforcing pl-10 for the icon space
    const inputClass = `${className} ${baseInputClass} pl-10`.replace(/\s+/g, ' ').trim();

    // Flatpickr options with month dropdown support
    const options = {
        dateFormat: "Y-m-d",
        disableMobile: true, // Force standard web UI
        allowInput: true, // Allow manual typing
        minDate: minDate,
        maxDate: maxDate,
        monthSelectorType: "dropdown",
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {/* Absolute calendar icon positioned inside the pl-10 padding bounds */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 z-10">
                    <Calendar size={15} />
                </div>
                <Flatpickr
                    value={value}
                    onChange={(selectedDates, dateStr) => {
                        onChange(dateStr);
                    }}
                    options={options}
                    placeholder={placeholder}
                    disabled={disabled}
                    name={name}
                    className={inputClass}
                    style={style}
                    autoComplete="off"
                    {...props}
                />
            </div>
        </div>
    );
};

export default DateInput;
