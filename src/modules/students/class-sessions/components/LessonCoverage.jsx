import React from 'react';

const LessonCoverage = () => {
    const subjects = [
        { name: 'Mathematics', class: 'Grade 4', planned: 20, covered: 18, status: 'On Track', color: 'green' },
        { name: 'English', class: 'Grade 5', planned: 20, covered: 15, status: 'Behind', color: 'red' },
        { name: 'Science', class: 'Grade 6', planned: 18, covered: 18, status: 'Completed', color: 'blue' },
        { name: 'Social Studies', class: 'Grade 4', planned: 15, covered: 12, status: 'On Track', color: 'green' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Syllabus Coverage</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4 text-center">Progress</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subjects.map((sub, idx) => {
                            const percent = Math.round((sub.covered / sub.planned) * 100);
                            return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{sub.name}</td>
                                    <td className="px-6 py-4">{sub.class}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-${sub.color}-500`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold w-8 text-right">{percent}%</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            {sub.covered} / {sub.planned} Topics
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${sub.color}-50 text-${sub.color}-700 border border-${sub.color}-200`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LessonCoverage;
