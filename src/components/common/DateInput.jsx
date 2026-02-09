import React, { useRef } from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'lucide-react';
import 'flatpickr/dist/themes/airbnb.css'; // Use a clean theme

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
    name
}) => {
    // Styling to match existing Tailwind inputs
    const baseInputClass = "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 text-gray-900 font-medium shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed";

    // Flatpickr options
    const options = {
        dateFormat: "Y-m-d",
        disableMobile: true, // Force desktop UI
        allowInput: true, // Allow manual typing
        minDate: minDate,
        maxDate: maxDate,
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={18} />
                </div>
                <Flatpickr
                    value={value}
                    onChange={(selectedDates, dateStr) => {
                        // Return the date string (YYYY-MM-DD) to parent
                        onChange(dateStr);
                    }}
                    options={options}
                    placeholder={placeholder}
                    disabled={disabled}
                    name={name}
                    className={baseInputClass}
                    autoComplete="off"
                />
            </div>
        </div>
    );
};

export default DateInput;
