import React, { useState } from 'react';
import { X, Filter, RefreshCw, Calendar, Tag, User } from 'lucide-react';

const SessionFiltersModal = ({ isOpen, onClose, onApply }) => {
    const [filters, setFilters] = useState({
        class: '',
        teacher: '',
        subject: '',
        status: '',
        date: ''
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
            date: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" /> Filter Sessions
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleApply} className="p-5 space-y-3.5">
                    {/* Class */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class / Stream</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={filters.class}
                            onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            <option value="Grade 4 East">Grade 4 East</option>
                            <option value="Grade 5 West">Grade 5 West</option>
                            <option value="Grade 6 North">Grade 6 North</option>
                        </select>
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

                    {/* Status */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Session Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFilters({ ...filters, status: filters.status === status ? '' : status })}
                                    className={`btn btn-sm rounded-pill ${filters.status === status
                                        ? 'btn-primary'
                                        : 'btn-outline-secondary'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Override */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block flex justify-between">
                            <span>Date</span>
                            <span className="text-[10px] font-normal text-gray-400 lowercase">Normal view is "Today"</span>
                        </label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="date"
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 d-flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-outline-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        >
                            <RefreshCw size={14} /> Reset
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                        >
                            <Filter size={14} /> Apply Filters
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionFiltersModal;
