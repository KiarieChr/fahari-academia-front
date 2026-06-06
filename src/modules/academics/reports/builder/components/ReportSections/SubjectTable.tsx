import React from 'react';

const SubjectTable = ({ curriculum, showComparison }) => {
    const data = [
        { sub: 'Mathematics', mark: 85, grade: 'A', remarks: 'Excellent grasp of concepts.' },
        { sub: 'English Language', mark: 78, grade: 'A-', remarks: 'Very good expression.' },
        { sub: 'Integrated Science', mark: 82, grade: 'A', remarks: 'Good practical skills.' },
        { sub: 'Social Studies', mark: 70, grade: 'B+', remarks: 'Active usage of maps.' },
        { sub: 'Creative Arts', mark: 88, grade: 'A', remarks: 'Outstanding creativity.' },
    ];

    const meanScore = 80.6;
    const meanGrade = 'A-';

    return (
        <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-2 mb-3 flex justify-between items-center">
                <span>Academic Performance</span>
                {showComparison && <span className="text-xs font-normal text-slate-500 normal-case">Class Avg: 72%</span>}
            </h3>

            <table className="w-full text-sm border-collapse border border-slate-200">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="border border-slate-200 px-4 py-2 text-left font-bold text-slate-700">Subject</th>
                        <th className="border border-slate-200 px-4 py-2 text-center font-bold text-slate-700">Marks</th>
                        <th className="border border-slate-200 px-4 py-2 text-center font-bold text-slate-700">Grade</th>
                        <th className="border border-slate-200 px-4 py-2 text-left font-bold text-slate-700">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td className="border border-slate-200 px-4 py-3 font-semibold text-slate-800">{row.sub}</td>
                            <td className="border border-slate-200 px-4 py-3 text-center text-slate-600">{row.mark}%</td>
                            <td className={`border border-slate-200 px-4 py-3 text-center font-bold ${row.grade.startsWith('A') ? 'text-emerald-600' : 'text-blue-600'
                                }`}>{row.grade}</td>
                            <td className="border border-slate-200 px-4 py-3 text-slate-500 italic text-xs">{row.remarks}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td className="border border-slate-200 px-4 py-3 text-right text-slate-900">OVERALL MEAN</td>
                        <td className="border border-slate-200 px-4 py-3 text-center text-slate-900">{meanScore}%</td>
                        <td className="border border-slate-200 px-4 py-3 text-center text-emerald-700">{meanGrade}</td>
                        <td className="border border-slate-200"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default SubjectTable;
