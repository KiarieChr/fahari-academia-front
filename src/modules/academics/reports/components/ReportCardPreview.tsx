import React from 'react';
import { X, Download, Printer, Share2 } from 'lucide-react';

const ReportCardPreview = ({ isOpen, onClose, student, curriculum }) => {
    if (!isOpen) return null;

    const themeColor = curriculum === 'CBC' ? 'teal' : 'indigo';
    const borderColor = curriculum === 'CBC' ? 'border-teal-200' : 'border-indigo-200';
    const bgColor = curriculum === 'CBC' ? 'bg-teal-50' : 'bg-indigo-50';
    const textColor = curriculum === 'CBC' ? 'text-teal-900' : 'text-indigo-900';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-3xl h-[90vh] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header Actions */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report Card Preview</h3>
                        <p className="text-sm text-slate-500">{student.name} - {student.adm}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Printer size={16} /> Print
                        </button>
                        <button className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-black rounded-lg shadow-sm hover:opacity-90 transition-opacity bg-${themeColor}-600`}>
                            <Download size={16} /> Download PDF
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors ml-2">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Report Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="bg-white mx-auto max-w-[210mm] min-h-[297mm] shadow-lg p-10 md:p-12 text-slate-900 relative">

                        {/* School Header */}
                        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                            <div className="w-20 h-20 bg-slate-200 mx-auto rounded-full mb-3 flex items-center justify-center font-bold text-slate-400">LOGO</div>
                            <h1 className="text-3xl font-serif font-bold tracking-wide uppercase">Fahari Academy</h1>
                            <p className="text-sm font-serif italic mt-1">"Excellence in Everything"</p>
                            <p className="text-xs mt-2 font-bold uppercase tracking-wider">P.O. Box 12345 - 00100, Nairobi | Tel: +254 700 000 000</p>
                        </div>

                        {/* Student Details */}
                        <div className={`grid grid-cols-2 gap-6 p-6 ${bgColor} border ${borderColor} rounded-xl mb-8`}>
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Student Name</span>
                                    <span className="font-bold">{student.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Admission No.</span>
                                    <span className="font-bold">{student.adm}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Class</span>
                                    <span className="font-bold">{student.class}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Term</span>
                                    <span className="font-bold">Term 3, 2024</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Curriculum</span>
                                    <span className="font-bold">{curriculum}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-300 pb-1">
                                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Position</span>
                                    <span className="font-bold">3 / 45</span>
                                </div>
                            </div>
                        </div>

                        {/* Academic Performance Table */}
                        <div className="mb-8">
                            <h3 className={`font-bold text-lg mb-3 uppercase border-b-2 ${borderColor} pb-1 ${textColor}`}>Academic Performance</h3>
                            <table className="w-full text-sm border-collapse border border-slate-300">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border border-slate-300 px-3 py-2 text-left">Subject</th>
                                        <th className="border border-slate-300 px-3 py-2 text-center">Score</th>
                                        <th className="border border-slate-300 px-3 py-2 text-center">Grade</th>
                                        <th className="border border-slate-300 px-3 py-2 text-left">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { sub: 'Mathematics', score: 85, grade: 'A', remark: 'Excellent performance.' },
                                        { sub: 'English', score: 78, grade: 'A-', remark: 'Very good score.' },
                                        { sub: 'Science', score: 82, grade: 'A', remark: 'Good understanding of concepts.' },
                                        { sub: 'Social Studies', score: 70, grade: 'B+', remark: 'Good effort.' },
                                        { sub: 'Kiswahili', score: 88, grade: 'A', remark: 'Outstanding.' },
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="border border-slate-300 px-3 py-2 font-bold">{row.sub}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-center">{row.score}</td>
                                            <td className="border border-slate-300 px-3 py-2 text-center font-bold">{row.grade}</td>
                                            <td className="border border-slate-300 px-3 py-2 italic">{row.remark}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="border border-slate-300 px-3 py-2 text-right">TOTAL</td>
                                        <td className="border border-slate-300 px-3 py-2 text-center">403</td>
                                        <td className="border border-slate-300 px-3 py-2 text-center">A-</td>
                                        <td className="border border-slate-300 px-3 py-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Remarks */}
                        <div className="grid grid-cols-1 gap-6 mb-12">
                            <div className="border border-slate-300 p-4 rounded-lg">
                                <h4 className="font-bold text-xs uppercase tracking-wider opacity-70 mb-2">Class Teacher's Remarks</h4>
                                <p className="font-serif italic">Alex is a disciplined and hardworking student. He participates actively in class and has shown consistent improvement.</p>
                            </div>
                            <div className="border border-slate-300 p-4 rounded-lg">
                                <h4 className="font-bold text-xs uppercase tracking-wider opacity-70 mb-2">Principal's Remarks</h4>
                                <p className="font-serif italic">Promoted to the next grade. Keep up the excellent spirit.</p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-3 gap-8 mt-20">
                            <div className="text-center">
                                <div className="border-b border-slate-400 mb-2 h-8"></div>
                                <span className="text-xs font-bold uppercase">Class Teacher</span>
                            </div>
                            <div className="text-center">
                                <div className="border-b border-slate-400 mb-2 h-8"></div>
                                <span className="text-xs font-bold uppercase">Principal</span>
                            </div>
                            <div className="text-center relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 border-2 border-slate-300 rounded-full flex items-center justify-center opacity-30 rotate-12">
                                    STAMP
                                </div>
                                <div className="border-b border-slate-400 mb-2 h-8"></div>
                                <span className="text-xs font-bold uppercase">Official Stamp</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportCardPreview;
