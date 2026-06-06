import React from 'react';
import SchoolHeader from './ReportSections/SchoolHeader';
import StudentInfo from './ReportSections/StudentInfo';
import AttendanceCard from './ReportSections/AttendanceCard';
import SubjectTable from './ReportSections/SubjectTable';
import TeacherRemarks from './ReportSections/TeacherRemarks';
import Signatures from './ReportSections/Signatures';

const ReportCanvas = ({ config, curriculum }) => {
    // Mock Data based on selection
    const studentData = {
        name: config.student === 'ADM-002' ? 'Sarah Williams' : 'Alex Johnson',
        adm: config.student || 'ADM-001',
        class: config.class || 'Grade 4 East',
        term: config.term,
        year: config.year
    };

    return (
        <div className="flex justify-center p-8 min-h-full">
            {/* A4 Paper Container */}
            <div className="bg-white text-slate-900 shadow-2xl w-[210mm] min-h-[297mm] p-10 md:p-12 relative print:shadow-none print:w-full print:m-0">

                {/* 1. School Identity */}
                <SchoolHeader />

                {/* 2. Student Information */}
                <div className="my-6">
                    <StudentInfo student={studentData} curriculum={curriculum} />
                </div>

                {/* 3. Attendance Summary */}
                {config.showAttendance && (
                    <div className="mb-6">
                        <AttendanceCard />
                    </div>
                )}

                {/* 4. Subject Performance */}
                <div className="mb-6">
                    <SubjectTable curriculum={curriculum} showComparison={config.showComparison} />
                </div>

                {/* 5. Teacher Remarks & Info */}
                <div className="mb-8">
                    <TeacherRemarks showProfile={config.showTeacherInfo} />
                </div>

                {/* 6. Signatures */}
                {config.showSignatures && (
                    <div className="mt-auto pt-10">
                        <Signatures />
                    </div>
                )}

                {/* Footer */}
                <div className="absolute bottom-6 left-12 right-12 border-t border-slate-300 pt-2 flex justify-between text-[10px] text-slate-400 font-mono uppercase">
                    <span>Generated on {new Date().toLocaleDateString()}</span>
                    <span>System Generated Report • Confidential</span>
                </div>
            </div>
        </div>
    );
};

export default ReportCanvas;
