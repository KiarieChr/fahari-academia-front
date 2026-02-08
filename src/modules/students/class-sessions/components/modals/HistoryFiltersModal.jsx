import React, { useState } from 'react';
import { X, Filter, RefreshCw, Calendar, Tag, User, Layers } from 'lucide-react';

const HistoryFiltersModal = ({ isOpen, onClose, onApply }) => {
    const [filters, setFilters] = useState({
        class: '',
        teacher: '',
        subject: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const handleApply = (e) => {
        e.preventDefault();
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            class: '',
            teacher: '',
            subject: '',
            status: '',
            startDate: '',
            endDate: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" /> Filter History
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleApply} className="p-5 space-y-4">

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Class */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class</label>
                            <div className="relative">
                                <Layers size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                                    value={filters.class}
                                    onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                                >
                                    <option value="">All</option>
                                    <option value="Grade 4 East">Grade 4 East</option>
                                    <option value="Grade 5 West">Grade 5 West</option>
                                    <option value="Grade 6 North">Grade 6 North</option>
                                </select>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Subject</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="e.g. Mathematics"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Teacher */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Teacher</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Teacher's Name"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={filters.teacher}
                                onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3 mt-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
                        >
                            <Filter size={14} /> Apply Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HistoryFiltersModal;
