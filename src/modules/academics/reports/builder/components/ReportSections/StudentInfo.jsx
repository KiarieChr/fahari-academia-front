import React from 'react';

const StudentInfo = ({ student, curriculum }) => {
    return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-2 gap-x-12 gap-y-3">
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</span>
                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</span>
                <span className="font-bold text-slate-900 text-sm">{student.year}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admission No</span>
                <span className="font-bold text-slate-900 text-sm">{student.adm}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term / Session</span>
                <span className="font-bold text-slate-900 text-sm">{student.term}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class / Stream</span>
                <span className="font-bold text-slate-900 text-sm">{student.class}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curriculum</span>
                <span className="font-bold text-slate-900 text-sm">{curriculum}</span>
            </div>
        </div>
    );
};

export default StudentInfo;
