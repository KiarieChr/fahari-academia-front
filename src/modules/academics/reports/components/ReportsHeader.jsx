import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Download, Printer, Filter, ChevronDown, PenTool,
    Calendar, Users, Layers, Search, Upload, Lock, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportBuilderSetupModal from './ReportBuilderSetupModal';

const ReportsHeader = ({ curriculum, setCurriculum }) => {
    const navigate = useNavigate();
    const [showBuilderModal, setShowBuilderModal] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        year: '2024',
        term: 'Term 1',
        class: 'Grade 4',
        stream: 'All Streams',
        exam: 'End Term Exam'
    });

    // Dropdown State (id of the open dropdown)
    const [openDropdown, setOpenDropdown] = useState(null);
    const headerRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerRef.current && !headerRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleSelect = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setOpenDropdown(null);
    };

    // Dropdown Options Data
    const options = {
        years: ['2023', '2024', '2025'],
        terms: ['Term 1', 'Term 2', 'Term 3'],
        classes: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Class 8'],
        streams: ['All Streams', 'Red', 'Blue', 'Green'],
        exams: ['Opener Exam', 'Mid Term', 'End Term Exam']
    };

    const Dropdown = ({ id, label, icon: Icon, value, optionsList, minWidth = 'min-w-[120px]' }) => (
        <div className="relative group">
            <button
                onClick={() => toggleDropdown(id)}
                className={`flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border ${openDropdown === id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 ${minWidth} transition-all`}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-slate-400" />}
                    <span>{value}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${openDropdown === id ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === id && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[140px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {optionsList.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(label, opt)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${value === opt ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                                    }`}
                            >
                                <span>{opt}</span>
                                {value === opt && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div ref={headerRef} className="flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex top-0 z-30">
            {/* Top Row: Title and Curriculum Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className={`p-2 rounded-lg ${curriculum === 'CBC' ? 'bg-teal-100 text-teal-600' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                            <FileText size={24} />
                        </span>
                        Student Academic Reports
                    </h1>
                    <p className="text-slate-500 text-sm">Generate, manage, and publish student report cards.</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                    <button
                        onClick={() => setCurriculum('CBC')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${curriculum === 'CBC'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        CBC
                    </button>
                    <button
                        onClick={() => setCurriculum('IGCSE')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${curriculum === 'IGCSE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        IGCSE
                    </button>
                </div>
            </div>

            {/* Bottom Row: Filters and Actions */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center border-t border-slate-100 dark:border-slate-700 pt-4">

                {/* Filters Group */}
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <Dropdown
                        id="year" label="year"
                        value={filters.year}
                        optionsList={options.years}
                        minWidth="min-w-[100px]"
                    />
                    <Dropdown
                        id="term" label="term"
                        value={filters.term}
                        optionsList={options.terms}
                    />
                    <Dropdown
                        id="class" label="class"
                        value={filters.class}
                        optionsList={options.classes}
                        minWidth="min-w-[130px]"
                    />
                    <Dropdown
                        id="stream" label="stream"
                        value={filters.stream}
                        optionsList={options.streams}
                    />
                    <Dropdown
                        id="exam" label="exam"
                        value={filters.exam}
                        optionsList={options.exams}
                        minWidth="min-w-[150px]"
                    />
                </div>

                {/* Actions Group */}
                <div className="flex gap-2 w-full lg:w-auto justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Printer size={16} />
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => setShowBuilderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                        <PenTool size={16} />
                        <span className="hidden sm:inline">Open Builder</span>
                    </button>
                    <button className={`flex items-center gap-2 px-6 py-2 text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 ${curriculum === 'CBC'
                        ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200 dark:shadow-teal-900/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/20'
                        }`}>
                        <FileText size={18} />
                        <span>Generate Reports</span>
                    </button>
                </div>
            </div>

            <ReportBuilderSetupModal
                isOpen={showBuilderModal}
                onClose={() => setShowBuilderModal(false)}
                curriculum={curriculum}
            />
        </div>
    );
};

export default ReportsHeader;
