// FilterDropdown Component - Advanced filter select
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check, Filter } from 'lucide-react';

const FilterDropdown = ({
    label,
    value,
    options = [], // [{ value, label, icon, count }]
    onChange,
    multiple = false,
    placeholder = 'Select...',
    searchable = false,
    clearable = true,
    disabled = false,
    size = 'md', // sm, md, lg
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sizeClasses = {
        sm: 'h-8 text-xs px-2.5',
        md: 'h-10 text-sm px-3',
        lg: 'h-12 text-base px-4',
    };

    const filteredOptions = searchable && search
        ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const selectedOptions = multiple
        ? options.filter(opt => (value || []).includes(opt.value))
        : options.find(opt => opt.value === value);

    const displayValue = multiple
        ? selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : placeholder
        : selectedOptions?.label || placeholder;

    const handleSelect = (optValue) => {
        if (multiple) {
            const current = value || [];
            const updated = current.includes(optValue)
                ? current.filter(v => v !== optValue)
                : [...current, optValue];
            onChange?.(updated);
        } else {
            onChange?.(optValue);
            setIsOpen(false);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.(multiple ? [] : '');
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    ${sizeClasses[size]}
                    w-full flex items-center justify-between gap-2
                    bg-white border border-gray-200 rounded-lg
                    hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {label && <Filter size={14} className="text-gray-400" />}
                    <span className={value || (multiple && value?.length) ? 'text-gray-900' : 'text-gray-500'}>
                        {displayValue}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {clearable && (value || (multiple && value?.length > 0)) && (
                        <button
                            onClick={handleClear}
                            className="p-0.5 hover:bg-gray-100 rounded"
                        >
                            <X size={14} className="text-gray-400" />
                        </button>
                    )}
                    <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="
                            absolute z-50 top-full left-0 right-0 mt-1
                            bg-white border border-gray-200 rounded-lg shadow-lg
                            max-h-64 overflow-hidden
                        "
                    >
                        {/* Search */}
                        {searchable && (
                            <div className="p-2 border-b border-gray-100">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="
                                        w-full px-3 py-2 text-sm
                                        bg-gray-50 border border-gray-200 rounded-md
                                        focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500
                                    "
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Options */}
                        <div className="overflow-y-auto max-h-48">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = multiple
                                        ? (value || []).includes(option.value)
                                        : value === option.value;
                                    const Icon = option.icon;

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSelect(option.value)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 text-sm
                                                ${isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}
                                                transition-colors
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                {Icon && <Icon size={16} />}
                                                <span>{option.label}</span>
                                                {option.count !== undefined && (
                                                    <span className="text-xs text-gray-400">
                                                        ({option.count})
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && <Check size={16} />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterDropdown;
