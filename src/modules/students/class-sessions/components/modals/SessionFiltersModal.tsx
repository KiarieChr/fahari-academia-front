import React, { useState } from 'react';
import { Filter, RefreshCw, Calendar, Tag, User } from 'lucide-react';
import Modal from '../../../../../components/common/Modal';
import { inputClass } from '../../../../../components/ui/FormField';

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Sessions"
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
                <Modal.SubmitButton form="session-filters-form">
                    <Filter size={14} /> Apply Filters
                </Modal.SubmitButton>
            </>}
        >
            <form id="session-filters-form" onSubmit={handleApply} className="space-y-3.5">
                {/* Class */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class / Stream</label>
                    <select
                        className={`${inputClass} appearance-none`}
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

                {/* Status */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Session Status</label>
                    <div className="flex flex-wrap gap-2">
                        {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setFilters({ ...filters, status: filters.status === status ? '' : status })}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${filters.status === status
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                        <Calendar size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                        <input
                            type="date"
                            className={`${inputClass} pl-9`}
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default SessionFiltersModal;
