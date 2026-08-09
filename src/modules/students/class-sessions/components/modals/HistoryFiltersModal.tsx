import React, { useState } from 'react';
import { Filter, RefreshCw, Calendar, Tag, User, Layers } from 'lucide-react';
import Modal from '../../../../../components/common/Modal';
import { inputClass } from '../../../../../components/ui/FormField';

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter History"
            icon={<Filter size={18} className="text-gray-500" />}
            size="sm"
            footer={<>
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Reset
                </button>
                <Modal.SubmitButton form="history-filters-form">
                    <Filter size={14} /> Apply Filters
                </Modal.SubmitButton>
            </>}
        >
            <form id="history-filters-form" onSubmit={handleApply} className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <input
                                type="date"
                                className={`${inputClass} pl-9`}
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <input
                                type="date"
                                className={`${inputClass} pl-9`}
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
                            <Layers size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <select
                                className={`${inputClass} pl-9 appearance-none`}
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
                            className={`${inputClass} appearance-none`}
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
                        <Tag size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                        <input
                            type="text"
                            placeholder="e.g. Mathematics"
                            className={`${inputClass} pl-9`}
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        />
                    </div>
                </div>

                {/* Teacher */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Teacher</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                        <input
                            type="text"
                            placeholder="Teacher's Name"
                            className={`${inputClass} pl-9`}
                            value={filters.teacher}
                            onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default HistoryFiltersModal;
