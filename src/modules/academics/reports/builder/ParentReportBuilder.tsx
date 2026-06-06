import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BuilderSidebar from './components/BuilderSidebar';
import ReportCanvas from './components/ReportCanvas';

const ParentReportBuilder = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize state from navigation state or defaults
    const [curriculum, setCurriculum] = useState(location.state?.curriculum || 'CBC');
    const [config, setConfig] = useState({
        year: location.state?.year || '2024',
        term: location.state?.term || 'Term 3',
        class: location.state?.class || 'Grade 4',
        student: location.state?.student || 'ADM-001',
        showAttendance: true,
        showTeacherInfo: true,
        showComparison: false,
        showSignatures: true
    });

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden">
            {/* Sidebar Configuration */}
            {/* Assuming BuilderSidebar is fixed w-80 */}
            <BuilderSidebar config={config} setConfig={setConfig} curriculum={curriculum} />

            {/* Main Preview Area */}
            <div className="flex-1 flex flex-col ml-80 h-full">
                {/* Top Nav */}
                <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/academics/reports')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Report Builder</h1>

                        {/* Curriculum Toggle in Header */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg ml-6">
                            <button
                                onClick={() => setCurriculum('CBC')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${curriculum === 'CBC' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'
                                    }`}
                            >
                                CBC
                            </button>
                            <button
                                onClick={() => setCurriculum('IGCSE')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${curriculum === 'IGCSE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                                    }`}
                            >
                                IGCSE
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">Live Preview Mode</span>
                    </div>
                </div>

                {/* Canvas Scroll Area */}
                <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 custom-scrollbar">
                    <ReportCanvas config={config} curriculum={curriculum} />
                </div>
            </div>
        </div>
    );
};

export default ParentReportBuilder;
