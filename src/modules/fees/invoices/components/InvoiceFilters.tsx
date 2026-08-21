import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { invoiceStatuses } from '../data/mockInvoiceData';

const InvoiceFilters = ({
    filters,
    onFilterChange,
    onSearch,
    onReset,
    years = [],
    terms = [],
    classes = []
}) => {

    // Filter terms based on selected year
    const availableTerms = filters.year
        ? terms.filter(t =>
            // Match using academic_year object or ID if available, or name matching if string
            // Term model has academic_year ID usually. 
            // In serialized data, assume `academic_year` is ID or object? 
            // Let's assume ID match if t.academic_year is id, 
            // OR checks against year name if years prop are objects.
            // Years prop is array of objects {id, name, ...}.
            // Terms prop is array of objects {id, name, academic_year: ID, ...}.
            // Filters.year is likely the NAME (value={year.name}) based on previous code '2025'.
            // Let's check how we render years options.
            // If filters.year stores NAME, we find year ID first.
            years.find(y => y.name === filters.year)?.id === t.academic_year
            ||
            // Fallback if filters.year is just a string and we don't have ID mapping easily 
            // or if api returns nested structure.
            // Given standard extensive serializers: term.academic_year might be ID.
            // Let's assume filters.year stores NAME for consistency with previous hardcoded '2025'.
            // But better to switch filters.year to store ID?
            // Dashboard default was '2025'.
            // Let's stick to Name for display consistency or ID for robustness?
            // User request: "terms should be locked to the academic year".
            // If we switch to ID, we need to update dashboard default or handle empty.
            // Let's try to match by name if years loop works.
            // Assume `years` has {id, name}. `terms` has {academic_year: id}.
            // So:
            t.academic_year === years.find(y => y.name === filters.year)?.id
        )
        : terms;

    // Additional check: If no year selected, show all terms? Or none? usually all.

    // Check if any filter is active
    const isFiltered = filters.classId || filters.term || filters.year || filters.status || filters.search;

    return (
        <div className="neo-card p-4 border-none mb-3">
            <div className="grid sm:grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search */}
                <div className=" col-span-4 md:col-span-6 lg:col-span-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Search size={18} className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            className="neo-input w-full py-2 text-sm font-bold"
                            placeholder="Search student or invoice #"
                            style={{paddingLeft:'2.1rem'}}
                            value={filters.search}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Class Filter */}
                <div className="col-span-3 md:col-span-2 hidden">
                    {/* Hiding Class Filter for now as we don't have dynamic classes passed yet */}
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.classId}
                        onChange={(e) => onFilterChange('classId', e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>

                {/* Year Filter - moved before Term */}
                <div className="col-span-2 md:col-span-3 lg:col-span-2">
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.year}
                        onChange={(e) => {
                            onFilterChange('year', e.target.value);
                            onFilterChange('term', ''); // Reset term when year changes
                        }}
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year.id} value={year.name}>{year.name}</option>
                        ))}
                    </select>
                </div>

                {/* Term Filter */}
                <div className="col-span-3 md:col-span-3 lg:col-span-2">
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.term}
                        onChange={(e) => onFilterChange('term', e.target.value)}
                        disabled={!filters.year} // Optional: modify UX to require year first?
                    >
                        <option value="">{filters.year ? "All Terms" : "Select Year First"}</option>
                        {availableTerms.map(term => (
                            <option key={term.id} value={term.name}>{term.name}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {invoiceStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <div className="col-span-12 lg:col-span-1 flex justify-end">
                    {isFiltered && (
                        <button
                            className="neo-btn p-2 text-gray-500 hover:text-indigo-600 transition-colors w-full lg:w-auto flex justify-center"
                            onClick={onReset}
                            title="Reset Filters"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceFilters;
