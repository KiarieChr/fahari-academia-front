import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { receiptTypes, paymentMethods, receiptStatuses } from '../data/mockReceiptData';

const ReceiptFilters = ({ onFilterChange, onSearch, onClearFilters }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        receiptType: 'All',
        paymentMethod: 'All',
        status: 'All',
        searchTerm: ''
    });

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters({ ...filters, searchTerm: value });
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            startDate: '',
            endDate: '',
            receiptType: 'All',
            paymentMethod: 'All',
            status: 'All',
            searchTerm: ''
        };
        setFilters(clearedFilters);
        if (onClearFilters) {
            onClearFilters();
        }
    };

    const hasActiveFilters = filters.startDate || filters.endDate ||
        filters.receiptType !== 'All' ||
        filters.paymentMethod !== 'All' ||
        filters.status !== 'All' ||
        filters.searchTerm;

    return (
        <div className="neo-card p-4 border-none mb-3">
            <div className="grid sm:grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Search size={18} className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            className="neo-input w-full py-2 text-sm font-bold"
                            placeholder="Search by receipt #, name..."
                            style={{paddingLeft:'2.1rem'}}
                            value={filters.searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Date Range (From) */}
                <div className="col-span-6 md:col-span-3 lg:col-span-2">
                    <input
                        type="date"
                        className="neo-input w-full text-sm font-bold"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        title="From Date"
                    />
                </div>
                
                {/* Date Range (To) */}
                <div className="col-span-6 md:col-span-3 lg:col-span-2">
                    <input
                        type="date"
                        className="neo-input w-full text-sm font-bold"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        title="To Date"
                    />
                </div>

                {/* Receipt Type */}
                <div className="col-span-6 md:col-span-3 lg:col-span-2">
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.receiptType}
                        onChange={(e) => handleFilterChange('receiptType', e.target.value)}
                    >
                        <option value="All">All Types</option>
                        {receiptTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="col-span-6 md:col-span-3 lg:col-span-1">
                    <select
                        className="neo-input w-full text-sm font-bold"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="All">All Status</option>
                        {receiptStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <div className="col-span-12 lg:col-span-1 flex justify-end">
                    {hasActiveFilters && (
                        <button
                            className="neo-btn p-2 text-gray-500 hover:text-indigo-600 transition-colors w-full lg:w-auto flex justify-center"
                            onClick={handleClearFilters}
                            title="Reset Filters"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptFilters;
