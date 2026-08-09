// SearchInput Component - Debounced search input
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

const SearchInput = ({
    value,
    onChange,
    onSearch,
    placeholder = 'Search...',
    debounceMs = 300,
    loading = false,
    size = 'md', // sm, md, lg
    clearable = true,
    autoFocus = false,
    className = '',
    inputClassName = '',
}) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    // Sync external value
    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value);
        }
    }, [value]);

    // Debounced search
    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        onChange?.(newValue);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        if (onSearch) {
            const timeout = setTimeout(() => {
                onSearch(newValue);
            }, debounceMs);
            setDebounceTimeout(timeout);
        }
    }, [onChange, onSearch, debounceMs, debounceTimeout]);

    const handleClear = () => {
        setLocalValue('');
        onChange?.('');
        onSearch?.('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSearch) {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            onSearch(localValue);
        }
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    const sizeClasses = {
        sm: 'h-8 text-xs pl-8 pr-8',
        md: 'h-10 text-sm pl-10 pr-10',
        lg: 'h-12 text-base pl-12 pr-12',
    };

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 20,
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Icon */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                {loading ? (
                    <Loader2 size={iconSizes[size]} className="text-gray-400 animate-spin" />
                ) : (
                    <Search size={iconSizes[size]} className="text-gray-400" />
                )}
            </div>

            {/* Input */}
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={`
                    w-full ${sizeClasses[size]}
                    bg-white border border-gray-200 rounded-lg
                    placeholder-gray-400 text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                    transition-colors
                    ${inputClassName}
                `}
            />

            {/* Clear Button */}
            {clearable && localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-0 top-0 bottom-0 flex items-center pr-3"
                >
                    <X size={iconSizes[size]} className="text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
