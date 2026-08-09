import React, { useState } from 'react';
import { FileText, Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass } from '../../../../../components/ui/FormField';

const SessionReportsModal = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('daily_summary');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const handleGenerate = (e) => {
        e.preventDefault();
        toast.success('Report generation started...');
        setTimeout(() => {
            toast.success('Report downloaded successfully');
            onClose();
        }, 1500);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Generate Session Report"
            subtitle="Select parameters for your report."
            size="sm"
            accentColor="bg-indigo-500"
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <Modal.SubmitButton form="session-report-form">
                    <Download size={16} /> Generate Report
                </Modal.SubmitButton>
            </>}
        >
            <form id="session-report-form" onSubmit={handleGenerate} className="space-y-4">
                {/* Report Type */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Report Type</label>
                    <div className="relative">
                        <FileText size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className={`${inputClass} pl-10 appearance-none`}
                        >
                            <option value="daily_summary">Daily Session Summary</option>
                            <option value="attendance_log">Attendance Log</option>
                            <option value="teacher_performance">Teacher Performance</option>
                            <option value="missed_sessions">Missed / Cancelled Sessions</option>
                            <option value="coverage_report">Syllabus Coverage</option>
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <input
                                type="date"
                                required
                                className={`${inputClass} pl-10`}
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <input
                                type="date"
                                required
                                className={`${inputClass} pl-10`}
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Format */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Export Format</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="format" value="pdf" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-gray-600">PDF Document</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="format" value="csv" className="text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-gray-600">CSV / Excel</span>
                        </label>
                    </div>
                </div>

                {/* Optional Filters */}
                <div className="pt-2">
                    <button type="button" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                        <Filter size={12} /> Advanced Filters (Class, Teacher, Subject)
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SessionReportsModal;

