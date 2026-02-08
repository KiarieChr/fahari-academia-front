import React, { useState } from 'react';
import { X, FileText, Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'react-toastify';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Generate Session Report</h2>
                        <p className="text-sm text-gray-500">Select parameters for your report.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleGenerate} className="p-6 space-y-4">

                    {/* Report Type */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Report Type</label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
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
                                <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-600"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-600"
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

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm shadow-indigo-200 flex items-center gap-2"
                        >
                            <Download size={16} /> Generate Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionReportsModal;

