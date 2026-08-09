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
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold">
                        <Filter size={18} className="me-2" />
                        Filters
                    </h6>
                    {hasActiveFilters && (
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleClearFilters}
                        >
                            <X size={16} className="me-1" />
                            Clear All
                        </button>
                    )}
                </div>

                <div className="row g-3">
                    {/* Search Bar */}
                    <div className="col-md-12">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by receipt #, payer name, student name, or admission no..."
                                value={filters.searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="col-md-3">
                        <label className="form-label small text-muted mb-1">From Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small text-muted mb-1">To Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>

                    {/* Receipt Type */}
                    <div className="col-md-2">
                        <label className="form-label small text-muted mb-1">Receipt Type</label>
                        <select
                            className="form-select"
                            value={filters.receiptType}
                            onChange={(e) => handleFilterChange('receiptType', e.target.value)}
                        >
                            <option value="All">All Types</option>
                            {receiptTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method */}
                    <div className="col-md-2">
                        <label className="form-label small text-muted mb-1">Payment Method</label>
                        <select
                            className="form-control"
                            value={filters.paymentMethod}
                            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                        >
                            <option value="All">All Methods</option>
                            {paymentMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-2">
                        <label className="form-label small text-muted mb-1">Status</label>
                        <select
                            className="form-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            {receiptStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptFilters;
